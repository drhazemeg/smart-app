// functions/analytics.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { analyticsRepo } from "@/db/queries/analytics.repo";

// Schema definitions
const clinicDateRangeSchema = z.object({
	clinicId: z.string().min(1),
	startDate: z.date(),
	endDate: z.date()
});

const clinicYearSchema = z.object({
	clinicId: z.string().min(1),
	year: z.number().int().min(2000).max(2100)
});

const clinicDateRangeLimitSchema = z.object({
	clinicId: z.string().min(1),
	startDate: z.date(),
	endDate: z.date(),
	limit: z.number().int().positive().default(10)
});

// Server Functions - Using analyticsRepo
const getNewPatientsCount = createServerFn({ method: "GET" })
	.validator(clinicDateRangeSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			const count = await analyticsRepo.getNewPatientsCount(clinicId, startDate, endDate);
			return { newPatientsCount: count };
		} catch (error) {
			console.error("Error getting new patients count:", error);
			throw new Error("Failed to get new patients count");
		}
	});

const getPatientDemographics = createServerFn({ method: "GET" })
	.validator(clinicDateRangeSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			return await analyticsRepo.getPatientDemographics(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting patient demographics:", error);
			throw new Error("Failed to get patient demographics");
		}
	});

const getTopConditions = createServerFn({ method: "GET" })
	.validator(clinicDateRangeLimitSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate, limit } = data;
			return await analyticsRepo.getTopConditions(clinicId, startDate, endDate, limit);
		} catch (error) {
			console.error("Error getting top conditions:", error);
			throw new Error("Failed to get top conditions");
		}
	});

const getSeasonalAppointmentData = createServerFn({ method: "GET" })
	.validator(clinicYearSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, year } = data;
			return await analyticsRepo.getSeasonalAppointmentData(clinicId, year);
		} catch (error) {
			console.error("Error getting seasonal appointment data:", error);
			throw new Error("Failed to get seasonal appointment data");
		}
	});

const getImmunizationCoverage = createServerFn({ method: "GET" })
	.validator(clinicDateRangeSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			return await analyticsRepo.getImmunizationCoverage(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting immunization coverage:", error);
			throw new Error("Failed to get immunization coverage");
		}
	});

export {
	getImmunizationCoverage,
	getNewPatientsCount,
	getPatientDemographics,
	getSeasonalAppointmentData,
	getTopConditions
};
