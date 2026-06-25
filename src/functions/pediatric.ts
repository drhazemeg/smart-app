// db/repositories/pediatric.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { pediatricRepo } from "@/db/queries/pediatric.repo";
import * as schema from "@/db/schema";
import { ImmunizationCreateSchema, MeasurementCreateSchema } from "@/db/zod";

const WEIGHT_GROWTH_ALERT_TYPE_REGEX = /weight|growth/i;
const HIGH_SEVERITY_REGEX = /high|critical/i;
const MEDIUM_SEVERITY_REGEX = /medium|moderate|warning/i;

// =======================
// Zod Validators
// =======================

const patientClinicSchema = z.object({
	patientId: z.string(),
	clinicId: z.string()
});

const growthRecordIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const growthRecordListSchema = z.object({
	clinicId: z.string(),
	patientId: z.string().optional(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});

const feedingLogFiltersSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	type: z.enum(schema.feedingTypeEnum.enumValues).optional(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});

const feedingStatsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	days: z.number().default(30)
});

const developmentalCheckSchema = z.object({
	patientId: z.string(),
	ageMonths: z.number(),
	motorSkills: z.string(),
	languageSkills: z.string(),
	socialSkills: z.string(),
	cognitiveSkills: z.string(),
	milestonesMet: z.string().optional(),
	milestonesPending: z.string().optional(),
	concerns: z.string().optional(),
	recommendations: z.string().optional()
});

const immunizationListSchema = z.object({
	limit: z.number().default(50),
	offset: z.number().default(0),
	patientId: z.string().optional(),
	clinicId: z.string().optional()
});

const recordImmunizationSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	vaccine: z.string(),
	date: z.date(),
	dose: z.string(),
	lotNumber: z.string(),
	administeredByStaffId: z.string(),
	notes: z.string().optional(),
	vaccineInventoryId: z.string().optional()
});

const bulkVaccineUpdateSchema = z.object({
	clinicId: z.string(),
	updates: z.array(
		z.object({
			vaccineName: z.string(),
			quantity: z.number(),
			lotNumber: z.string().optional(),
			expirationDate: z.date().optional()
		})
	)
});

const growthWithPercentilesSchema = z.object({
	patientId: z.string(),
	date: z.date(),
	weight: z.number().optional(),
	height: z.number().optional(),
	headCircumference: z.number().optional(),
	bmi: z.number().optional(),
	notes: z.string().optional(),
	clinicId: z.string()
}) as unknown as z.ZodType<schema.Measurement>;

const whoStandardsSchema = z.object({
	ageDays: z.number(),
	gender: z.enum(schema.genderEnum.enumValues),
	measurementType: z.enum(schema.measurementTypeEnum.enumValues)
});

// =======================
// Utility Functions
// =======================

/**
 * Error function approximation (erf)
 * Used to calculate percentile from Z-score
 */
function erf(x: number): number {
	// constants
	const a1 = 0.254_829_592;
	const a2 = -0.284_496_736;
	const a3 = 1.421_413_741;
	const a4 = -1.453_152_027;
	const a5 = 1.061_405_429;
	const p = 0.327_591_1;

	const sign = x < 0 ? -1 : 1;
	const absX = Math.abs(x);
	const t = 1.0 / (1.0 + p * absX);
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
	return sign * y;
}

function calculateGrowthMetrics(value: number, lms: { l: number; m: number; s: number }) {
	const { l, m, s } = lms;
	let zScore: number;

	if (Math.abs(l) < 0.01) {
		zScore = Math.log(value / m) / s;
	} else {
		zScore = ((value / m) ** l - 1) / (l * s);
	}

	// Calculate percentile from Z-score using the error function approximation
	const percentile = 0.5 * (1 + erf(zScore / Math.sqrt(2))) * 100;

	return { zScore, percentile };
}

export { calculateGrowthMetrics };

// =======================
// Server Functions
// =======================

export const getPatientGrowthRecords = createServerFn({ method: "GET" })
	.validator(patientClinicSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.getPatientGrowthRecords(ctx.data.patientId, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting growth records:", error);
			throw new Error("Failed to get growth records");
		}
	});

export const listGrowthRecords = createServerFn({ method: "POST" })
	.validator(growthRecordListSchema)
	.handler(async ctx => {
		try {
			const { clinicId, patientId, limit, offset } = ctx.data;
			return await pediatricRepo.listGrowthRecords(clinicId, patientId, limit, offset);
		} catch (error) {
			console.error("Error listing growth records:", error);
			throw new Error("Failed to list growth records");
		}
	});

export const getGrowthRecordById = createServerFn({ method: "GET" })
	.validator(growthRecordIdSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.getGrowthRecordById(ctx.data.id, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting growth record:", error);
			throw new Error("Failed to get growth record");
		}
	});

export const listFeedingLogs = createServerFn({ method: "POST" })
	.validator(feedingLogFiltersSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.list(ctx.data);
		} catch (error) {
			console.error("Error listing feeding logs:", error);
			throw new Error("Failed to list feeding logs");
		}
	});

export const getFeedingStats = createServerFn({ method: "POST" })
	.validator(feedingStatsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, days } = ctx.data;
			return await pediatricRepo.getFeedingStats(patientId, clinicId, days);
		} catch (error) {
			console.error("Error getting feeding stats:", error);
			throw new Error("Failed to get feeding stats");
		}
	});

export const getBreastfeedingStats = createServerFn({ method: "POST" })
	.validator(feedingStatsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, days } = ctx.data;
			return await pediatricRepo.getBreastfeedingStats(patientId, clinicId, days);
		} catch (error) {
			console.error("Error getting breastfeeding stats:", error);
			throw new Error("Failed to get breastfeeding stats");
		}
	});

export const getFeedingsByDateRange = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			clinicId: z.string(),
			startDate: z.date(),
			endDate: z.date()
		})
	)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, startDate, endDate } = ctx.data;
			return await pediatricRepo.getFeedingsByDateRange(patientId, clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting feedings by date range:", error);
			throw new Error("Failed to get feedings");
		}
	});

export const getLatestFeedingLog = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getLatestFeedings(ctx.data.patientId);
		} catch (error) {
			console.error("Error getting latest feeding log:", error);
			throw new Error("Failed to get latest feeding log");
		}
	});

export const addMeasurementPoint = createServerFn({ method: "POST" })
	.validator(
		MeasurementCreateSchema.omit({ patientId: true }).extend({
			patientId: z.string()
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, ...measurement } = ctx.data;
			const cleanedMeasurement = Object.fromEntries(
				Object.entries(measurement).filter(([_, v]) => v !== null)
			) as unknown as {
				patientId: string;
				measurementDate: Date;
				weightKg?: number;
				heightCm?: number;
				headCircumferenceCm?: number;
				notes?: string;
			};

			return await pediatricRepo.addMeasurementPoint(cleanedMeasurement, clinicId ?? "");
		} catch (error) {
			console.error("Error adding measurement:", error);
			throw new Error("Failed to add measurement");
		}
	});

export const getGrowthAnalytics = createServerFn({ method: "GET" })
	.validator(patientClinicSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.getGrowthAnalytics(ctx.data.patientId, ctx.data.clinicId);
		} catch (error) {
			console.error("Error calculating growth analytics:", error);
			throw new Error("Failed to calculate growth analytics");
		}
	});

export const getFeedingLogById = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getById(ctx.data.id);
		} catch (error) {
			console.error("Error getting feeding log:", error);
			throw new Error("Failed to get feeding log");
		}
	});

export const getDevelopmentalProgress = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getDevelopmentalProgress(ctx.data.patientId);
		} catch (error) {
			console.error("Error getting developmental progress:", error);
			throw new Error("Failed to get developmental progress");
		}
	});

export const getDevelopmentalScreenings = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getDevelopmentalScreenings(ctx.data.patientId);
		} catch (error) {
			console.error("Error getting developmental screenings:", error);
			throw new Error("Failed to get developmental screenings");
		}
	});

export const createDevelopmentalCheck = createServerFn({ method: "POST" })
	.validator(developmentalCheckSchema)
	.handler(async ctx => {
		try {
			const { patientId, ageMonths, ...data } = ctx.data;
			const milestoneData = {
				patientId,
				ageAchieved: `${ageMonths} months`,
				milestone: JSON.stringify(data),
				dateRecorded: new Date()
			};
			return await pediatricRepo.createDevelopmentalMilestones(milestoneData);
		} catch (error) {
			console.error("Error creating developmental check:", error);
			throw new Error("Failed to create developmental check");
		}
	});

export const getAllVaccineSchedules = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await pediatricRepo.getAllVaccineSchedules();
	} catch (error) {
		console.error("Error getting vaccine schedules:", error);
		throw new Error("Failed to get vaccine schedules");
	}
});

export const listImmunizations = createServerFn({ method: "POST" })
	.validator(immunizationListSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.listImmunizations(ctx.data);
		} catch (error) {
			console.error("Error listing immunizations:", error);
			throw new Error("Failed to list immunizations");
		}
	});

export const getPatientVaccineSchedule = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getPatientVaccineSchedule(ctx.data.patientId);
		} catch (error) {
			console.error("Error getting patient vaccine schedule:", error);
			throw new Error("Failed to get vaccine schedule");
		}
	});

export const getVaccineInventoryStatus = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getVaccineInventoryStatus(ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting vaccine inventory:", error);
			throw new Error("Failed to get vaccine inventory");
		}
	});

export const getOverdueImmunizations = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getOverdueImmunizations(ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting overdue immunizations:", error);
			throw new Error("Failed to get overdue immunizations");
		}
	});

export const getUpcomingImmunizations = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.getUpcomingImmunizations(ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting upcoming immunizations:", error);
			throw new Error("Failed to get upcoming immunizations");
		}
	});

export const createImmunization = createServerFn({ method: "POST" })
	.validator(z.object({ data: ImmunizationCreateSchema }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const [result] = await db
				.insert(schema.immunization)
				.values({
					id: crypto.randomUUID(),
					recordId: data.recordId ?? crypto.randomUUID(),
					patientId: data.patientId,
					clinicId: data.clinicId,
					vaccine: data.vaccine,
					date: data.date,
					dose: data.dose,
					lotNumber: data.lotNumber,
					notes: data.notes,
					status: "COMPLETED",
					createdAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating immunization:", error);
			throw new Error("Failed to create immunization");
		}
	});

export const recordImmunization = createServerFn({ method: "POST" })
	.validator(recordImmunizationSchema)
	.handler(async ctx => {
		try {
			const immunizationData = {
				...ctx.data,
				recordId: crypto.randomUUID() // Ensure recordId is provided
			};
			return await pediatricRepo.recordImmunizationWithInventory(immunizationData);
		} catch (error) {
			console.error("Error recording immunization:", error);
			throw new Error("Failed to record immunization");
		}
	});

export const createFeedingLog = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			clinicId: z.string(),
			date: z.date().optional(),
			type: z.enum(schema.feedingTypeEnum.enumValues),
			duration: z.number().optional(),
			amount: z.number().optional(),
			breast: z.enum(schema.breastEnum.enumValues).optional(),
			notes: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.feedingLog)
				.values({
					id: crypto.randomUUID(),
					date: data.date || new Date(),
					...data
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating feeding log:", error);
			throw new Error("Failed to create feeding log");
		}
	});

export const createManyFeedingLogs = createServerFn({ method: "POST" })
	.validator(z.object({ logs: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.createManyFeedingLogs(ctx.data.logs);
		} catch (error) {
			console.error("Error creating multiple feeding logs:", error);
			throw new Error("Failed to create feeding logs");
		}
	});

export const updateFeedingLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.updateFeedingLog(ctx.data.id, ctx.data.data);
		} catch (error) {
			console.error("Error updating feeding log:", error);
			throw new Error("Failed to update feeding log");
		}
	});

export const updateManyFeedingLogs = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.updateManyFeedingLogs(ctx.data.ids, ctx.data.data);
		} catch (error) {
			console.error("Error updating multiple feeding logs:", error);
			throw new Error("Failed to update feeding logs");
		}
	});

export const deleteFeedingLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await pediatricRepo.deleteFeedingLog(ctx.data.id);
		} catch (error) {
			console.error("Error deleting feeding log:", error);
			throw new Error("Failed to delete feeding log");
		}
	});

export const createDevelopmentalMilestone = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			milestone: z.string(),
			ageAchieved: z.string(),
			dateRecorded: z.date(),
			notes: z.string().optional(),
			createdBy: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			return await pediatricRepo.createDevelopmentalMilestones(ctx.data);
		} catch (error) {
			console.error("Error creating developmental milestone:", error);
			throw new Error("Failed to create developmental milestone");
		}
	});

export const createVaccineSchedule = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.vaccineSchedule)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating vaccine schedule:", error);
			throw new Error("Failed to create vaccine schedule");
		}
	});

export const bulkUpdateVaccineInventory = createServerFn({ method: "POST" })
	.validator(bulkVaccineUpdateSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.bulkUpdateVaccineInventory(ctx.data.clinicId, ctx.data.updates);
		} catch (error) {
			console.error("Error bulk updating vaccine inventory:", error);
			throw new Error("Failed to update vaccine inventory");
		}
	});

export const syncFeedingLogs = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			clinicId: z.string(),
			externalLogs: z.array(
				z.object({
					timestamp: z.date(),
					type: z.string(),
					duration: z.number().optional(),
					amount: z.number().optional(),
					source: z.string()
				})
			)
		})
	)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, externalLogs } = ctx.data;
			const results: Awaited<ReturnType<typeof db.query.feedingLog.findFirst>>[] = [];
			const errors: { timestamp: Date; error: string }[] = [];

			for (const externalLog of externalLogs) {
				try {
					const existingLog = await db.query.feedingLog.findFirst({
						where: {
							patientId,
							clinicId,
							date: {
								gt: new Date(externalLog.timestamp.getTime() - 5 * 60 * 1000),
								lt: new Date(externalLog.timestamp.getTime() + 5 * 60 * 1000)
							}
						}
					});

					if (existingLog) {
						errors.push({
							timestamp: externalLog.timestamp,
							error: "Duplicate log found within 5 minute window"
						});
					} else {
						// Create the log directly using db insert since we need to access createFeedingLog
						const newLog = await db
							.insert(schema.feedingLog)
							.values({
								id: crypto.randomUUID(),
								patientId,
								clinicId,
								date: externalLog.timestamp,
								type: externalLog.type as schema.FeedingType,
								duration: externalLog.duration,
								amount: externalLog.amount,
								notes: `Synced from ${externalLog.source}`
							})
							.returning();
						results.push(newLog[0]);
					}
				} catch (error) {
					errors.push({
						timestamp: externalLog.timestamp,
						error: error instanceof Error ? error.message : "Unknown error"
					});
				}
			}

			return { synced: results.length, failed: errors.length, results, errors };
		} catch (error) {
			console.error("Error syncing feeding logs:", error);
			throw new Error("Failed to sync feeding logs");
		}
	});

export const recordGrowthWithPercentiles = createServerFn({ method: "POST" })
	.validator(growthWithPercentilesSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await db.transaction(async tx => {
				const patient = await tx.query.patient.findFirst({
					where: { id: data.patientId }
				});

				if (!patient) {
					throw new Error("Patient not found");
				}

				const ageDays = Math.floor(
					// @ts-expect-error
					(data.date.getTime() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
				);
				const ageMonths = Math.floor(ageDays / 30);

				type LmsRef = {
					measurementType: string;
					m?: number;
					s?: number;
					mValue?: number;
					sValue?: number;
				};
				const whoStandards = (await tx.query.lmsReference.findMany({
					where: {
						gender: patient.gender as schema.Gender,
						ageMonths: {
							gte: ageDays - 30,
							lte: ageDays + 30
						}
					}
				})) as unknown as LmsRef[];

				let weightForAgeZ: number | undefined;
				let heightForAgeZ: number | undefined;
				let bmiForAgeZ: number | undefined;

				const weightStandard = whoStandards.find(s => s.measurementType === "WEIGHT");
				if (
					weightStandard &&
					data.weightKg !== undefined &&
					typeof weightStandard.m === "number" &&
					typeof weightStandard.s === "number"
				) {
					weightForAgeZ = ((data.weightKg ?? 0) - weightStandard.m) / weightStandard.s;
				}

				const heightStandard = whoStandards.find(s => s.measurementType === "HEIGHT");
				if (
					heightStandard &&
					data.heightCm !== undefined &&
					typeof heightStandard.m === "number" &&
					typeof heightStandard.s === "number"
				) {
					heightForAgeZ = ((data.heightCm ?? 0) - heightStandard.m) / heightStandard.s;
				}

				if (data.bmi !== undefined) {
					const bmiStandard = whoStandards.find(s => s.measurementType === "BMI");
					if (
						bmiStandard &&
						typeof bmiStandard.mValue === "number" &&
						typeof bmiStandard.sValue === "number"
					) {
						bmiForAgeZ = ((data.bmi ?? 0) - bmiStandard.mValue) / bmiStandard.sValue;
					}
				}

				const [growthRecord] = await tx
					.insert(schema.measurement)
					.values({
						clinicId: data.clinicId,
						patientId: data.patientId,
						measurementDate: data.measurementDate,
						weightKg: data.weightKg,
						heightCm: data.heightCm,
						headCircumferenceCm: data.headCircumferenceCm,
						bmi: data.bmi,
						chronologicalAgeMonths: ageMonths,
						weightForAgeZ,
						heightForAgeZ,
						bmiForAgeZ,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				if (weightForAgeZ && (weightForAgeZ < -2 || weightForAgeZ > 2)) {
					const alertType = (schema.alertTypeEnum.enumValues.find(value =>
						WEIGHT_GROWTH_ALERT_TYPE_REGEX.test(value)
					) ?? schema.alertTypeEnum.enumValues[0]) as schema.AlertType;
					const highSeverity = schema.alertSeverityEnum.enumValues.find(value =>
						HIGH_SEVERITY_REGEX.test(value)
					);
					const mediumSeverity = schema.alertSeverityEnum.enumValues.find(value =>
						MEDIUM_SEVERITY_REGEX.test(value)
					);
					const severity =
						(Math.abs(weightForAgeZ) >= 3 ? highSeverity : mediumSeverity) ??
						schema.alertSeverityEnum.enumValues[0];

					await tx.insert(schema.growthAlert).values({
						id: crypto.randomUUID(),
						clinicId: data.clinicId,
						patientId: data.patientId,
						measurementId: growthRecord.id as string,
						alertType,
						severity: severity as schema.AlertSeverity,
						zScore: weightForAgeZ,
						message: `Patient ${patient.firstName} ${patient.lastName} has abnormal weight-for-age Z-score: ${weightForAgeZ.toFixed(2)}`,
						recommendation: "Review patient's nutrition and growth plan",
						createdAt: new Date()
					});
				}

				return growthRecord;
			});

			return result;
		} catch (error) {
			console.error("Error recording growth with percentiles:", error);
			throw new Error("Failed to record growth data");
		}
	});

export const getWHOStandards = createServerFn({ method: "POST" })
	.validator(whoStandardsSchema)
	.handler(async ctx => {
		try {
			return await pediatricRepo.getWHOStandards(ctx.data.ageDays, ctx.data.gender, ctx.data.measurementType);
		} catch (error) {
			console.error("Error getting WHO standards:", error);
			throw new Error("Failed to get WHO standards");
		}
	});
