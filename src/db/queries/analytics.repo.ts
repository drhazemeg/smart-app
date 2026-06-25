import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";
export const analyticsRepo = {
	async getAppointmentsInRange(clinicId: string, start: Date, end: Date) {
		return await db.query.appointment.findMany({
			where: {
				clinicId,
				appointmentDate: {
					gte: start,
					lte: end
				}
			}
		});
	},

	async getClinicRevenue(clinicId: string, start: Date, end: Date) {
		// Assuming a reporting view or standard aggregation
		return await db
			.select({ total: sql<number>`SUM(price)` })
			.from(schema.appointment)
			.where(
				and(
					eq(schema.appointment.clinicId, clinicId),
					gte(schema.appointment.appointmentDate, start),
					lte(schema.appointment.appointmentDate, end)
				)
			);
	},
	/**
	 * Get appointments grouped by status counts
	 */
	async getAppointmentCountsByStatus(clinicId: string, startDate?: Date, endDate?: Date, tx?: DBorTx) {
		const client = tx ?? db;
		const conditions = [eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)];

		if (startDate) {
			conditions.push(gte(schema.appointment.appointmentDate, startDate));
		}
		if (endDate) {
			conditions.push(lte(schema.appointment.appointmentDate, endDate));
		}

		const results = await client
			.select({
				status: schema.appointment.status,
				count: count()
			})
			.from(schema.appointment)
			.where(and(...conditions))
			.groupBy(schema.appointment.status);

		return results.reduce(
			(acc, curr) => {
				if (curr.status) {
					acc[curr.status] = Number(curr.count);
				}
				return acc;
			},
			{} as Record<string, number>
		);
	},

	/**
	 * Get monthly appointment data for a clinic
	 */
	async getMonthlyAppointmentData(clinicId: string, year: number, tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.select({
				month: sql<number>`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`,
				count: count(),
				totalRevenue: sql<number>`SUM(${schema.appointment.appointmentPrice})`
			})
			.from(schema.appointment)
			.where(
				and(
					eq(schema.appointment.clinicId, clinicId),
					eq(schema.appointment.isDeleted, false),
					sql`EXTRACT(YEAR FROM ${schema.appointment.appointmentDate}) = ${year}`
				)
			)
			.groupBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`)
			.orderBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`);
	},

	/**
	 * Get new patients count for a date range
	 */
	async getNewPatientsCount(clinicId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.$count(
			schema.patient,
			and(
				eq(schema.patient.clinicId, clinicId),
				eq(schema.patient.isDeleted, false),
				gte(schema.patient.createdAt, startDate),
				lte(schema.patient.createdAt, endDate)
			)
		);
	},

	/**
	 * Get patients with their creation dates
	 */
	async getPatientsInDateRange(clinicId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				createdAt: { gte: startDate, lte: endDate }
			},
			columns: {
				id: true,
				createdAt: true,
				firstName: true,
				lastName: true
			}
		});
	},

	/**
	 * Get demographic data for patients
	 */
	async getPatientDemographics(clinicId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				createdAt: { gte: startDate, lte: endDate }
			},
			columns: {
				id: true,
				gender: true,
				dateOfBirth: true,
				createdAt: true
			}
		});
	},

	/**
	 * Get vaccine inventory status for immunization metrics
	 */
	async getVaccineInventoryStatus(clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		const inventory = await client.query.vaccineInventory.findMany({
			where: { clinicId },
			orderBy: { expirationDate: "asc" }
		});

		const now = new Date();
		const expiringSoon = inventory.filter(v => {
			const daysUntilExpiry = Math.ceil(
				((v.expirationDate?.getTime() ?? now.getTime()) - now.getTime()) / (1000 * 60 * 60 * 24)
			);
			return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
		});

		const expired = inventory.filter(v => v.expirationDate && v.expirationDate < now);
		const lowStock = inventory.filter(v => v.quantity < 10);

		return {
			totalVaccines: inventory.length,
			totalDoses: inventory.reduce((sum, v) => sum + (v.quantity ?? 0), 0),
			expiringSoon,
			expired,
			lowStock,
			inventoryByVaccine: inventory
		};
	},

	/**
	 * Get overdue immunizations
	 */
	async getOverdueImmunizations(clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.immunization.findMany({
			where: {
				clinicId,
				isDeleted: false,
				status: "OVERDUE"
			},
			with: {
				patient: {
					with: {
						guardians: true
					}
				}
			},
			orderBy: { date: "asc" }
		});
	},

	/**
	 * Get immunization coverage metrics
	 */
	async getImmunizationCoverage(clinicId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		const coverageResults = await client
			.select({
				status: schema.immunization.status,
				count: count()
			})
			.from(schema.immunization)
			.where(
				and(
					eq(schema.immunization.clinicId, clinicId),
					eq(schema.immunization.isDeleted, false),
					gte(schema.immunization.date, startDate),
					lte(schema.immunization.date, endDate)
				)
			)
			.groupBy(schema.immunization.status);

		const byStatus = coverageResults.reduce(
			(acc, curr) => {
				const status = curr.status ?? "UNKNOWN";
				acc[status] = Number(curr.count);
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			totalImmunizations: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
			byStatus
		};
	},

	/**
	 * Get prescriptions for analytics
	 */
	async getPrescriptionsForAnalytics(clinicId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.prescription.findMany({
			where: {
				clinicId,
				issuedDate: { gte: startDate, lte: endDate }
			},
			with: {
				prescribedItems: {
					with: {
						drug: true
					}
				},
				doctor: true
			}
		});
	},

	/**
	 * Get top conditions by prevalence
	 */
	async getTopConditions(clinicId: string, startDate: Date, endDate: Date, limit = 10, tx?: DBorTx) {
		const client = tx ?? db;
		const diagnoses = await client.query.diagnosis.findMany({
			where: {
				clinicId,
				date: { gte: startDate, lte: endDate },
				isDeleted: false
			},
			columns: {
				diagnosis: true
			}
		});

		// Count occurrences of each diagnosis
		const conditionCounts = new Map<string, number>();
		for (const d of diagnoses) {
			if (d.diagnosis) {
				const count = conditionCounts.get(d.diagnosis) || 0;
				conditionCounts.set(d.diagnosis, count + 1);
			}
		}

		const totalPatients = await this.getNewPatientsCount(clinicId, startDate, endDate, tx);

		return Array.from(conditionCounts.entries())
			.map(([condition, count]) => ({
				condition,
				prevalence: totalPatients > 0 ? (count / totalPatients) * 100 : 0,
				affectedPatients: count
			}))
			.sort((a, b) => b.prevalence - a.prevalence)
			.slice(0, limit);
	},

	/**
	 * Get seasonal pattern data
	 */
	async getSeasonalAppointmentData(clinicId: string, year: number, tx?: DBorTx) {
		const client = tx ?? db;
		const seasons = [
			{ name: "Winter", months: [12, 1, 2] },
			{ name: "Spring", months: [3, 4, 5] },
			{ name: "Summer", months: [6, 7, 8] },
			{ name: "Fall", months: [9, 10, 11] }
		];

		const seasonData: {
			season: string;
			totalAppointments: number;
			conditions: Record<string, number>;
		}[] = [];
		for (const season of seasons) {
			const appointments = await client.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					appointmentDate: {
						gte: new Date(year, season.months[0] ?? 0 - 1, 1),
						lte: new Date(year, season.months.at(-1) ?? 0, 31)
					}
				},
				with: {
					diagnoses: true
				}
			});

			seasonData.push({
				season: season.name,
				totalAppointments: appointments.length,
				conditions: appointments
					.flatMap(a => a.diagnoses?.flatMap(diag => diag as unknown as { diagnosis: string | null }) || [])
					.reduce(
						(acc: Record<string, number>, diag: { diagnosis: string | null }) => {
							if (diag?.diagnosis) {
								acc[diag.diagnosis] = (acc[diag.diagnosis] || 0) + 1;
							}
							return acc;
						},
						{} as Record<string, number>
					)
			});
		}

		return seasonData;
	}
};

export type AnalyticsRepo = typeof analyticsRepo;
