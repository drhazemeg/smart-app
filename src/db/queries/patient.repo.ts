// db/repositories/patient.repo.ts

import { db } from "#/db/client.server";
import { ageCalculator } from "@/utils/age-calculator";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import * as schema from "../schema";
import type { GuardianCreateInput, GuardianUpdateInput, PatientCreateInput, PatientUpdateInput } from "../zod";

// import { getPatientByClinicId } from "#/functions";

const M = /\d+/;
type LMS = { L: number; M: number; S: number };
type LMSInput = LMS | { l: number; m: number; s: number };

/**
 * Calculates Z-Score using the LMS method.
 * @param measurement The patient's actual measurement (weight/height)
 * @param lms The reference parameters (L, M, S) for the patient's age and gender
 */
function calculateZScore(measurement: number, lms: LMSInput): number {
	const L = "L" in lms ? lms.L : lms.l;
	const M = "M" in lms ? lms.M : lms.m;
	const S = "S" in lms ? lms.S : lms.s;

	if (Math.abs(L) < 0.0001) {
		// Case where L is effectively 0
		return Math.log(measurement / M) / S;
	}

	// Standard LMS formula
	return ((measurement / M) ** L - 1) / (L * S);
}

export const patientRepo = {
	// Patient CRUD

	validatePatientData(data: PatientCreateInput | PatientUpdateInput) {
		if (data.email && !data.email.includes("@")) {
			return { valid: false, error: "Invalid email address" };
		}
		if (data.phone && data.phone.length < 5) {
			return { valid: false, error: "Phone number too short" };
		}
		if (data.dateOfBirth && data.dateOfBirth > new Date()) {
			return { valid: false, error: "Date of birth cannot be in the future" };
		}
		return { valid: true };
	},
	async getPatientByClinicId(clinicId: string) {
		return await db.query.patient.findFirst({
			where: { clinicId },
			with: {
				user: true,
				clinic: true
			}
		});
	},

	async getPatientById(id: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { id, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true
			}
		});
	},

	async getPatientsByIds(ids: string[], clinicId: string) {
		return await db.query.patient.findMany({
			where: { id: { in: ids }, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true
			}
		});
	},

	async getPatientByClinic(clinicId: string) {
		return await db.query.patient.findFirst({
			where: { clinicId, isDeleted: false },
			orderBy: { createdAt: "asc" }
		});
	},
	async getPatientAppointments(patientId: string, clinicId: string, limit: number, offset: number) {
		return await db.query.appointment.findMany({
			where: { patientId, clinicId, isDeleted: false },
			limit,
			offset,
			orderBy: { appointmentDate: "desc" }
		});
	},
	async updateAlerts(alertIds: string[], resolved: boolean, resolvedBy?: string, resolutionNote?: string) {
		if (alertIds.length === 0) {
			return [];
		}

		return await db
			.update(schema.growthAlert)
			.set({
				isResolved: resolved,
				resolvedBy: resolvedBy || null,
				resolutionNote: resolutionNote || null
			})
			.where(inArray(schema.growthAlert.id, alertIds))
			.returning();
	},

	async calculateZScores(params: {
		gender: "boy" | "girl";
		ageMonths: number;
		weightKg?: number;
		heightCm?: number;
		referenceSource: "EGYPT_2020";
	}) {
		// 1. FETCH LMS DATA
		// In production, you should query your database for the specific reference table.
		// Example: SELECT * FROM growth_references WHERE source = 'EGYPT_2020'
		// AND age_months = Math.round(params.ageMonths) AND gender = params.gender
		const weightLMS = await db.query.lmsReference.findFirst({
			where: {
				referenceSource: params.referenceSource,
				ageMonths: Math.round(params.ageMonths),
				gender: params.gender,
				metric: "WEIGHT"
			}
		});

		const heightLMS = await db.query.lmsReference.findFirst({
			where: {
				referenceSource: params.referenceSource,
				ageMonths: Math.round(params.ageMonths),
				gender: params.gender,
				metric: "HEIGHT"
			}
		});

		// 2. CALCULATE
		return {
			weightForAgeZ: params.weightKg && weightLMS ? calculateZScore(params.weightKg, weightLMS) : null,
			heightForAgeZ: params.heightCm && heightLMS ? calculateZScore(params.heightCm, heightLMS) : null
		};
	},

	async getPatientWithGrowthSummary(id: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { id, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true,
				measurements: true,
				growthAlerts: true
			}
		});
	},
	async updateAlertsForPatient(alerts: { id: string; isResolved: boolean }[]) {
		await Promise.all(
			alerts.map(alert =>
				db
					.update(schema.growthAlert)
					.set({ isResolved: alert.isResolved })
					.where(eq(schema.growthAlert.id, alert.id))
			)
		);
	},
	async generateMRN(clinicId: string) {
		const lastPatient = await db.query.patient.findFirst({
			where: {
				clinicId,
				isDeleted: false
			},
			orderBy: (p, { desc }) => desc(p.createdAt)
		});

		if (lastPatient?.mrn) {
			const match = lastPatient.mrn.match(M);
			if (match) {
				const nextNumber = Number.parseInt(match[0], 10) + 1;
				return `MRN-${nextNumber.toString().padStart(6, "0")}`;
			}
		}
		return "MRN-000001";
	},
	async getPatientsNeedingAttention(clinicId: string) {
		return await db.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				growthAlerts: { isResolved: false }
			},
			with: {
				user: true,
				growthAlerts: true
			}
		});
	},
	async getPatientByUserId(userId: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { userId, clinicId, isDeleted: false },
			with: { user: true }
		});
	},

	async getPatientByMRN(mrn: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { mrn, clinicId, isDeleted: false },
			with: { user: true }
		});
	},

	async searchPatients(params: { q: string; limit: number; clinicId?: string }) {
		const { q, limit, clinicId } = params;

		const whereClause = {
			AND: [
				{ clinicId: { eq: clinicId } },
				{
					OR: [
						{ firstName: { ilike: `%${q}%` } },
						{ lastName: { ilike: `%${q}%` } },
						{ email: { ilike: `%${q}%` } },
						{ phone: { ilike: `%${q}%` } }
					]
				}
			]
		};

		if (clinicId) {
			whereClause.AND.push({ clinicId: { eq: clinicId } });
		}

		return await db.query.patient.findMany({
			where: whereClause,
			with: { user: true },
			limit
		});
	},

	async listPatients(params: {
		clinicId: string;
		limit: number;
		offset: number;
		search?: string;
		status?: (typeof schema.statusEnum.enumValues)[number];
		isActive?: boolean;
		gender?: (typeof schema.genderEnum.enumValues)[number];
		bloodGroup?: (typeof schema.bloodGroupEnum.enumValues)[number];
	}) {
		const { clinicId, limit, offset, search, status, isActive, gender, bloodGroup } = params;

		const whereClause = {
			AND: [
				{ clinicId: { eq: clinicId } },
				{ isDeleted: { eq: false } },
				...(status ? [{ status: { eq: status } }] : []),
				...(isActive === undefined ? [] : [{ isActive: { eq: isActive } }]),
				...(gender ? [{ gender: { eq: gender } }] : []),
				...(bloodGroup ? [{ bloodGroup: { eq: bloodGroup } }] : []),
				...(search
					? [
							{
								OR: [
									{ firstName: { ilike: `%${search}%` } },
									{ lastName: { ilike: `%${search}%` } },
									{ email: { ilike: `%${search}%` } },
									{ phone: { ilike: `%${search}%` } }
								]
							}
						]
					: [])
			]
		};

		// Execute queries in parallel
		const [patients, total] = await Promise.all([
			db.query.patient.findMany({
				where: whereClause,
				with: { user: true },
				limit,
				offset,
				orderBy: (p, { asc }) => asc(p.lastName)
			}),
			db
				.select({ count: count() })
				.from(schema.patient)
				.where(and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false)))
		]);

		return {
			patients,
			total: Number(total[0]?.count ?? 0)
		};
	},

	async createPatient(data: schema.NewPatient) {
		const [result] = await db.insert(schema.patient).values(data).returning();
		return result;
	},

	async updatePatient(id: string, data: Partial<schema.NewPatient>) {
		const [result] = await db
			.update(schema.patient)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.patient.id, id))
			.returning();
		return result;
	},

	async softDeletePatient(id: string, clinicId: string) {
		const [result] = await db
			.update(schema.patient)
			.set({ deletedAt: new Date(), isDeleted: true })
			.where(and(eq(schema.patient.id, id), eq(schema.patient.clinicId, clinicId)))
			.returning();
		return result;
	},

	async bulkUpdatePatientStatus(patientIds: string[], isActive: boolean) {
		return await db
			.update(schema.patient)
			.set({ isActive, updatedAt: new Date() })
			.where(inArray(schema.patient.id, patientIds))
			.returning();
	},

	// Patient with relations
	async getPatientWithFullHistory(patientId: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { id: patientId, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true,
				guardians: {
					with: { user: true }
				},
				appointments: {
					where: { isDeleted: false },
					with: { doctor: true, service: true },
					orderBy: { appointmentDate: "desc" }
				},
				medicalRecords: {
					with: {
						doctor: true,
						appointment: true,
						vitalSigns: true,
						prescriptions: {
							with: {
								prescribedItems: {
									with: { drug: true }
								}
							}
						}
					},
					orderBy: { createdAt: "desc" }
				},
				vitalSigns: {
					orderBy: { recordedAt: "desc" },
					limit: 10
				},
				measurements: {
					orderBy: { measurementDate: "desc" }
				},
				immunizations: {
					with: { administeredBy: true },
					orderBy: { date: "desc" }
				},
				labTests: {
					with: { service: true },
					orderBy: { testDate: "desc" }
				},
				prescriptions: {
					with: {
						doctor: true,
						prescribedItems: {
							with: { drug: true }
						}
					},
					orderBy: { issuedDate: "desc" }
				},
				payments: {
					orderBy: { paymentDate: "desc" }
				},
				feedingLogs: {
					orderBy: { date: "desc" }
				},
				developmentalMilestones: {
					orderBy: { dateRecorded: "desc" }
				}
			}
		});
	},

	async getPatientUpcomingAppointments(patientId: string, clinicId: string) {
		return await db.query.appointment.findMany({
			where: {
				patientId,
				clinicId,
				isDeleted: false,
				appointmentDate: { gte: new Date() },
				status: { notIn: ["CANCELLED", "COMPLETED"] }
			},
			with: { doctor: true, service: true, clinic: true },
			orderBy: { appointmentDate: "asc" }
		});
	},

	// Patient stats
	async getPatientStats(patientId: string) {
		const [appointmentStats] = await db
			.select({
				total: sql<number>`count(*)`,
				completed: sql<number>`sum(case when ${schema.appointment.status} = 'COMPLETED' then 1 else 0 end)`,
				cancelled: sql<number>`sum(case when ${schema.appointment.status} = 'CANCELLED' then 1 else 0 end)`,
				lastVisit: sql<Date>`max(case when ${schema.appointment.status} = 'COMPLETED' then ${schema.appointment.appointmentDate} else null end)`,
				nextAppointment: sql<Date>`min(case when ${schema.appointment.appointmentDate} > now() and ${schema.appointment.status} not in ('CANCELLED', 'COMPLETED') then ${schema.appointment.appointmentDate} else null end)`
			})
			.from(schema.appointment)
			.where(and(eq(schema.appointment.patientId, patientId), eq(schema.appointment.isDeleted, false)));

		const [paymentStats] = await db
			.select({
				total: sql<number>`count(*)`,
				paidAmount: sql<number>`coalesce(sum(${schema.payment.amountPaid}), 0)`,
				totalAmount: sql<number>`coalesce(sum(${schema.payment.totalAmount}), 0)`
			})
			.from(schema.payment)
			.where(and(eq(schema.payment.patientId, patientId), eq(schema.payment.isDeleted, false)));

		const [prescriptionStats] = await db
			.select({
				total: sql<number>`count(*)`,
				active: sql<number>`sum(case when ${schema.prescription.status} = 'active' then 1 else 0 end)`
			})
			.from(schema.prescription)
			.where(eq(schema.prescription.patientId, patientId));

		const [immunizationCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.immunization)
			.where(and(eq(schema.immunization.patientId, patientId), eq(schema.immunization.isDeleted, false)));

		return {
			totalAppointments: Number(appointmentStats?.total ?? 0),
			completedAppointments: Number(appointmentStats?.completed ?? 0),
			cancelledAppointments: Number(appointmentStats?.cancelled ?? 0),
			totalPayments: Number(paymentStats?.total ?? 0),
			paidAmount: Number(paymentStats?.paidAmount ?? 0),
			dueAmount: Number(paymentStats?.totalAmount ?? 0) - Number(paymentStats?.paidAmount ?? 0),
			totalPrescriptions: Number(prescriptionStats?.total ?? 0),
			activePrescriptions: Number(prescriptionStats?.active ?? 0),
			totalImmunizations: Number(immunizationCount?.count ?? 0),
			lastVisit: appointmentStats?.lastVisit ?? null,
			nextAppointment: appointmentStats?.nextAppointment ?? null
		};
	},

	// Guardian
	async getGuardiansByPatient(patientId: string) {
		return await db.query.guardian.findMany({
			where: { patients: { id: patientId } },
			with: { user: true }
		});
	},

	async createGuardian(data: schema.NewGuardian) {
		const [result] = await db.insert(schema.guardian).values(data).returning();
		return result;
	},

	// Patients by date range
	async getPatientsCreatedBetween(clinicId: string, startDate: Date, endDate: Date) {
		return await db.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				createdAt: { gte: startDate, lte: endDate }
			},
			columns: { createdAt: true, id: true, firstName: true, lastName: true }
		});
	},

	async getPatientsByAgeRange(clinicId: string, minAgeMonths: number, maxAgeMonths: number) {
		const minDate = new Date();
		minDate.setMonth(minDate.getMonth() - maxAgeMonths);
		const maxDate = new Date();
		maxDate.setMonth(maxDate.getMonth() - minAgeMonths);

		return await db.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				dateOfBirth: { gte: minDate, lte: maxDate }
			},
			with: {
				user: true,
				guardians: true
			},
			orderBy: { dateOfBirth: "desc" }
		});
	},

	async getPatientsWithAppointmentsThisWeek(clinicId: string) {
		const startOfWeek = new Date();
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(endOfWeek.getDate() + 7);

		return await db.query.appointment.findMany({
			where: {
				clinicId,
				isDeleted: false,
				status: "CONFIRMED",
				appointmentDate: {
					gte: startOfWeek,
					lte: endOfWeek
				}
			},
			with: {
				patient: {
					with: {
						guardians: true
					}
				},
				doctor: true
			},
			orderBy: { appointmentDate: "asc" }
		});
	},

	async getPatient(patientId: string, clinicId: string) {
		try {
			const patient = await db.query.patient.findFirst({
				where: { id: patientId, clinicId, isDeleted: false },
				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
							image: true,
							phone: true
						}
					},
					guardians: true,
					measurements: {
						orderBy: { measurementDate: "desc" },
						limit: 50
					},
					growthAlerts: {
						where: { isResolved: false },
						orderBy: { createdAt: "desc" },
						with: {
							measurement: true
						}
					},
					growthPercentileHistories: {
						orderBy: { ageMonths: "desc" },
						limit: 20
					},
					medicalRecords: {
						orderBy: { createdAt: "desc" },
						limit: 20
					},
					appointments: {
						where: { isDeleted: false },
						orderBy: { appointmentDate: "desc" },
						limit: 20
					},
					growthChartCaches: {
						where: { expiresAt: { gt: new Date() } }
					}
				}
			});

			if (!patient) {
				throw new Error("Patient not found");
			}

			// Calculate age
			const age = ageCalculator.calculate(patient.dateOfBirth);
			const ageGroup = ageCalculator.getAgeGroup(patient.dateOfBirth);

			return {
				...patient,
				age,
				ageGroup
			};
		} catch (error) {
			console.error("Error getting patient:", error);
			throw new Error("Failed to get patient");
		}
	},

	async getPatientGrowthPercentiles(patientId: string, clinicId: string) {
		const patient = await db.query.patient.findFirst({
			where: { id: patientId, clinicId, isDeleted: false },
			with: {
				measurements: {
					orderBy: { measurementDate: "asc" }
				}
			}
		});

		if (!patient?.measurements.length) {
			return null;
		}

		const whoStandards = await db.query.lmsReference.findMany({
			where: {
				gender: patient.gender as "boy" | "girl",
				metric: "BMI"
			}
		});

		// Calculate percentiles for each growth record
		const growthWithPercentiles = patient.measurements.map(record => {
			const standard = whoStandards.find(
				s => Math.abs(Number(s.ageYM ?? 0) - Number(record.chronologicalAgeMonths ?? 0)) <= 30
			);

			let percentile: number | null = null;
			if (standard && record.bmi) {
				// Simple percentile calculation (simplified)
				if (record.bmi <= standard.sd3neg) {
					percentile = 1;
				} else if (record.bmi <= standard.sd2neg) {
					percentile = 2;
				} else if (record.bmi <= standard.sd1neg) {
					percentile = 5;
				} else if (record.bmi >= standard.sd3pos) {
					percentile = 99;
				} else if (record.bmi >= standard.sd2pos) {
					percentile = 97;
				} else if (record.bmi >= standard.sd1pos) {
					percentile = 85;
				} else {
					percentile = 50;
				}
			}

			return { ...record, percentile };
		});

		return growthWithPercentiles;
	},

	async getAppointmentStats(clinicId: string) {
		const appointmentStats = await db.$count(
			schema.appointment,
			and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false))
		);

		const [detailedStats] = await db
			.select({
				completed: sql<number>`sum(case when ${schema.appointment.status} = 'COMPLETED' then 1 else 0 end)`,
				cancelled: sql<number>`sum(case when ${schema.appointment.status} = 'CANCELLED' then 1 else 0 end)`
			})
			.from(schema.appointment)
			.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)));

		return {
			totalAppointments: appointmentStats,
			completedAppointments: detailedStats?.completed ?? 0,
			cancelledAppointments: detailedStats?.cancelled ?? 0
		};
	},

	async getPrescriptionStats(clinicId: string) {
		const prescriptionStats = await db.$count(schema.prescription, and(eq(schema.prescription.clinicId, clinicId)));

		const [detailedStats] = await db
			.select({
				active: sql<number>`sum(case when ${schema.prescription.status} = 'ACTIVE' then 1 else 0 end)`,
				completed: sql<number>`sum(case when ${schema.prescription.status} = 'COMPLETED' then 1 else 0 end)`,
				cancelled: sql<number>`sum(case when ${schema.prescription.status} = 'CANCELLED' then 1 else 0 end)`
			})
			.from(schema.prescription)
			.where(eq(schema.prescription.clinicId, clinicId));

		return {
			totalPrescriptions: prescriptionStats,
			activePrescriptions: detailedStats?.active ?? 0,
			completedPrescriptions: detailedStats?.completed ?? 0,
			cancelledPrescriptions: detailedStats?.cancelled ?? 0
		};
	},

	async getPatientsByClinicList(clinicId: string) {
		return await db.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false
			},
			with: { user: true, growthAlerts: true },
			orderBy: { lastName: "asc" }
		});
	},
	async createMeasurement(data: schema.NewMeasurement) {
		const [result] = await db.insert(schema.measurement).values(data).returning();
		return result;
	},
	async getPatientsCount(clinicId: string) {
		return await db.$count(
			schema.patient,
			and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))
		);
	},

	// Get patient full medical history
	async getPatientFullHistory(patientId: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { id: patientId, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true,
				guardians: {
					with: {
						user: true
					}
				},
				appointments: {
					where: { isDeleted: false },
					with: {
						doctor: true,
						service: true
					},
					orderBy: { appointmentDate: "desc" }
				},
				medicalRecords: {
					with: {
						doctor: true,
						appointment: true,
						diagnoses: true,
						vitalSigns: true,
						prescriptions: {
							with: {
								prescribedItems: {
									with: {
										drug: true
									}
								}
							}
						}
					},
					orderBy: { createdAt: "desc" }
				},
				diagnoses: {
					with: {
						doctor: true
					},
					orderBy: { date: "desc" }
				},
				vitalSigns: {
					orderBy: { recordedAt: "desc" },
					limit: 10
				},
				measurements: {
					orderBy: { measurementDate: "desc" }
				},
				immunizations: {
					with: {
						administeredBy: true
					},
					orderBy: { date: "desc" }
				},
				labTests: {
					with: {
						service: true
					},
					orderBy: { testDate: "desc" }
				},
				prescriptions: {
					with: {
						doctor: true,
						prescribedItems: {
							with: {
								drug: true
							}
						}
					},
					orderBy: { issuedDate: "desc" }
				},
				payments: {
					orderBy: { paymentDate: "desc" }
				},
				feedingLogs: {
					orderBy: { date: "desc" }
				},
				developmentalMilestones: {
					orderBy: { dateRecorded: "desc" }
				}
			}
		});
	},

	// Get patient growth chart data
	async getPatientGrowthData(patientId: string, clinicId: string) {
		const growthRecords = await db.query.measurement.findMany({
			where: { patientId, clinicId },
			orderBy: { measurementDate: "asc" }
		});

		// Get WHO standards for comparison
		const whoStandards = await db.query.lmsReference.findMany();

		return { growthRecords, whoStandards };
	},

	async searchPatientsByClinic(clinicId: string, searchTerm: string) {
		return await db.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				OR: [
					{ firstName: { ilike: `%${searchTerm}%` } },
					{ lastName: { ilike: `%${searchTerm}%` } },
					{ email: { ilike: `%${searchTerm}%` } },
					{ phone: { ilike: `%${searchTerm}%` } }
				]
			},
			with: {
				user: true
			},
			limit: 20
		});
	},

	async createManyPatients(data: PatientCreateInput[]) {
		return await db.insert(schema.patient).values(data).returning();
	},

	async updateManyPatients(ids: string[], data: PatientUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.patient).set(updateData).where(inArray(schema.patient.id, ids)).returning();
	},

	async deletePatient(id: string, clinicId: string) {
		const [result] = await db
			.delete(schema.patient)
			.where(and(eq(schema.patient.id, id), eq(schema.patient.clinicId, clinicId)))
			.returning();
		return result;
	},

	async restorePatient(id: string) {
		const [result] = await db
			.update(schema.patient)
			.set({ deletedAt: null })
			.where(eq(schema.patient.id, id))
			.returning();
		return result;
	},

	async createPatientWithGuardian(
		patientData: PatientCreateInput,
		guardianData?: Omit<GuardianCreateInput, "patientId">
	) {
		return await db.transaction(async tx => {
			// Create patient
			const [patient] = await tx
				.insert(schema.patient)
				.values({
					...patientData,
					id: patientData.id ?? crypto.randomUUID()
				})
				.returning();

			// Create guardian if provided
			if (guardianData && patient) {
				await tx.insert(schema.guardian).values({
					...guardianData,
					id: guardianData.id ?? crypto.randomUUID(),
					clinicId: patient.clinicId
				});
			}

			// Create initial growth record if age appropriate
			if (patient?.dateOfBirth) {
				const ageInDays = Math.floor((Date.now() - patient?.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));

				if (ageInDays <= 730) {
					// First 2 years
					await tx.insert(schema.measurement).values({
						id: crypto.randomUUID(),
						patientId: patient?.id,
						chronologicalAgeMonths: Math.floor(ageInDays / 30),
						clinicId: patient.clinicId,
						measurementDate: patient?.dateOfBirth
					});
				}
			}

			return patient;
		});
	},

	async createGuardians(data: GuardianCreateInput) {
		const [result] = await db.insert(schema.guardian).values(data).returning();
		return result;
	},

	async createManyGuardianss(data: GuardianCreateInput[]) {
		return await db.insert(schema.guardian).values(data).returning();
	},

	async updateGuardians(id: string, data: GuardianUpdateInput) {
		const updateData = { ...data };

		const [result] = await db.update(schema.guardian).set(updateData).where(eq(schema.guardian.id, id)).returning();
		return result;
	},

	async updateManyGuardianss(ids: string[], data: GuardianUpdateInput) {
		const updateData = { ...data };

		return await db.update(schema.guardian).set(updateData).where(inArray(schema.guardian.id, ids)).returning();
	},

	async deleteGuardians(id: string) {
		const [result] = await db.delete(schema.guardian).where(eq(schema.guardian.id, id)).returning();
		return result;
	},

	async getPatientFullData(patientId: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { id: patientId, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true,
				guardians: {
					with: {
						user: true
					}
				},
				appointments: {
					where: { isDeleted: false },
					with: {
						doctor: true,
						service: true
					},
					orderBy: { appointmentDate: "desc" }
				},
				medicalRecords: {
					with: {
						doctor: true,
						appointment: true,
						diagnoses: true,
						vitalSigns: true,
						prescriptions: {
							with: {
								prescribedItems: {
									with: {
										drug: true
									}
								}
							}
						}
					},
					orderBy: { createdAt: "desc" }
				},
				immunizations: {
					with: {
						administeredBy: true
					},
					orderBy: { date: "desc" }
				},
				labTests: {
					with: {
						service: true
					},
					orderBy: { testDate: "desc" }
				},
				prescriptions: {
					with: {
						doctor: true,
						prescribedItems: {
							with: {
								drug: true
							}
						}
					},
					orderBy: { issuedDate: "desc" }
				},
				payments: {
					orderBy: { paymentDate: "desc" }
				},
				feedingLogs: {
					orderBy: { date: "desc" }
				},
				developmentalMilestones: {
					orderBy: { dateRecorded: "desc" }
				}
			}
		});
	},
	async autoGenerateAlertsForMeasurement(measurementId: string) {
		const measurement = await db.query.measurement.findFirst({
			where: { id: measurementId },
			with: { patient: true }
		});

		if (!measurement?.patient) {
			throw new Error("Measurement or associated patient not found");
		}

		const patient = measurement.patient;

		// Calculate age in months
		const ageInMonths = ageCalculator.calculateAgeMonths(patient.dateOfBirth, measurement.measurementDate);

		// Fetch LMS reference data for the patient's gender
		const lmsData = await db.query.lmsReference.findFirst({
			where: {
				gender: patient.gender as "boy" | "girl",
				ageMonths: Math.round(ageInMonths),
				metric: "BMI" // Assuming we're checking BMI for growth alerts
			}
		});

		if (!lmsData) {
			throw new Error("LMS reference data not found for the patient's age and gender");
		}

		// Calculate Z-Score for BMI
		const zScore = calculateZScore(measurement.bmi ?? 0, lmsData);

		// Determine if an alert should be generated based on Z-Score thresholds
		let alertType: "MODERATE_UNDERWEIGHT" | "OBESITY" | null = null;
		if (zScore < -2) {
			alertType = "MODERATE_UNDERWEIGHT";
		} else if (zScore > 2) {
			alertType = "OBESITY";
		}

		// If an alert is needed, create it in the database
		if (alertType) {
			const message =
				alertType === "MODERATE_UNDERWEIGHT"
					? "Patient shows signs of moderate underweight"
					: "Patient shows signs of obesity";
			const severity = alertType === "MODERATE_UNDERWEIGHT" ? "WARNING" : "CRITICAL";

			await db.insert(schema.growthAlert).values({
				patientId: patient.id,
				measurementId: measurement.id,
				message,
				severity,
				alertType,
				isResolved: false
			});
		}
	},
	async getPatientRecords(patientId: string, clinicId: string) {
		return await db.query.patient.findFirst({
			where: { id: patientId, clinicId, isDeleted: false },
			with: {
				user: true,
				clinic: true,
				guardians: {
					with: { user: true }
				},
				appointments: {
					where: { isDeleted: false },
					with: { doctor: true, service: true },
					orderBy: { appointmentDate: "desc" }
				},
				medicalRecords: {
					with: {
						doctor: true,
						appointment: true,
						vitalSigns: true,
						prescriptions: {
							with: {
								prescribedItems: {
									with: { drug: true }
								}
							}
						}
					},
					orderBy: { createdAt: "desc" }
				}
			}
		});
	},
	async getPatientsInDateRange(clinicId: string, start: Date, end: Date) {
		return await db.query.patient.findMany({
			where: {
				clinicId,
				createdAt: {
					gte: start,
					lte: end
				}
			},
			columns: { createdAt: true, id: true }
		});
	}
};

export type PatientRepo = typeof patientRepo;
