// db/repositories/clinic.repo.ts

import type { SQL } from "drizzle-orm";
import { and, between, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";
import { ageCalculator } from "@/utils/age-calculator";
import * as schema from "../schema";
import type {
	AdverseEventCreateInput,
	AdverseEventUpdateInput,
	FeedingLogCreateInput,
	FeedingLogUpdateInput,
	ImmunizationCreateInput,
	ImmunizationUpdateInput,
	VaccineInventoryUpdateInput,
	VaccineScheduleCreateInput,
	VaccineScheduleUpdateInput
} from "../zod";

export interface NutritionalAssessmentCreateInput {
	assessmentDate?: Date;
	clinicId: string;
	dietaryRestrictions?: string[];
	followUpDate?: Date | null;
	notes?: string | null;
	nutritionalStatus: schema.NutritionalStatus;
	patientId: string;
	recommendations?: string[];
}

export type NutritionalAssessmentUpdateInput = Partial<
	Omit<NutritionalAssessmentCreateInput, "patientId" | "clinicId">
> & {
	id: string;
	updatedAt?: Date;
};

export interface FeedingLogFilters {
	clinicId: string;
	endDate?: Date;
	limit?: number;
	offset?: number;
	patientId: string;
	startDate?: Date;
	type?: schema.FeedingType;
}

export interface FeedingStats {
	averageDuration: number;
	byType: Record<string, number>;
	feedingsByDay: Array<{
		date: string;
		count: number;
		totalDuration: number;
		totalAmount: number;
	}>;
	totalAmount: number;
	totalFeedings: number;
}

export interface NutritionalAssessment {
	assessmentDate: Date;
	clinicId: string;
	createdAt: Date;
	dietaryRestrictions: string[];
	followUpDate: Date | null;
	id: string;
	notes: string | null;
	nutritionalStatus: schema.NutritionalStatus;
	patientId: string;
	recommendations: string[];
	updatedAt: Date;
}

export const pediatricRepo = {
	// Clinic queries
	async createDevelopmentalMilestones(data: typeof schema.developmentalMilestones.$inferInsert) {
		return await db
			.insert(schema.developmentalMilestones)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID()
			})
			.returning();
	},
	async getPatientGrowthRecords(patientId: string, clinicId: string) {
		return await db.query.measurement.findMany({
			where: { patientId, clinicId },
			orderBy: { measurementDate: "asc" }
		});
	},
	// db/queries/pediatric.repo.ts - Add these methods

	async updateMeasurement(id: string, data: Partial<schema.NewMeasurement>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.measurement)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.measurement.id, id))
			.returning();
		return result;
	},

	async deleteMeasurement(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.delete(schema.measurement).where(eq(schema.measurement.id, id)).returning();
		return result;
	},

	async getGrowthRecordsByPatient(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.measurement.findMany({
			where: { patientId },
			orderBy: { measurementDate: "desc" }
		});
	},
	async listGrowthRecords(clinicId: string, patientId?: string, limit = 50, offset = 0) {
		const [records, total] = await Promise.all([
			db.query.measurement.findMany({
				where: {
					clinicId,
					...(patientId && { patientId })
				},
				limit,
				offset,
				orderBy: { measurementDate: "desc" }
			}),
			db.$count(
				schema.measurement,
				and(
					eq(schema.measurement.clinicId, clinicId),
					patientId ? eq(schema.measurement.patientId, patientId) : undefined
				)
			)
		]);
		return { records, total };
	},
	async getGrowthRecordById(id: string, clinicId: string) {
		return await db.query.measurement.findFirst({
			where: { id, clinicId },
			with: {
				patient: true
			}
		});
	},
	async addMeasurementPoint(
		input: {
			patientId: string;
			measurementDate: Date;
			weightKg?: number;
			heightCm?: number;
			headCircumferenceCm?: number;
			notes?: string;
			ageMonth?: number;
		},
		clinicId: string
	) {
		const patient = await db.query.patient.findFirst({
			where: { id: input.patientId },
			columns: { dateOfBirth: true }
		});
		if (!patient) {
			throw new Error("Patient not found");
		}
		const chronologicalAgeMonths = ageCalculator.calculateAgeMonths(patient.dateOfBirth, input.measurementDate);
		return await db
			.insert(schema.measurement)
			.values({
				...input,
				id: crypto.randomUUID(),
				clinicId,
				chronologicalAgeMonths
			})
			.returning();
	},

	async getGrowthAnalytics(patientId: string, clinicId: string) {
		const records = (await this.getPatientGrowthRecords(patientId, clinicId)) as schema.Measurement[];

		if (records.length < 2) {
			return { velocity: null, records };
		}

		const first = records[0];
		const last = records.at(-1);
		if (!(first && last)) {
			return { velocity: null, records };
		}
		const monthsDiff =
			(last.measurementDate.getTime() - first.measurementDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

		const weightVelocity = monthsDiff > 0 ? ((last.weightKg ?? 0) - (first.weightKg ?? 0)) / monthsDiff : 0;
		const heightVelocity = monthsDiff > 0 ? ((last.heightCm ?? 0) - (first.heightCm ?? 0)) / monthsDiff : 0;

		return {
			records,
			velocity: {
				weightKgPerMonth: weightVelocity.toFixed(2),
				heightCmPerMonth: heightVelocity.toFixed(2)
			}
		};
	},
	async list({
		patientId,
		clinicId: _clinicId,
		startDate,
		endDate,
		type,
		limit = 50,
		offset = 0
	}: FeedingLogFilters) {
		const logs = await db.query.feedingLog.findMany({
			where: {
				patientId,
				date: {
					gte: startDate,
					lte: endDate
				},
				type
			},
			orderBy: { date: "desc" },
			limit,
			offset
		});

		const dateConditions: SQL[] = [];
		if (startDate && endDate) {
			dateConditions.push(between(schema.feedingLog.date, startDate, endDate));
		} else if (startDate) {
			dateConditions.push(gte(schema.feedingLog.date, startDate));
		} else if (endDate) {
			dateConditions.push(lte(schema.feedingLog.date, endDate));
		}

		const total = await db.$count(
			schema.feedingLog,
			and(
				eq(schema.feedingLog.patientId, patientId),
				...dateConditions,
				type ? eq(schema.feedingLog.type, type) : undefined
			)
		);

		return {
			logs,
			total,
			hasMore: offset + limit < total
		};
	},

	/**
	 * Get feeding log by ID
	 */
	async getById(id: string, _clinicId?: string) {
		return await db.query.feedingLog.findFirst({
			where: {
				id
			}
		});
	},

	/**
	 * Get feeding statistics for a patient
	 */
	async getFeedingStats(patientId: string, _clinicId: string, days = 30): Promise<FeedingStats> {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const logs = await db.query.feedingLog.findMany({
			where: {
				patientId,
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: { date: "asc" }
		});

		// Calculate statistics
		const byType: Record<string, number> = {};
		let totalDuration = 0;
		let totalAmount = 0;
		const feedingsByDayMap: Record<string, { count: number; totalDuration: number; totalAmount: number }> = {};

		for (const log of logs) {
			// Count by type
			byType[log.type] = (byType[log.type] || 0) + 1;

			// Sum duration and amount
			totalDuration += log.duration || 0;
			totalAmount += log.amount || 0;

			// Group by day
			const dateKey = log.date.toISOString().split("T")[0] ?? "";
			if (!feedingsByDayMap[dateKey]) {
				feedingsByDayMap[dateKey] = {
					count: 0,
					totalDuration: 0,
					totalAmount: 0
				};
			}
			feedingsByDayMap[dateKey].count++;
			feedingsByDayMap[dateKey].totalDuration += log.duration || 0;
			feedingsByDayMap[dateKey].totalAmount += log.amount || 0;
		}

		const averageDuration = logs.length > 0 ? totalDuration / logs.length : 0;

		return {
			totalFeedings: logs.length,
			byType,
			averageDuration,
			totalAmount,
			feedingsByDay: Object.entries(feedingsByDayMap)
				.map(([date, stats]) => ({
					date,
					count: stats.count,
					totalDuration: stats.totalDuration,
					totalAmount: stats.totalAmount
				}))
				.sort((a, b) => a.date.localeCompare(b.date))
		};
	},

	/**
	 * Get breastfeeding-specific statistics
	 */
	async getBreastfeedingStats(patientId: string, _clinicId: string, days = 30) {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const logs = await db.query.feedingLog.findMany({
			where: {
				patientId,
				type: "EXCLUSIVE_BREASTFEEDING",
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: { date: "asc" }
		});

		// Today's total
		const today = new Date().toISOString().split("T")[0] ?? "";
		const todayFeedings = logs.filter(log => log.date.toISOString().split("T")[0] === today);
		const todayTotal = todayFeedings.length;

		// Weekly data (last 7 days)
		const weeklyDataMap: Record<
			string,
			{
				duration: number;
				count: number;
				leftDuration: number;
				rightDuration: number;
			}
		> = {};

		for (const log of logs) {
			const dateKey = log.date.toISOString().split("T")[0] ?? "";
			if (!weeklyDataMap[dateKey]) {
				weeklyDataMap[dateKey] = {
					duration: 0,
					count: 0,
					leftDuration: 0,
					rightDuration: 0
				};
			}
			weeklyDataMap[dateKey].duration += log.duration || 0;
			weeklyDataMap[dateKey].count++;
			if (log.breast === "LEFT") {
				weeklyDataMap[dateKey].leftDuration += log.duration || 0;
			}
			if (log.breast === "RIGHT") {
				weeklyDataMap[dateKey].rightDuration += log.duration || 0;
			}
			if (log.breast === "BOTH") {
				weeklyDataMap[dateKey].leftDuration += (log.duration || 0) / 2;
				weeklyDataMap[dateKey].rightDuration += (log.duration || 0) / 2;
			}
		}

		const weeklyData = Object.entries(weeklyDataMap)
			.map(([date, stats]) => ({
				date,
				duration: stats.duration,
				count: stats.count,
				leftDuration: stats.leftDuration,
				rightDuration: stats.rightDuration
			}))
			.sort((a, b) => a.date.localeCompare(b.date))
			.slice(-7);

		// Calculate average duration
		const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
		const averageDuration = logs.length > 0 ? totalDuration / logs.length : 0;

		// Weekly average (last 7 days)
		const last7Days = weeklyData.slice(-7);
		const weeklyAverage =
			last7Days.length > 0 ? last7Days.reduce((sum, day) => sum + day.count, 0) / last7Days.length : 0;

		// Sessions by time of day
		const sessionsByTimeOfDay = {
			morning: 0, // 6am - 12pm
			afternoon: 0, // 12pm - 5pm
			evening: 0, // 5pm - 9pm
			night: 0 // 9pm - 6am
		};

		for (const log of logs) {
			const hour = log.date.getHours();
			if (hour >= 6 && hour < 12) {
				sessionsByTimeOfDay.morning++;
			} else if (hour >= 12 && hour < 17) {
				sessionsByTimeOfDay.afternoon++;
			} else if (hour >= 17 && hour < 21) {
				sessionsByTimeOfDay.evening++;
			} else {
				sessionsByTimeOfDay.night++;
			}
		}

		// Breast preference
		let leftPreference = 0;
		let rightPreference = 0;
		let bothPreference = 0;

		for (const log of logs) {
			if (log.breast === "LEFT") {
				leftPreference++;
			} else if (log.breast === "RIGHT") {
				rightPreference++;
			} else if (log.breast === "BOTH") {
				bothPreference++;
			}
		}

		const totalFeedings = logs.length;
		const breastPreference = {
			left: totalFeedings > 0 ? (leftPreference / totalFeedings) * 100 : 0,
			right: totalFeedings > 0 ? (rightPreference / totalFeedings) * 100 : 0,
			both: totalFeedings > 0 ? (bothPreference / totalFeedings) * 100 : 0
		};

		return {
			todayTotal,
			weeklyAverage: Math.round(weeklyAverage * 10) / 10,
			totalSessions: logs.length,
			averageDuration: Math.round(averageDuration * 10) / 10,
			weeklyData,
			sessionsByTimeOfDay,
			breastPreference
		};
	},

	/**
	 * Get feeding logs by date range
	 */
	async getFeedingsByDateRange(patientId: string, _clinicId: string, startDate: Date, endDate: Date) {
		return await db.query.feedingLog.findMany({
			where: {
				patientId,
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: { date: "asc" }
		});
	},

	/**
	 * Get latest feeding log for a patient
	 */
	async getLatestFeedings(patientId: string) {
		return await db.query.feedingLog.findFirst({
			where: { patientId },
			orderBy: { date: "desc" }
		});
	},
	async getAssessments(patientId: string, clinicId: string) {
		// If you have a dedicated nutrition_assessment table:
		// return await db.query.nutritionAssessment.findMany({
		//   where: { patientId, clinicId },
		// const medicalRecords = await db.query.medicalRecord.findMany({
		// 	where: {
		// 		patientId: patientId,
		// 		clinicId: clinicId,
		// 		// ✅ v2 Relational Query RAW operator pattern
		// 		RAW: table =>
		// 			sql`${table.notes}::jsonb @> ${JSON.stringify({ type: "nutrition_assessment" })}::jsonb`
		// 	}
		// });
		//   orderBy: { assessmentDate: "desc" },
		// }); Alternative: Store assessments in nutritionalAssessment table
		const medicalRecords = await db.query.medicalRecord.findMany({
			where: {
				patientId,
				clinicId,
				// ✅ Correct v2 RQB syntax for custom raw column queries
				RAW: table => sql`${table.notes}->>'type' = 'nutrition_assessment'`
			},
			orderBy: { createdAt: "desc" }
		});

		// Parse assessments from medical records
		const assessments: NutritionalAssessment[] = [];
		for (const record of medicalRecords) {
			try {
				if (record.notes && typeof record.notes === "string") {
					const parsed = JSON.parse(record.notes);
					if (parsed.type === "nutrition_assessment") {
						assessments.push({
							id: record.id,
							patientId: record.patientId,
							clinicId: record.clinicId,
							assessmentDate: record.diagnosisDate || record.createdAt,
							nutritionalStatus: parsed.nutritionalStatus || "NORMAL",
							dietaryRestrictions: parsed.dietaryRestrictions || [],
							recommendations: (parsed.recommendations as string[]) || [],
							followUpDate: record.followUpDate || null,
							notes: (parsed.notes as string) || null,
							createdAt: record.createdAt,
							updatedAt: record.updatedAt
						});
					}
				}
			} catch {
				// Skip invalid JSON
			}
		}

		return assessments;
	},
	async syncFeedingLogs(
		patientId: string,
		_clinicId: string,
		externalLogs: Array<{
			timestamp: Date;
			type: string;
			duration?: number;
			amount?: number;
			source: string;
		}>
	) {
		const results: (typeof schema.feedingLog.$inferSelect)[] = [];
		const errors: { timestamp: Date; error: string }[] = [];

		for (const externalLog of externalLogs) {
			try {
				// ✅ Fixed: Migrated multi-condition range filtering to correct RQB v2 AND structure
				const existingLog = await db.query.feedingLog.findFirst({
					where: {
						patientId,
						AND: [
							{
								date: {
									gte: new Date(externalLog.timestamp.getTime() - 5 * 60 * 1000)
								}
							},
							{
								date: {
									lte: new Date(externalLog.timestamp.getTime() + 5 * 60 * 1000)
								}
							}
						]
					}
				});

				if (existingLog) {
					errors.push({
						timestamp: externalLog.timestamp,
						error: "Duplicate log found within 5 minute window"
					});
				} else {
					const newLog = await this.createFeedingLog({
						patientId,
						clinicId: _clinicId,
						id: crypto.randomUUID(),
						date: externalLog.timestamp,
						type: externalLog.type as schema.FeedingType, // Assumes FeedingType is inferred as a string union type
						duration: externalLog.duration,
						amount: externalLog.amount,
						notes: `Synced from ${externalLog.source}`
					});
					results.push(newLog);
				}
			} catch (error) {
				errors.push({
					timestamp: externalLog.timestamp,
					error: error instanceof Error ? error.message : "Unknown error"
				});
			}
		}

		return { synced: results.length, failed: errors.length, results, errors };
	},

	async createNutritionAssessment(data: Omit<NutritionalAssessmentCreateInput, "id" | "createdAt" | "updatedAt">) {
		const assessmentData = {
			type: "nutrition_assessment",
			nutritionalStatus: data.nutritionalStatus,
			recommendations: data.recommendations ?? []
		};

		const assessmentBaseDate = new Date(data.assessmentDate ?? new Date());

		// Calculate exactly 4 days later
		const calculatedFollowUp = new Date(assessmentBaseDate);
		calculatedFollowUp.setDate(calculatedFollowUp.getDate() + 4);

		const [result] = await db
			.insert(schema.medicalRecord)
			.values({
				id: crypto.randomUUID(),
				patientId: data.patientId,
				clinicId: data.clinicId,
				doctorId: "system",
				appointmentId: crypto.randomUUID(), // Placeholder uuid to fulfill notNull schema constraint
				diagnosis: `Nutrition Assessment - ${data.nutritionalStatus}`,
				diagnosisDate: data.assessmentDate,
				notes: JSON.stringify(assessmentData),
				followUpDate: data.followUpDate ?? calculatedFollowUp,
				status: "ACTIVE",
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		if (!result) {
			throw new Error("Failed to create nutrition assessment record");
		}

		// Create a corresponding diagnosis record
		await db.insert(schema.diagnosis).values({
			id: crypto.randomUUID(),
			medicalId: result.id,
			patientId: data.patientId,
			doctorId: "system",
			clinicId: data.clinicId ?? null, // Handle optional safely
			appointmentId: null,
			diagnosis: `Nutrition Assessment - ${data.nutritionalStatus}`,
			symptoms: "N/A",
			date: data.assessmentDate,

			// ✅ FIX: Change from "ACTIVE" to a valid appointmentStatusEnum value
			status: "COMPLETED",

			createdAt: new Date(),
			updatedAt: new Date()
		});

		return {
			id: result.id,
			patientId: result.patientId,
			clinicId: result.clinicId,
			assessmentDate: result.diagnosisDate ?? result.createdAt,
			nutritionalStatus: data.nutritionalStatus,
			recommendations: data.recommendations,
			followUpDate: result.followUpDate,
			notes: data.notes ?? null,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt
		};
	},
	/**
	 * Get latest nutrition assessment
	 */
	async getLatestAssessment(patientId: string, clinicId: string): Promise<NutritionalAssessment | null> {
		const assessments = await this.getAssessments(patientId, clinicId);
		return assessments.length > 0 ? (assessments[0] ?? null) : null;
	},

	/**
	 * Get nutrition assessment by ID
	 */
	async getAssessmentById(id: string, clinicId: string): Promise<NutritionalAssessment | null> {
		const record = await db.query.medicalRecord.findFirst({
			where: { id, clinicId }
		});

		if (!record?.notes) {
			return null;
		}

		try {
			const parsed = JSON.parse(record.notes);
			if (parsed.type === "nutrition_assessment") {
				return {
					id: record.id,
					patientId: record.patientId,
					clinicId: record.clinicId,
					assessmentDate: record.diagnosisDate || record.createdAt,
					nutritionalStatus: parsed.nutritionalStatus || "NORMAL",
					dietaryRestrictions: parsed.dietaryRestrictions || [],
					recommendations: (parsed.recommendations as string[]) || [],
					followUpDate: record.followUpDate || null,
					notes: (parsed.notes as string) || null,
					createdAt: record.createdAt,
					updatedAt: record.updatedAt
				};
			}
		} catch {
			return null;
		}

		return null;
	},

	/**
	 * Get nutrition assessment history with trends
	 */
	async getAssessmentHistory(patientId: string, clinicId: string, limit = 10) {
		const assessments = await this.getAssessments(patientId, clinicId);
		const sorted = assessments.sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime());
		const recent = sorted.slice(0, limit);

		// Calculate trends
		let trend: "improving" | "stable" | "declining" | null = null;
		if (recent.length >= 2) {
			const statusOrder: Record<string, number> = {
				MALNOURISHED: 0,
				UNDERWEIGHT: 1,
				NORMAL: 2,
				OVERWEIGHT: 2,
				OBESE: 1
			};
			const currentScore = statusOrder[recent[0]?.nutritionalStatus || "NORMAL"] ?? 1;
			const previousScore = statusOrder[recent[1]?.nutritionalStatus || "NORMAL"] ?? 1;

			if (currentScore > previousScore) {
				trend = "improving";
			} else if (currentScore < previousScore) {
				trend = "declining";
			} else {
				trend = "stable";
			}
		}

		return {
			assessments: recent,
			total: assessments.length,
			trend
		};
	},

	/**
	 * Get patients requiring follow-up based on nutrition assessments
	 */
	async getPatientsNeedingFollowUp(clinicId: string, daysUntilFollowUp = 30) {
		const followUpDate = new Date();
		followUpDate.setDate(followUpDate.getDate() + daysUntilFollowUp);

		// This query would need a dedicated nutrition_assessment table
		// Placeholder implementation using medicalRecord
		const records = await db.query.medicalRecord.findMany({
			where: {
				clinicId,
				followUpDate: { lte: followUpDate },
				status: "ACTIVE"
			},
			with: {
				patient: true
			}
		});

		return records.filter(record => {
			try {
				if (record.notes) {
					const parsed = JSON.parse(record.notes);
					return parsed.type === "nutrition_assessment";
				}
				return false;
			} catch {
				return false;
			}
		});
	},
	async getNutritionalDashboardData(patientId: string, clinicId: string) {
		const [feedingStats, breastfeedingStats, latestAssessment, feedingLogs] = await Promise.all([
			this.getFeedingStats(patientId, clinicId, 30),
			this.getBreastfeedingStats(patientId, clinicId, 30),
			this.getLatestAssessment(patientId, clinicId),
			this.list({ patientId, clinicId, limit: 10, offset: 0 })
		]);

		// Generate alerts
		const alerts: Array<{
			type: "warning" | "info" | "success";
			message: string;
			suggestion?: string;
		}> = [];

		// Check feeding frequency
		if (feedingStats.totalFeedings > 0) {
			const avgDaily =
				feedingStats.feedingsByDay.length > 0
					? feedingStats.totalFeedings / feedingStats.feedingsByDay.length
					: 0;

			if (avgDaily < 4 && feedingStats.totalFeedings > 0) {
				alerts.push({
					type: "warning",
					message: "Low feeding frequency detected",
					suggestion: "Consider more frequent feedings throughout the day."
				});
			}
		}

		// Check breastfeeding
		if (breastfeedingStats.totalSessions === 0 && feedingStats.totalFeedings > 0) {
			alerts.push({
				type: "info",
				message: "No breastfeeding records found",
				suggestion: "Consider tracking breastfeeding sessions for better insights."
			});
		}

		// Check nutritional status
		if (latestAssessment) {
			if (latestAssessment.nutritionalStatus === "UNDERWEIGHT") {
				alerts.push({
					type: "warning",
					message: "Patient is underweight",
					suggestion: "Consult with a nutritionist for dietary recommendations."
				});
			} else if (latestAssessment.nutritionalStatus === "OBESE") {
				alerts.push({
					type: "warning",
					message: "Weight management concern detected",
					suggestion: "Review dietary habits and physical activity."
				});
			} else if (latestAssessment.nutritionalStatus === "NORMAL") {
				alerts.push({
					type: "success",
					message: "Normal nutritional status maintained",
					suggestion: "Continue with current healthy habits."
				});
			}
		}

		return {
			feedingStats,
			breastfeedingStats,
			latestAssessment,
			recentFeedings: feedingLogs.logs,
			alerts
		};
	},

	/**
	 * Get clinic-wide nutrition statistics (for admin dashboard)
	 */
	async getClinicNutritionStats(clinicId: string, startDate: Date, endDate: Date) {
		const feedingLogs = await db.query.feedingLog.findMany({
			where: {
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			with: {
				patient: {
					where: { clinicId }
				}
			}
		});

		// Filter by clinic through patient relation
		const clinicLogs = feedingLogs.filter(log => log.patient?.clinicId === clinicId);

		// Calculate summary statistics
		const byType: Record<string, number> = {};
		let totalDuration = 0;
		let totalAmount = 0;
		const uniquePatients = new Set<string>();

		for (const log of clinicLogs) {
			byType[log.type] = (byType[log.type] || 0) + 1;
			totalDuration += log.duration || 0;
			totalAmount += log.amount || 0;
			uniquePatients.add(log.patientId);
		}

		return {
			totalFeedings: clinicLogs.length,
			uniquePatients: uniquePatients.size,
			byType,
			averageDuration: clinicLogs.length > 0 ? totalDuration / clinicLogs.length : 0,
			totalAmount
		};
	},
	async generateFeedingReport(patientId: string, clinicId: string, days = 30) {
		const stats = await this.getFeedingStats(patientId, clinicId, days);
		const breastfeedingStats = await this.getBreastfeedingStats(patientId, clinicId, days);

		return {
			period: { days },
			generatedAt: new Date(),
			patientId,
			summary: {
				totalFeedings: stats.totalFeedings,
				averageDaily: stats.feedingsByDay.length > 0 ? stats.totalFeedings / stats.feedingsByDay.length : 0,
				mostCommonType: Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "none"
			},
			breastfeeding: breastfeedingStats,
			dailyBreakdown: stats.feedingsByDay
		};
	},

	/**
	 * Compare nutrition across multiple patients
	 */
	async comparePatients(patientIds: string[], clinicId: string, days = 30) {
		const results = await Promise.all(
			patientIds.map(async patientId => {
				const stats = await this.getFeedingStats(patientId, clinicId, days);
				const latestAssessment = await this.getLatestAssessment(patientId, clinicId);
				return {
					patientId,
					totalFeedings: stats.totalFeedings,
					averageDaily: stats.feedingsByDay.length > 0 ? stats.totalFeedings / stats.feedingsByDay.length : 0,
					nutritionalStatus: latestAssessment?.nutritionalStatus || "unknown"
				};
			})
		);

		return results;
	},
	async getFeedingLogsSummary(patientId: string, startDate: Date, endDate: Date) {
		const feedingLogs = await db.query.feedingLog.findMany({
			where: {
				patientId,
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: { date: "asc" }
		});

		const summary = {
			totalFeedings: feedingLogs.length,
			byType: {} as Record<string, number>,
			averageDuration: 0,
			totalAmount: 0
		};

		let totalDuration = 0;
		for (const log of feedingLogs) {
			summary.byType[log.type] = (summary.byType[log.type] || 0) + 1;
			totalDuration += log.duration ?? 0;
			summary.totalAmount += log.amount ?? 0;
		}

		summary.averageDuration = feedingLogs.length > 0 ? totalDuration / feedingLogs.length : 0;

		return summary;
	},

	// Get developmental milestones progress
	async getDevelopmentalProgress(patientId: string) {
		const [milestones, checks] = await Promise.all([
			db.query.developmentalMilestones.findMany({
				where: { patientId },
				orderBy: (milestone, { asc }) => [asc(milestone.dateRecorded)]
			}),

			db.query.developmentalMilestones.findMany({
				where: { patientId },
				orderBy: (check, { asc }) => [asc(check.dateRecorded)]
			})
		]);

		// Group milestones by age range
		const milestonesByAge: Record<string, typeof milestones> = {};
		for (const milestone of milestones) {
			if (!milestonesByAge[milestone.ageAchieved]) {
				milestonesByAge[milestone.ageAchieved] = [];
			}
			milestonesByAge[milestone.ageAchieved]?.push(milestone);
		}

		return {
			milestones: milestonesByAge,
			developmentalChecks: checks,
			totalMilestonesAchieved: milestones.length
		};
	},

	// Get developmental screenings for a patient
	async getDevelopmentalScreenings(patientId: string) {
		return await db.query.developmentalMilestones.findMany({
			where: { patientId },
			orderBy: { dateRecorded: "desc" }
		});
	},

	// Create developmental check
	async createDevelopmentalCheck(data: typeof schema.developmentalMilestones.$inferInsert) {
		return await db
			.insert(schema.developmentalMilestones)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID()
			})
			.returning();
	},

	async getAllVaccineSchedules() {
		return await db.query.vaccineSchedule.findMany({
			where: { isDeleted: false }
		});
	},
	async listImmunizations(input: { limit: number; offset: number; patientId?: string; clinicId?: string }) {
		const { limit, offset, patientId, clinicId } = input;

		const [records, total] = await Promise.all([
			db.query.immunization.findMany({
				where: {
					...(clinicId && { clinicId }),
					isDeleted: false,
					...(patientId && { patientId })
				},
				limit,
				offset,
				orderBy: { date: "desc" }
			}),
			db.$count(
				schema.immunization,
				and(
					clinicId ? eq(schema.immunization.clinicId, clinicId) : undefined,
					eq(schema.immunization.isDeleted, false),
					patientId ? eq(schema.immunization.patientId, patientId) : undefined
				)
			)
		]);

		return {
			records,
			total
		};
	},
	// Get vaccine schedule for patient based on age
	async getPatientVaccineSchedule(patientId: string) {
		const patient = await db.query.patient.findFirst({
			where: { id: patientId },
			with: {
				immunizations: true
			}
		});

		if (!patient) {
			throw new Error("Patient not found");
		}

		// Calculate age in days
		const ageInDays = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));
		// Get due vaccines

		const dueVaccines = await db.query.vaccineSchedule.findMany({
			where: {
				isDeleted: false, // Simple equality
				ageInDaysMin: { lte: ageInDays }, // LTE operator as object key
				OR: [
					{ ageInDaysMax: { gte: ageInDays } } // GTE operator
				]
			}
		});
		// Filter out already administered vaccines
		const administeredVaccines = new Set(patient.immunizations.map(i => i.vaccine));

		const pendingVaccines = dueVaccines.filter(v => !administeredVaccines.has(v.vaccineName));

		return { pendingVaccines, administeredVaccines: patient.immunizations };
	},
	async getVaccineInventoryStatus(clinicId: string) {
		const inventory = await db.query.vaccineInventory.findMany({
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
	async getOverdueImmunizations(clinicId: string) {
		const overdueImmunizations = await db.query.immunization.findMany({
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

		return overdueImmunizations;
	},
	async getUpcomingImmunizations(clinicId: string) {
		// const now = new Date();
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

		const allPatients = await db.query.patient.findMany({
			where: { clinicId, isDeleted: false },
			with: {
				immunizations: true
			}
		});

		const upcomingImmunizations: Array<{
			patient: typeof schema.patient.$inferSelect;
			dueVaccines: (typeof schema.vaccineSchedule.$inferSelect)[];
		}> = [];

		for (const patient of allPatients) {
			const dueVaccines = await this.getPatientVaccineSchedule(patient.id);
			upcomingImmunizations.push({
				patient,
				dueVaccines: dueVaccines.pendingVaccines
			});
		}

		return upcomingImmunizations.filter(u => u.dueVaccines.length > 0);
	},
	// Record immunization
	async recordImmunization(data: {
		patientId: string;
		clinicId: string;
		vaccine: string;
		date: Date;
		dose: string;
		lotNumber: string;
		administeredByStaffId: string;
		notes?: string;
	}) {
		return await db.transaction(async tx => {
			const [immunization] = await tx
				.insert(schema.immunization)
				.values({
					id: crypto.randomUUID(),
					recordId: crypto.randomUUID(),
					...data,
					status: "COMPLETED"
				})
				.returning();

			// Update vaccine inventory
			await tx
				.update(schema.vaccineInventory)
				.set({
					quantity: sql`${schema.vaccineInventory.quantity} - 1`,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(schema.vaccineInventory.clinicId, data.clinicId),
						eq(schema.vaccineInventory.vaccineName, data.vaccine)
					)
				);

			return immunization;
		});
	},

	async createFeedingLogs(data: FeedingLogCreateInput) {
		const [result] = await db.insert(schema.feedingLog).values(data).returning();
		return result;
	},

	async createManyFeedingLogss(data: FeedingLogCreateInput[]) {
		return await db.insert(schema.feedingLog).values(data).returning();
	},

	async updateFeedingLogs(id: string, data: FeedingLogUpdateInput) {
		const updateData = { ...data };

		const [result] = await db
			.update(schema.feedingLog)
			.set(updateData)
			.where(eq(schema.feedingLog.id, id))
			.returning();
		return result;
	},

	async updateManyFeedingLogss(ids: string[], data: FeedingLogUpdateInput) {
		const updateData = { ...data };

		return await db.update(schema.feedingLog).set(updateData).where(inArray(schema.feedingLog.id, ids)).returning();
	},

	async deleteFeedingLogs(id: string) {
		const [result] = await db.delete(schema.feedingLog).where(eq(schema.feedingLog.id, id)).returning();
		return result;
	},

	// async createDevelopmentalMilestones(
	// 	data: DevelopmentalMilestonesCreateInput
	// ) {
	// 	const [result] = await db
	// 		.insert(schema.developmentalMilestones)
	// 		.values(data)
	// 		.returning();
	// 	return result;
	// },

	// async createManyDevelopmentalMilestoness(
	// 	data: DevelopmentalMilestonesCreateInput[]
	// ) {
	// 	return await db
	// 		.insert(schema.developmentalMilestones)
	// 		.values(data)
	// 		.returning();
	// },

	// async updateDevelopmentalMilestones(
	// 	id: string,
	// 	data: DevelopmentalMilestonesUpdateInput
	// ) {
	// 	const updateData = { ...data };
	// 	updateData.updatedAt = new Date();
	// 	const [result] = await db
	// 		.update(schema.developmentalMilestones)
	// 		.set(updateData)
	// 		.where(eq(schema.developmentalMilestones.id, id))
	// 		.returning();
	// 	return result;
	// },

	// async updateManyDevelopmentalMilestoness(
	// 	ids: string[],
	// 	data: DevelopmentalMilestonesUpdateInput
	// ) {
	// 	const updateData = { ...data };
	// 	updateData.updatedAt = new Date();
	// 	return await db
	// 		.update(schema.developmentalMilestones)
	// 		.set(updateData)
	// 		.where(inArray(schema.developmentalMilestones.id, ids))
	// 		.returning();
	// },

	// async deleteDevelopmentalMilestones(id: string) {
	// 	const [result] = await db
	// 		.delete(schema.developmentalMilestones)
	// 		.where(eq(schema.developmentalMilestones.id, id))
	// 		.returning();
	// 	return result;
	// },

	async createVaccineSchedule(data: VaccineScheduleCreateInput) {
		const [result] = await db.insert(schema.vaccineSchedule).values(data).returning();
		return result;
	},

	async updateInventory(id: string, data: VaccineInventoryUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.vaccineInventory)
			.set(updateData)
			.where(eq(schema.vaccineInventory.id, id))
			.returning();
		return result;
	},

	async recordAdverseEvent(data: AdverseEventCreateInput) {
		const [result] = await db.insert(schema.adverseEvent).values(data).returning();
		return result;
	},

	async createManyVaccineSchedules(data: VaccineScheduleCreateInput[]) {
		return await db.insert(schema.vaccineSchedule).values(data).returning();
	},

	async updateVaccineSchedule(id: string, data: VaccineScheduleUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.vaccineSchedule)
			.set(updateData)
			.where(eq(schema.vaccineSchedule.id, id))
			.returning();
		return result;
	},

	async updateManyVaccineSchedules(ids: string[], data: VaccineScheduleUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.vaccineSchedule)
			.set(updateData)
			.where(inArray(schema.vaccineSchedule.id, ids))
			.returning();
	},

	async deleteVaccineSchedule(id: string) {
		const [result] = await db.delete(schema.vaccineSchedule).where(eq(schema.vaccineSchedule.id, id)).returning();
		return result;
	},

	async softDeleteVaccineSchedule(id: string) {
		const [result] = await db
			.update(schema.vaccineSchedule)
			.set({ isDeleted: true })
			.where(eq(schema.vaccineSchedule.id, id))
			.returning();
		return result;
	},

	async restoreVaccineSchedule(id: string) {
		const [result] = await db
			.update(schema.vaccineSchedule)
			.set({ isDeleted: false })
			.where(eq(schema.vaccineSchedule.id, id))
			.returning();
		return result;
	},

	async createAdverseEvent(data: AdverseEventCreateInput) {
		const [result] = await db.insert(schema.adverseEvent).values(data).returning();
		return result;
	},

	async createManyAdverseEvents(data: AdverseEventCreateInput[]) {
		return await db.insert(schema.adverseEvent).values(data).returning();
	},

	async updateAdverseEvent(id: string, data: AdverseEventUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.adverseEvent)
			.set(updateData)
			.where(eq(schema.adverseEvent.id, id))
			.returning();
		return result;
	},

	async updateManyAdverseEvents(ids: string[], data: AdverseEventUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.adverseEvent)
			.set(updateData)
			.where(inArray(schema.adverseEvent.id, ids))
			.returning();
	},

	async deleteAdverseEvent(id: string) {
		const [result] = await db.delete(schema.adverseEvent).where(eq(schema.adverseEvent.id, id)).returning();
		return result;
	},
	async createFeedingLog(data: FeedingLogCreateInput) {
		const [result] = await db
			.insert(schema.feedingLog)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID(),
				date: data.date ?? new Date()
			})
			.returning();
		if (!result) {
			throw new Error("Failed to create feeding log");
		}
		return result;
	},
	async createManyFeedingLogs(data: FeedingLogCreateInput[]) {
		const values = data.map(item => ({
			...item,
			id: item.id ?? crypto.randomUUID(),
			date: item.date ?? new Date()
		}));
		return await db.insert(schema.feedingLog).values(values).returning();
	},
	async updateFeedingLog(id: string, data: FeedingLogUpdateInput) {
		const updateData = {
			...data,
			updatedAt: new Date()
		};
		const [result] = await db
			.update(schema.feedingLog)
			.set(updateData)
			.where(eq(schema.feedingLog.id, id))
			.returning();
		return result;
	},
	async updateManyFeedingLogs(ids: string[], data: FeedingLogUpdateInput) {
		const updateData = {
			...data,
			updatedAt: new Date()
		};
		return await db.update(schema.feedingLog).set(updateData).where(inArray(schema.feedingLog.id, ids)).returning();
	},
	async deleteFeedingLog(id: string) {
		const [result] = await db.delete(schema.feedingLog).where(eq(schema.feedingLog.id, id)).returning();
		return result;
	},

	async updateNutritionAssessment(id: string, data: NutritionalAssessmentUpdateInput) {
		const existing = await db.query.medicalRecord.findFirst({
			where: { id }
		});

		if (!existing) {
			throw new Error("Nutrition assessment not found");
		}

		let parsedNotes: Record<string, unknown> = {};
		try {
			if (existing.notes) {
				parsedNotes = JSON.parse(existing.notes) as Record<string, unknown>;
			}
		} catch {
			parsedNotes = {};
		}

		const updatedNotes = {
			...parsedNotes,
			type: "nutrition_assessment",
			nutritionalStatus: data.nutritionalStatus ?? parsedNotes.nutritionalStatus,
			recommendations: data.recommendations ?? parsedNotes.recommendations
		};

		const [result] = await db
			.update(schema.medicalRecord)
			.set({
				diagnosisDate: data.assessmentDate,
				notes: JSON.stringify(updatedNotes),
				followUpDate: data.followUpDate ?? existing.followUpDate,
				updatedAt: new Date()
			})
			.where(eq(schema.medicalRecord.id, id))
			.returning();

		if (!result) {
			throw new Error("Failed to update nutrition assessment record");
		}

		return {
			id: result.id,
			patientId: result.patientId,
			clinicId: result.clinicId,
			assessmentDate: result.diagnosisDate ?? result.createdAt,
			nutritionalStatus: (updatedNotes.nutritionalStatus as schema.NutritionalStatus | undefined) ?? "NORMAL",
			recommendations: (updatedNotes.recommendations as string[] | undefined) ?? [],
			followUpDate: result.followUpDate,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt
		};
	},

	async deleteNutritionAssessment(id: string) {
		const [result] = await db
			.update(schema.medicalRecord)
			.set({ isDeleted: true, deletedAt: new Date() })
			.where(eq(schema.medicalRecord.id, id))
			.returning();

		return result;
	},
	// async createNutritionRecommendation(patientId: string, clinicId: string, data: any) {
	// 	const patient = await db.query.patient.findFirst({
	// 		where: { id: patientId },
	// 		with: { user: true }
	// 	});

	// 	if (schema.patient?.userId) {
	// 		await db.insert(schema.notification).values({
	// 			id: crypto.randomUUID(),
	// 			userId: patient?.userId ?? "",
	// 			clinicId,
	// 			title: `Nutrition ${data.recommendationType}: ${data.title}`,
	// 			body: data.body,
	// 			type: "nutrition_recommendation",
	// 			priority: data.priority === "HIGH" ? "HIGH" : "MEDIUM",
	// 			metadata: {
	// 				recommendationType: data.recommendationType,
	// 				dueDate: data.dueDate,
	// 				priority: data.priority
	// 			},
	// 			createdAt: new Date(),
	// 			updatedAt: new Date()
	// 		});
	// 	}
	// 	return {
	// 		id: crypto.randomUUID(),
	// 		patientId,
	// 		clinicId,
	// 		...data,
	// 		createdAt: new Date(),
	// 		updatedAt: new Date()
	// 	};
	// },
	async completeNutritionRecommendation(recommendationId: string) {
		// Update the notification status
		const [result] = await db
			.update(schema.notification)
			.set({ status: "READ", updatedAt: new Date() })
			.where(eq(schema.notification.id, recommendationId))
			.returning();

		return { success: !!result, id: recommendationId };
	},

	// async generateRecurringFeedings(
	// 	patientId: string,
	// 	clinicId: string,
	// 	schedule: {
	// 		startDate: Date;
	// 		endDate: Date;
	// 		times: string[]; // e.g., ["08:00", "12:00", "16:00", "20:00"]
	// 		type: "BREAST" | "FORMULA" | "MIXED";
	// 		duration?: number;
	// 		amount?: number;
	// 	}
	// ) {
	// 	const feedings = [];
	// 	const currentDate = new Date(schedule.startDate);
	// 	const endDate = new Date(schedule.endDate);

	// 	while (currentDate <= endDate) {
	// 		for (const time of schedule.times) {
	// 			const [hours, minutes] = time.split(":").map(Number);
	// 			const feedingTime = new Date(currentDate);
	// 			feedingTime.setHours(hours || 0, minutes || 0, 0, 0);

	// 			feedings.push({
	// 				id: crypto.randomUUID(),
	// 				patientId,
	// 				clinicId,
	// 				date: feedingTime,
	// 				type: schedule.type,
	// 				duration: schedule.duration,
	// 				amount: schedule.amount,
	// 				notes: "Auto-generated from recurring schedule"
	// 			});
	// 		}
	// 		currentDate.setDate(currentDate.getDate() + 1);
	// 	}

	// 	// Check for duplicates before inserting
	// 	const existingLogs = await this.list({
	// 		patientId,
	// 		clinicId,
	// 		startDate: schedule.startDate,
	// 		endDate: schedule.endDate,
	// 		limit: 1000,
	// 		offset: 0
	// 	});

	// 	const existingTimes = new Set(existingLogs.logs.map(log => log.date.toISOString()));

	// 	const newFeedings = feedings.filter(feeding => !existingTimes.has(feeding.date.toISOString()));

	// 	if (newFeedings.length > 0) {
	// 		return await this.createManyFeedingLogs(newFeedings);
	// 	}

	// 	return [];
	// },

	async createImmunization(data: ImmunizationCreateInput) {
		const [result] = await db.insert(schema.immunization).values(data).returning();
		return result;
	},
	async recordImmunizationWithInventory(data: ImmunizationCreateInput & { vaccineInventoryId?: string }) {
		return await db.transaction(async tx => {
			// Check vaccine inventory
			if (data.vaccineInventoryId) {
				const inventory = await tx.query.vaccineInventory.findFirst({
					where: { id: data.vaccineInventoryId }
				});

				if (!inventory || inventory.quantity < 1) {
					throw new Error("Insufficient vaccine stock");
				}

				// Update inventory
				await tx
					.update(schema.vaccineInventory)
					.set({
						quantity: inventory.quantity - 1,
						updatedAt: new Date()
					})
					.where(eq(schema.vaccineInventory.id, data.vaccineInventoryId));
			}

			// Record immunization
			const [immunization] = await tx
				.insert(schema.immunization)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					recordId: data.recordId ?? crypto.randomUUID(),
					status: "COMPLETED"
				})
				.returning();

			// Check for overdue status
			const vaccineSchedule = await tx.query.vaccineSchedule.findFirst({
				where: { vaccineName: data.vaccine }
			});

			if (vaccineSchedule?.ageInDaysMax) {
				const patient = await tx.query.patient.findFirst({
					where: { id: data.patientId }
				});

				if (patient) {
					const ageAtVaccination = Math.floor(
						(data.date.getTime() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
					);

					if (ageAtVaccination > vaccineSchedule.ageInDaysMax) {
						await tx
							.update(schema.immunization)
							.set({ isOverDue: true })
							.where(eq(schema.immunization.id, immunization?.id ?? ""));
					}
				}
			}

			return immunization;
		});
	},

	async bulkUpdateVaccineInventory(
		clinicId: string,
		updates: Array<{
			vaccineName: string;
			quantity: number;
			lotNumber?: string;
			expirationDate?: Date;
		}>
	) {
		return await db.transaction(async tx => {
			const results: (typeof schema.vaccineInventory.$inferSelect)[] = [];
			for (const update of updates) {
				const existing = await tx.query.vaccineInventory.findFirst({
					where: {
						clinicId,
						vaccineName: update.vaccineName
					}
				});

				if (existing) {
					const [updated] = await tx
						.update(schema.vaccineInventory)
						.set({
							quantity: existing.quantity + update.quantity,
							lotNumber: update.lotNumber || existing.lotNumber,
							expirationDate: update.expirationDate || existing.expirationDate,
							updatedAt: new Date()
						})
						.where(eq(schema.vaccineInventory.id, existing.id))
						.returning();
					if (updated) {
						results.push(updated);
					}
				} else {
					const [created] = await tx
						.insert(schema.vaccineInventory)
						.values({
							id: crypto.randomUUID(),
							clinicId,
							vaccineName: update.vaccineName,
							quantity: update.quantity,
							lotNumber: update.lotNumber,
							expirationDate: update.expirationDate
						})
						.returning();
					if (created) {
						results.push(created);
					}
				}
			}
			return results;
		});
	},
	async createManyImmunizations(data: ImmunizationCreateInput[]) {
		return await db.insert(schema.immunization).values(data).returning();
	},

	async updateImmunization(id: string, data: ImmunizationUpdateInput) {
		const updateData = { ...data };

		const [result] = await db
			.update(schema.immunization)
			.set(updateData)
			.where(eq(schema.immunization.id, id))
			.returning();
		return result;
	},

	async updateManyImmunizations(ids: string[], data: ImmunizationUpdateInput) {
		const updateData = { ...data };

		return await db
			.update(schema.immunization)
			.set(updateData)
			.where(inArray(schema.immunization.id, ids))
			.returning();
	},

	async deleteImmunization(id: string) {
		const [result] = await db.delete(schema.immunization).where(eq(schema.immunization.id, id)).returning();
		return result;
	},

	async softDeleteImmunization(id: string) {
		const [result] = await db
			.update(schema.immunization)
			.set({ deletedAt: new Date() })
			.where(eq(schema.immunization.id, id))
			.returning();
		return result;
	},

	async restoreImmunization(id: string) {
		const [result] = await db
			.update(schema.immunization)
			.set({ deletedAt: null })
			.where(eq(schema.immunization.id, id))
			.returning();
		return result;
	},

	async getWHOStandards(ageDays: number, gender: schema.Gender, type: "WEIGHT" | "HEIGHT" | "BMI") {
		return await db.query.lmsReference.findFirst({
			where: { ageMonths: ageDays, gender, metric: type }
		});
	},
	async getMultipleWHOStandards(
		params: Array<{
			ageDays: number;
			gender: schema.Gender;
			type: "WEIGHT" | "HEIGHT";
		}>
	) {
		// Optimization: If performance is an issue, consider converting this
		// into a single query using 'inArray' rather than Promise.all(map)
		return await Promise.all(params.map(p => this.getWHOStandards(p.ageDays, p.gender, p.type)));
	},

	/**
	 * Get immunizations within a date range for a specific clinic
	 */
	async getImmunizationsInRange(clinicId: string, startDate: Date, endDate: Date) {
		return await db.query.immunization.findMany({
			where: {
				clinicId,
				isDeleted: false,
				date: {
					gte: startDate,
					lte: endDate
				}
			},
			orderBy: { date: "asc" }
		});
	}
};

export type PediatricRepo = typeof pediatricRepo;
