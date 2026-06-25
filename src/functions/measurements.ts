// functions/measurements.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { pediatricRepo } from "@/db/queries/pediatric.repo";
import { calculateAgeInMonths } from "@/db/seed/utils";
import { MeasurementCreateSchema, MeasurementUpdateSchema } from "@/db/zod";
import { authMiddleware } from "./get-user";

// Schema definitions
const measurementIdSchema = z.object({
	id: z.string().min(1),
	clinicId: z.string()
});
const patientIdSchema = z.object({ patientId: z.string().min(1) });

// const createMeasurementSchema = z.object({
// 	patientId: z.string().min(1),
// 	measurementDate: z.date(),
// 	measuredBy: z.string().optional(),
// 	measurementLocation: z.string().optional(),
// 	chronologicalAgeMonths: z.number(),
// 	correctedAgeMonths: z.number().optional(),
// 	gestationalAgeAtMeasurement: z.number().optional(),
// 	weightKg: z.number().optional(),
// 	heightCm: z.number().optional(),
// 	lengthCm: z.number().optional(),
// 	headCircumferenceCm: z.number().optional(),
// 	chestCircumferenceCm: z.number().optional(),
// 	midUpperArmCircumferenceCm: z.number().optional(),
// 	tricepsSkinfoldMm: z.number().optional(),
// 	subscapularSkinfoldMm: z.number().optional(),
// 	milestones: z.string().optional(),
// 	developmentalAgeMonths: z.number().optional(),
// 	feedingType: z.enum(["EXCLUSIVE_BREASTFEEDING", "MIXED", "FORMULA", "SOLID_FOODS", "UNKNOWN"]).optional(),
// 	sleepHoursPerDay: z.number().optional(),
// 	physicalActivityMinutesPerDay: z.number().optional(),
// 	clinicalNotes: z.string().optional(),
// 	recommendations: z.string().optional(),
// 	followUpPlan: z.string().optional(),
// 	followUpDate: z.date().optional(),
// 	attachmentIds: z.array(z.string()).optional(),
// 	createdBy: z.string().optional(),
// 	updatedBy: z.string().optional()
// });

// const updateMeasurementSchema = createMeasurementSchema.partial();

const listMeasurementsSchema = z.object({
	patientId: z.string().min(1),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
	startDate: z.date().optional(),
	endDate: z.date().optional()
});

// Server Functions - Using repositories
export const getMeasurementById = createServerFn({ method: "GET" })
	.validator(measurementIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, id } = data;
			return await pediatricRepo.getGrowthRecordById(clinicId, id);
		} catch (error) {
			console.error("Error getting measurement by ID:", error);
			throw new Error("Failed to get measurement");
		}
	});
export const getMeasurementsByPatient = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(patientIdSchema)
	.handler(async ({ context, data }) => {
		try {
			const { patientId } = data;

			// 1. Fix the typo to correctly grab clinicId from context
			const clinicId = context.clinicId;

			// 2. Optional: Add a safety check if clinicId is strictly required
			if (!clinicId) {
				throw new Error("Clinic ID is missing from context");
			}

			// Note: getPatientGrowthRecords expects clinicId first (optional)
			return await pediatricRepo.getPatientGrowthRecords(clinicId, patientId);
		} catch (error) {
			console.error("Error getting measurements by patient:", error);
			throw new Error("Failed to get measurements");
		}
	});
export const listMeasurements = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(listMeasurementsSchema)
	.handler(async ({ data, context }) => {
		try {
			const { patientId, limit, offset } = data;
			const clinicId = context.clinicId;
			return await pediatricRepo.listGrowthRecords(
				clinicId, // clinicId - optional
				patientId,
				limit,
				offset
			);
		} catch (error) {
			console.error("Error listing measurements:", error);
			throw new Error("Failed to list measurements");
		}
	});

export const createMeasurement = createServerFn({ method: "POST" })
	.middleware([authMiddleware])

	.validator(
		MeasurementCreateSchema.extend({
			// Make chronologicalAgeMonths optional
			chronologicalAgeMonths: z.number().optional()
		})
	)
	.handler(async ({ context, data }) => {
		try {
			const { patientId, ...measurementData } = data;
			const clinicId = context.clinicId;
			// Get patient to calculate age if not provided
			let chronologicalAgeMonths = measurementData.chronologicalAgeMonths;
			if (!chronologicalAgeMonths) {
				const patient = await db.query.patient.findFirst({
					where: { id: patientId },
					columns: { dateOfBirth: true }
				});
				if (patient?.dateOfBirth) {
					chronologicalAgeMonths = calculateAgeInMonths(
						patient.dateOfBirth,
						measurementData.measurementDate || new Date()
					);
				} else {
					chronologicalAgeMonths = 0;
				}
			}

			return await pediatricRepo.addMeasurementPoint(
				{
					patientId,
					measurementDate: measurementData.measurementDate,
					weightKg: measurementData.weightKg ?? 0,
					heightCm: measurementData.heightCm ?? 0,
					headCircumferenceCm: measurementData.headCircumferenceCm ?? 0,
					notes: measurementData.clinicalNotes ?? "",
					ageMonth: chronologicalAgeMonths // include calculated age in payload
				},
				clinicId
			);
		} catch (error) {
			console.error("Error creating measurement:", error);
			throw new Error("Failed to create measurement");
		}
	});

export const updateMeasurement = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: MeasurementUpdateSchema }))
	.handler(async ({ data }) => {
		try {
			const { id, data: updateData } = data;
			// Cast to the repository update payload type to satisfy attachmentIds compatibility
			return await pediatricRepo.updateMeasurement(
				id,
				updateData as Parameters<typeof pediatricRepo.updateMeasurement>[1]
			);
		} catch (error) {
			console.error("Error updating measurement:", error);
			throw new Error("Failed to update measurement");
		}
	});

export const deleteMeasurement = createServerFn({ method: "POST" })
	.validator(measurementIdSchema)
	.handler(async ({ data }) => {
		try {
			const { id } = data;
			return await pediatricRepo.deleteMeasurement(id);
		} catch (error) {
			console.error("Error deleting measurement:", error);
			throw new Error("Failed to delete measurement");
		}
	});

export const getLatestMeasurement = createServerFn({ method: "GET" })
	.middleware([authMiddleware])

	.validator(patientIdSchema)
	.handler(async ({ context, data }) => {
		try {
			const { patientId } = data;
			const clinicId = context.clinicId;
			const records = await pediatricRepo.getPatientGrowthRecords(clinicId, patientId);
			return records.length > 0 ? records[0] : null;
		} catch (error) {
			console.error("Error getting latest measurement:", error);
			throw new Error("Failed to get latest measurement");
		}
	});

// export const getGrowthChartData = createServerFn({ method: "GET" })
// 	.validator(
// 		z.object({
// 			patientId: z.string(),
// 			metric: z.enum(["weight", "height", "bmi"])
// 		})
// 	)
// 	.handler(async ({ data }) => {
// 		try {
// 			const { patientId, metric } = data;
// 			return await growthChartRepo.getGrowthChartData({
// 				patientId,
// 				metric: metric as "weight" | "height" | "bmi",
// 				referenceSource: "egypt2020"
// 			});
// 		} catch (error) {
// 			console.error("Error getting growth chart data:", error);
// 			throw new Error("Failed to get growth chart data");
// 		}
// 	});
