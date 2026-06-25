// queries/reporting.repo.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <ok> */

import { format } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";
import type { PaymentStatus } from "../zod";

// ============================================
// Types
// ============================================

export interface DateRange {
	endDate: Date;
	startDate: Date;
}

export interface ClinicalReportData {
	averagePatientsPerDay: number;
	completedAppointments: number;
	completionRate: number;
	diagnosesByType: Array<{ type: string; count: number }>;
	growthSummary: {
		averageWeight: number;
		averageHeight: number;
		averageHeadCircumference: number;
		underweightCount: number;
		overweightCount: number;
		obeseCount: number;
		stuntedCount: number;
		totalRecords: number;
	};
	immunizationCoverageRate: number;
	immunizationSummary: {
		total: number;
		byVaccine: Array<{ vaccine: string; count: number }>;
		byStatus: Record<string, number>;
	};
	newPatients: number;
	topDiagnoses: Array<{ diagnosis: string; count: number }>;
	totalAppointments: number;
	totalPatients: number;
	vitalSignsSummary: {
		averageSystolic: number;
		averageDiastolic: number;
		averageHeartRate: number;
		averageTemperature: number;
		averageOxygenSaturation: number;
		totalReadings: number;
	};
}

export interface FinancialReportData {
	averageTransaction: number;
	netRevenue: number;
	outstandingAmount: number;
	revenueByDoctor: Array<{ doctor: string; revenue: number }>;
	revenueByMethod: Record<string, number>;
	revenueByService: Array<{ service: string; revenue: number }>;
	timelineData: Array<{ period: string; revenue: number; count: number }>;
	totalDiscount: number;
	totalRevenue: number;
	transactionCount: number;
	unpaidInvoices: Array<{
		id: string;
		receiptNumber: number | null;
		patientName: string;
		amount: number;
		paid: number;
		due: number;
		dueDate: Date | null;
		status: PaymentStatus;
	}>;
}

export interface OperationalReportData {
	appointmentSlotUtilization: number;
	appointmentsByDay: Array<{ day: string; count: number }>;
	appointmentsByHour: Array<{ hour: string; count: number }>;
	averageDailyAppointments: number;
	averageDoctorLoad: number;
	busiestDay: string;
	cancellationRate: number;
	cancelledAppointments: number;
	completedAppointments: number;
	completionRate: number;
	doctorPerformance: Array<{
		id: string;
		name: string;
		totalAppointments: number;
		completedAppointments: number;
		completionRate: number;
		totalRevenue: number;
	}>;
	noShowAppointments: number;
	noShowRate: number;
	patientRetentionRate: number;
	peakHour: string;
	statusDistribution: {
		completed: number;
		cancelled: number;
		noShow: number;
		pending: number;
	};
	topServices: Array<{ service: string; count: number }>;
	totalAppointments: number;
	uniquePatients: number;
	waitTimeStats: {
		averageWaitTime: number;
		medianWaitTime: number;
		maxWaitTime: number;
		minWaitTime: number;
		totalRecords: number;
	};
}

export interface PatientSummaryReportData {
	ageGroups: Record<string, number>;
	averageAppointmentsPerPatient: number;
	genderDistribution: Record<string, number>;
	newPatients: number;
	totalPatients: number;
}

export interface InventoryReportData {
	lowStockItems: number;
	mostPrescribed: Array<{ name: string; prescriptionCount: number }>;
	totalDrugs: number;
}

// ============================================
// Helper Functions
// ============================================

function calculateAgeGroup(ageMonths: number | null): string {
	if (!ageMonths) {
		return "unknown";
	}
	if (ageMonths < 12) {
		return "infant";
	}
	if (ageMonths < 36) {
		return "toddler";
	}
	if (ageMonths < 120) {
		return "child";
	}
	if (ageMonths < 216) {
		return "adolescent";
	}
	return "adult";
}

function toNumber(value: number | string | null | undefined): number {
	if (value === null || value === undefined) {
		return 0;
	}
	return typeof value === "number" ? value : Number(value);
}

// ============================================
// Reporting Repository
// ============================================

export const reportingRepo = {
	/**
	 * Get clinic analytics for a date range
	 */
	async getClinicAnalytics(clinicId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		const dateFilter = { gte: startDate, lte: endDate };

		const [appointments, payments, patients, prescriptions] = await Promise.all([
			// Appointments by status
			client.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					appointmentDate: dateFilter
				}
			}),

			// Payments summary
			client.query.payment.findMany({
				where: {
					clinicId,
					paymentDate: dateFilter,
					status: "PAID"
				}
			}),

			// New patients count
			client.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: dateFilter
				}
			}),

			// Prescriptions count
			client.query.prescription.findMany({
				where: {
					clinicId,
					issuedDate: dateFilter
				}
			})
		]);

		const appointmentStats = {
			total: appointments.length,
			completed: appointments.filter(a => a.status === "COMPLETED").length,
			cancelled: appointments.filter(a => a.status === "CANCELLED").length,
			pending: appointments.filter(a => a.status === "PENDING").length,
			noShow: appointments.filter(a => a.status === "NO_SHOW").length,
			confirmed: appointments.filter(a => a.status === "CONFIRMED").length
		};

		const revenue = payments.reduce((sum, p) => sum + toNumber(p.totalAmount), 0);
		const revenueByMethod = payments.reduce(
			(acc, p) => {
				const method = p.paymentMethod || "CASH";
				acc[method] = (acc[method] || 0) + toNumber(p.totalAmount);
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			period: { startDate, endDate },
			appointments: appointmentStats,
			revenue: {
				total: revenue,
				byMethod: revenueByMethod,
				averagePerAppointment: appointmentStats.completed > 0 ? revenue / appointmentStats.completed : 0
			},
			patients: {
				total: patients.length,
				newPatients: patients.length
			},
			prescriptions: prescriptions.length
		};
	},

	/**
	 * Get popular services for a date range
	 */
	async getPopularServices(clinicId: string, startDate: Date, endDate: Date, limit = 10, tx?: DBorTx) {
		const client = tx ?? db;

		const services = await client.query.service.findMany({
			where: {
				clinicId,
				isDeleted: false
			},
			with: {
				appointments: {
					where: {
						isDeleted: false,
						status: "COMPLETED",
						appointmentDate: {
							gte: startDate,
							lte: endDate
						}
					}
				}
			}
		});

		return services
			.map(service => ({
				id: service.id,
				name: service.serviceName,
				category: service.category,
				price: service.price,
				appointmentCount: service.appointments.length,
				revenue: service.appointments.length * (service.price ?? 0),
				totalUsage: service.appointments.length
			}))
			.sort((a, b) => b.totalUsage - a.totalUsage)
			.slice(0, limit);
	},

	/**
	 * Get clinical report data
	 */
	async getClinicalReport(
		clinicId: string,
		startDate: Date,
		endDate: Date,
		options: {
			includeVitals?: boolean;
			includeDiagnoses?: boolean;
			includeImmunizations?: boolean;
			includeGrowthData?: boolean;
			ageGroup?: string;
			patientIds?: string[];
		} = {}
	): Promise<ClinicalReportData> {
		const client = db;
		const dateFilter = { gte: startDate, lte: endDate };

		const {
			includeVitals = true,
			includeDiagnoses = true,
			includeImmunizations = true,
			includeGrowthData = false,
			ageGroup = "all",
			patientIds
		} = options;

		// Get all patients for age filtering
		const allPatients = await client.query.patient.findMany({
			where: { clinicId, isDeleted: false },
			columns: {
				id: true,
				ageMonths: true,
				gender: true,
				dateOfBirth: true,
				firstName: true,
				lastName: true,
				createdAt: true
			}
		});

		const filteredPatientIds =
			ageGroup === "all"
				? allPatients.map(p => p.id)
				: allPatients
						.filter(p => {
							const ageMonths = p.dateOfBirth
								? Math.floor(
										(Date.now() - new Date(p.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
									)
								: null;
							return calculateAgeGroup(ageMonths) === ageGroup;
						})
						.map(p => p.id);

		const finalPatientIds = patientIds || filteredPatientIds;
		const patientWhere =
			finalPatientIds.length > 0 ? { patientId: { in: finalPatientIds } } : { patientId: { in: [] } };

		const [
			totalPatients,
			newPatients,
			totalAppointments,
			completedAppointments,
			diagnoses,
			immunizations,
			vitalSigns,
			growthRecords
		] = await Promise.all([
			client.$count(
				schema.patient,
				and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))
			),
			client.$count(
				schema.patient,
				and(
					eq(schema.patient.clinicId, clinicId),
					eq(schema.patient.isDeleted, false),
					gte(schema.patient.createdAt, startDate),
					lte(schema.patient.createdAt, endDate)
				)
			),
			client.$count(
				schema.appointment,
				and(
					eq(schema.appointment.clinicId, clinicId),
					eq(schema.appointment.isDeleted, false),
					gte(schema.appointment.createdAt, startDate),
					lte(schema.appointment.createdAt, endDate)
				)
			),
			client.$count(
				schema.appointment,
				and(
					eq(schema.appointment.clinicId, clinicId),
					eq(schema.appointment.isDeleted, false),
					eq(schema.appointment.status, "COMPLETED"),
					gte(schema.appointment.createdAt, startDate),
					lte(schema.appointment.createdAt, endDate)
				)
			),
			includeDiagnoses
				? client.query.diagnosis.findMany({
						where: {
							clinicId,
							isDeleted: false,
							date: dateFilter,
							...patientWhere
						},
						with: { doctor: { with: { user: { columns: { name: true } } } } }
					})
				: Promise.resolve([]),
			includeImmunizations
				? client.query.immunization.findMany({
						where: {
							clinicId,
							isDeleted: false,
							date: dateFilter,
							...patientWhere
						}
					})
				: Promise.resolve([]),
			includeVitals
				? client.query.vitalSign.findMany({
						where: { clinicId, recordedAt: dateFilter, ...patientWhere },
						with: { patient: { columns: { ageMonths: true, gender: true } } }
					})
				: Promise.resolve([]),
			includeGrowthData
				? client.query.measurement.findMany({
						where: { clinicId, date: dateFilter, ...patientWhere },
						with: { patient: { columns: { ageMonths: true, gender: true } } }
					})
				: Promise.resolve([])
		]);

		// Process diagnoses data
		const diagnosisCounts: Record<string, number> = {};
		const diagnosesByType: Record<string, number> = {};
		for (const d of diagnoses) {
			const diagName = d.diagnosis || "Unknown";
			diagnosisCounts[diagName] = (diagnosisCounts[diagName] || 0) + 1;
			const type = d.type || "CONSULTATION";
			diagnosesByType[type] = (diagnosesByType[type] || 0) + 1;
		}

		// Process immunizations data
		const vaccineCounts: Record<string, number> = {};
		const immunizationStatusCounts: Record<string, number> = {};
		for (const i of immunizations) {
			vaccineCounts[i.vaccine] = (vaccineCounts[i.vaccine] || 0) + 1;
			const status = i.status || "PENDING";
			immunizationStatusCounts[status] = (immunizationStatusCounts[status] || 0) + 1;
		}

		// Process vital signs
		let avgSystolic = 0;
		let avgDiastolic = 0;
		let avgHeartRate = 0;
		let avgTemp = 0;
		let avgO2 = 0;
		if (vitalSigns.length > 0) {
			avgSystolic = vitalSigns.reduce((sum, v) => sum + (v.systolic || 0), 0) / vitalSigns.length;
			avgDiastolic = vitalSigns.reduce((sum, v) => sum + (v.diastolic || 0), 0) / vitalSigns.length;
			avgHeartRate = vitalSigns.reduce((sum, v) => sum + (v.heartRate || 0), 0) / vitalSigns.length;
			avgTemp = vitalSigns.reduce((sum, v) => sum + (v.bodyTemperature || 0), 0) / vitalSigns.length;
			avgO2 = vitalSigns.reduce((sum, v) => sum + (v.oxygenSaturation || 0), 0) / vitalSigns.length;
		}

		// Process growth data
		let avgWeight = 0;
		let avgHeight = 0;
		let avgHeadCirc = 0;
		let underweight = 0;
		let overweight = 0;
		let obese = 0;
		let stunted = 0;
		if (growthRecords.length > 0) {
			avgWeight = growthRecords.reduce((sum, g) => sum + (g.weightKg || 0), 0) / growthRecords.length;
			avgHeight = growthRecords.reduce((sum, g) => sum + (g.heightCm || 0), 0) / growthRecords.length;
			avgHeadCirc =
				growthRecords.reduce((sum, g) => sum + (g.headCircumferenceCm || 0), 0) / growthRecords.length;
			underweight = growthRecords.filter(g => g.weightForAgeZ && g.weightForAgeZ < -2).length;
			overweight = growthRecords.filter(g => g.bmiForAgeZ && g.bmiForAgeZ > 1).length;
			obese = growthRecords.filter(g => g.bmiForAgeZ && g.bmiForAgeZ > 2).length;
			stunted = growthRecords.filter(g => g.heightForAgeZ && g.heightForAgeZ < -2).length;
		}

		const daysInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
		const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
		const immunizationCoverageRate = allPatients.length > 0 ? (immunizations.length / allPatients.length) * 100 : 0;

		return {
			totalPatients,
			newPatients,
			totalAppointments,
			completedAppointments,
			completionRate,
			topDiagnoses: Object.entries(diagnosisCounts)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([diagnosis, count]) => ({ diagnosis, count })),
			diagnosesByType: Object.entries(diagnosesByType).map(([type, count]) => ({
				type,
				count
			})),
			immunizationSummary: {
				total: immunizations.length,
				byVaccine: Object.entries(vaccineCounts).map(([vaccine, count]) => ({
					vaccine,
					count
				})),
				byStatus: immunizationStatusCounts
			},
			vitalSignsSummary: {
				averageSystolic: avgSystolic,
				averageDiastolic: avgDiastolic,
				averageHeartRate: avgHeartRate,
				averageTemperature: avgTemp,
				averageOxygenSaturation: avgO2,
				totalReadings: vitalSigns.length
			},
			growthSummary: {
				averageWeight: avgWeight,
				averageHeight: avgHeight,
				averageHeadCircumference: avgHeadCirc,
				underweightCount: underweight,
				overweightCount: overweight,
				obeseCount: obese,
				stuntedCount: stunted,
				totalRecords: growthRecords.length
			},
			averagePatientsPerDay: Math.round(totalAppointments / daysInPeriod),
			immunizationCoverageRate
		};
	},

	/**
	 * Get financial report data
	 */
	async getFinancialReport(
		clinicId: string,
		startDate: Date,
		endDate: Date,
		options: {
			includeUnpaidInvoices?: boolean;
			groupBy?: "day" | "week" | "month";
		} = {}
	): Promise<FinancialReportData> {
		const client = db;
		const dateFilter = { gte: startDate, lte: endDate };
		const { includeUnpaidInvoices = true, groupBy = "month" } = options;

		const [payments, unpaidInvoices] = await Promise.all([
			client.query.payment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					status: "PAID",
					paymentDate: dateFilter
				},
				with: {
					appointment: {
						with: {
							doctor: { with: { user: { columns: { name: true } } } },
							service: true
						}
					},
					patient: { with: { user: { columns: { name: true } } } }
				}
			}),
			includeUnpaidInvoices
				? client.query.payment.findMany({
						where: {
							clinicId,
							isDeleted: false,
							status: { in: ["UNPAID", "PARTIAL"] },
							paymentDate: dateFilter
						},
						with: {
							patient: { with: { user: { columns: { name: true } } } },
							appointment: { with: { service: true } }
						}
					})
				: Promise.resolve([])
		]);

		const totalRevenue = payments.reduce((sum, p) => sum + toNumber(p.amountPaid), 0);
		const totalDiscount = payments.reduce((sum, p) => sum + toNumber(p.discount), 0);
		const averageTransaction = payments.length > 0 ? totalRevenue / payments.length : 0;

		// Revenue by payment method
		const revenueByMethod: Record<string, number> = {};
		const revenueByService: Record<string, number> = {};
		const revenueByDoctor: Record<string, number> = {};

		for (const p of payments) {
			const method = p.paymentMethod || "CASH";
			revenueByMethod[method] = (revenueByMethod[method] || 0) + toNumber(p.amountPaid);

			const serviceName = p.appointment?.service?.serviceName || "Unknown";
			revenueByService[serviceName] = (revenueByService[serviceName] || 0) + toNumber(p.amountPaid);

			const doctorName = p.appointment?.doctor?.user?.name || "Unknown";
			revenueByDoctor[doctorName] = (revenueByDoctor[doctorName] || 0) + toNumber(p.amountPaid);
		}

		// Timeline data based on groupBy
		const timelineMap = new Map<string, { revenue: number; count: number }>();
		for (const p of payments) {
			const date = p.paymentDate || p.createdAt;
			let periodKey: string;
			if (groupBy === "day") {
				periodKey = format(date, "yyyy-MM-dd");
			} else if (groupBy === "week") {
				periodKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
			} else {
				periodKey = format(date, "yyyy-MM");
			}
			const existing = timelineMap.get(periodKey) || { revenue: 0, count: 0 };
			timelineMap.set(periodKey, {
				revenue: existing.revenue + toNumber(p.amountPaid),
				count: existing.count + 1
			});
		}

		const totalOutstanding = unpaidInvoices.reduce((sum, inv) => {
			const due = toNumber(inv.totalAmount) - toNumber(inv.amountPaid);
			return sum + Math.max(0, due);
		}, 0);

		return {
			totalRevenue,
			totalDiscount,
			netRevenue: totalRevenue - totalDiscount,
			transactionCount: payments.length,
			averageTransaction,
			outstandingAmount: totalOutstanding,
			revenueByMethod,
			revenueByService: Object.entries(revenueByService)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([service, revenue]) => ({ service, revenue })),
			revenueByDoctor: Object.entries(revenueByDoctor)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([doctor, revenue]) => ({ doctor, revenue })),
			timelineData: Array.from(timelineMap.entries()).map(([period, data]) => ({
				period,
				...data
			})),
			unpaidInvoices: unpaidInvoices.map(inv => ({
				id: inv.id,
				receiptNumber: inv.receiptNumber,
				patientName: inv.patient?.user?.name || "Unknown",
				amount: toNumber(inv.totalAmount),
				paid: toNumber(inv.amountPaid),
				due: toNumber(inv.totalAmount) - toNumber(inv.amountPaid),
				dueDate: inv.paymentDate,
				status: inv.status || "UNPAID"
			}))
		};
	},

	/**
	 * Get operational report data
	 */
	async getOperationalReport(
		clinicId: string,
		startDate: Date,
		endDate: Date,
		options: { includeWaitTimeAnalysis?: boolean } = {}
	): Promise<OperationalReportData> {
		const client = db;
		const dateFilter = { gte: startDate, lte: endDate };
		const daysInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

		const [appointments, doctors] = await Promise.all([
			client.query.appointment.findMany({
				where: { clinicId, isDeleted: false, createdAt: dateFilter },
				with: {
					doctor: { with: { user: { columns: { name: true } } } },
					service: true,
					patient: { columns: { id: true } }
				}
			}),
			client.query.doctor.findMany({
				where: { clinicId, isDeleted: false },
				with: {
					appointments: {
						where: { createdAt: dateFilter },
						with: { service: true, patient: true }
					},
					ratings: { where: { createdAt: dateFilter } }
				}
			})
		]);

		// Calculate appointment stats
		const totalAppointments = appointments.length;
		const completedAppointments = appointments.filter(a => a.status === "COMPLETED").length;
		const cancelledAppointments = appointments.filter(a => a.status === "CANCELLED").length;
		const noShowAppointments = appointments.filter(a => a.status === "NO_SHOW").length;
		const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

		const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
		const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
		const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

		// Appointment distribution by day of week
		const appointmentsByDay: Record<string, number> = {};
		const appointmentsByHour: Record<string, number> = {};
		const servicesByPopularity: Record<string, number> = {};

		for (const a of appointments) {
			const day = format(a.appointmentDate, "EEEE");
			appointmentsByDay[day] = (appointmentsByDay[day] || 0) + 1;

			const hour = a.appointmentDate.getHours();
			const hourRange = `${hour}:00-${hour + 1}:00`;
			appointmentsByHour[hourRange] = (appointmentsByHour[hourRange] || 0) + 1;

			const serviceName = a.service?.serviceName || "Unknown";
			servicesByPopularity[serviceName] = (servicesByPopularity[serviceName] || 0) + 1;
		}

		// Doctor performance metrics
		const doctorPerformance = doctors.map(doctor => {
			const doctorAppointments = doctor.appointments || [];
			const completedAppts = doctorAppointments.filter(a => a.status === "COMPLETED").length;

			return {
				id: doctor.id,
				name: doctor.name,
				totalAppointments: doctorAppointments.length,
				completedAppointments: completedAppts,
				completionRate: doctorAppointments.length > 0 ? (completedAppts / doctorAppointments.length) * 100 : 0,
				totalRevenue: doctorAppointments.reduce((sum, a) => sum + (a.appointmentPrice || 0), 0)
			};
		});

		// Calculate wait times (if actual_start_time exists in schema)
		let waitTimeStats = {
			averageWaitTime: 0,
			medianWaitTime: 0,
			maxWaitTime: 0,
			minWaitTime: 0,
			totalRecords: 0
		};

		if (options.includeWaitTimeAnalysis) {
			// Note: This assumes there's an actual_start_time column
			// If not, this will return zeros
			try {
				const waitTimes = appointments
					.filter(a => (a as any).actualStartTime)
					.map(a => {
						const actualStart = (a as any).actualStartTime as Date;
						const diff = (actualStart.getTime() - a.appointmentDate.getTime()) / (1000 * 60);
						return Math.max(0, diff);
					});

				if (waitTimes.length > 0) {
					const sorted = [...waitTimes].sort((a, b) => a - b);
					waitTimeStats = {
						averageWaitTime: waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length,
						medianWaitTime: sorted[Math.floor(sorted.length / 2)] ?? 0,
						maxWaitTime: Math.max(...waitTimes),
						minWaitTime: Math.min(...waitTimes),
						totalRecords: waitTimes.length
					};
				}
			} catch {
				// Column might not exist
			}
		}

		// Calculate retention rate
		const repeatPatients = appointments.length - uniquePatients;
		const patientRetentionRate = appointments.length > 0 ? (repeatPatients / appointments.length) * 100 : 0;

		// Peak hour and busiest day
		const peakHour = Object.entries(appointmentsByHour).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
		const busiestDay = Object.entries(appointmentsByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

		// Appointment slot utilization (assuming 8-hour workday per doctor)
		const averageDailyAppointments = totalAppointments / daysInPeriod;
		const appointmentSlotUtilization = Math.min(100, (averageDailyAppointments / (doctors.length * 8)) * 100);

		return {
			totalAppointments,
			completedAppointments,
			cancelledAppointments,
			noShowAppointments,
			completionRate,
			cancellationRate,
			noShowRate,
			uniquePatients,
			appointmentsByDay: Object.entries(appointmentsByDay).map(([day, count]) => ({ day, count })),
			appointmentsByHour: Object.entries(appointmentsByHour).map(([hour, count]) => ({ hour, count })),
			topServices: Object.entries(servicesByPopularity)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([service, count]) => ({ service, count })),
			statusDistribution: {
				completed: completedAppointments,
				cancelled: cancelledAppointments,
				noShow: noShowAppointments,
				pending: totalAppointments - completedAppointments - cancelledAppointments - noShowAppointments
			},
			doctorPerformance: doctorPerformance.sort((a, b) => b.totalAppointments - a.totalAppointments),
			averageDoctorLoad:
				doctorPerformance.reduce((sum, d) => sum + d.totalAppointments, 0) / Math.max(1, doctors.length),
			waitTimeStats,
			averageDailyAppointments,
			peakHour,
			busiestDay,
			appointmentSlotUtilization,
			patientRetentionRate
		};
	},

	/**
	 * Get patient summary report
	 */
	async getPatientSummaryReport(
		clinicId: string,
		startDate: Date,
		endDate: Date,
		tx?: DBorTx
	): Promise<PatientSummaryReportData> {
		const client = tx ?? db;

		const patients = await client.query.patient.findMany({
			where: {
				clinicId,
				isDeleted: false,
				createdAt: { gte: startDate, lte: endDate }
			},
			with: {
				appointments: { columns: { id: true } }
			}
		});

		const totalPatients = await client.$count(
			schema.patient,
			and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))
		);

		const ageGroups: Record<string, number> = {};
		const genderDistribution: Record<string, number> = {};

		for (const p of patients) {
			const ageMonths = p.dateOfBirth
				? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
				: null;

			const group = calculateAgeGroup(ageMonths);
			ageGroups[group] = (ageGroups[group] || 0) + 1;
			genderDistribution[p.gender || "OTHER"] = (genderDistribution[p.gender || "OTHER"] || 0) + 1;
		}

		const totalAppointments = patients.reduce((sum, p) => sum + (p.appointments?.length || 0), 0);
		const averageAppointmentsPerPatient = patients.length > 0 ? totalAppointments / patients.length : 0;

		return {
			totalPatients,
			newPatients: patients.length,
			ageGroups,
			genderDistribution,
			averageAppointmentsPerPatient
		};
	},

	/**
	 * Get inventory report
	 */
	async getInventoryReport(
		clinicId: string,
		startDate: Date,
		endDate: Date,
		tx?: DBorTx
	): Promise<InventoryReportData> {
		const client = tx ?? db;

		const drugs = await client.query.drug.findMany({
			where: {
				clinicId
			},
			with: {
				prescribedItems: {
					where: {
						prescription: {
							issuedDate: { gte: startDate, lte: endDate }
						}
					}
				}
			}
		});

		const lowStockThreshold = 10;
		const lowStockItems = drugs.filter(d => (d.quantityInStock || 0) < lowStockThreshold).length;

		return {
			totalDrugs: drugs.length,
			lowStockItems,
			mostPrescribed: drugs
				.map(d => ({
					name: d.name,
					prescriptionCount: d.prescribedItems.length
				}))
				.sort((a, b) => b.prescriptionCount - a.prescriptionCount)
				.slice(0, 10)
		};
	}
};

export type ReportingRepo = typeof reportingRepo;
