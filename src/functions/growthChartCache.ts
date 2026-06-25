// Server functions for growth chart cache table

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { queries } from "@/db/queries";

// =======================
// Zod Validators
// =======================

const cacheIdSchema = z.object({
	id: z.string().min(1)
});

const patientIdSchema = z.object({
	patientId: z.string().min(1)
});

const createCacheSchema = z.object({
	patientId: z.string().min(1),
	chartType: z.enum(["weight", "height", "bmi", "head", "velocity"]),
	referenceSource: z.enum(["who2006", "who2007", "egypt2020", "cdc2000"]),
	chartData: z
		.object({
			measurements: z.array(
				z.object({
					ageMonths: z.number(),
					measurementDate: z.string(),
					value: z.number(),
					zScore: z.number(),
					percentile: z.number()
				})
			),
			references: z.array(
				z.object({
					ageMonths: z.number(),
					sd3neg: z.number(),
					sd2neg: z.number(),
					sd1neg: z.number(),
					median: z.number(),
					sd1pos: z.number(),
					sd2pos: z.number(),
					sd3pos: z.number()
				})
			)
		})
		.optional(),
	expiresAt: z.date().optional()
});

const getCacheSchema = z.object({
	patientId: z.string().min(1),
	chartType: z.enum(["weight", "height", "bmi", "head", "velocity"]),
	referenceSource: z.enum(["who2006", "who2007", "egypt2020", "cdc2000"])
});

const invalidateCacheSchema = z.object({
	patientId: z.string().min(1),
	chartType: z.enum(["weight", "height", "bmi", "head", "velocity"]).optional()
});

// =======================
// Server Functions
// =======================

export const getChartCache = createServerFn({ method: "GET" })
	.validator(getCacheSchema)
	.handler(async ctx => {
		try {
			const { patientId, chartType, referenceSource } = ctx.data;
			const cache = await queries.growthChartCache.getChartCache({
				patientId,
				chartType: chartType.toUpperCase() as "WEIGHT" | "HEIGHT" | "BMI" | "HEAD" | "VELOCITY",
				referenceSource: referenceSource.toUpperCase() as "WHO_2006" | "WHO_2007" | "EGYPT_2020" | "CDC_2000"
			});
			return cache;
		} catch (error) {
			console.error("Error getting chart cache:", error);
			throw new Error("Failed to get chart cache");
		}
	});

export const getCacheById = createServerFn({ method: "GET" })
	.validator(cacheIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const cache = await queries.growthChartCache.getCacheById(id);
			return cache;
		} catch (error) {
			console.error("Error getting cache by ID:", error);
			throw new Error("Failed to get cache");
		}
	});

export const getCachesByPatient = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const caches = await queries.growthChartCache.getCachesByPatient(patientId);
			return caches;
		} catch (error) {
			console.error("Error getting caches by patient:", error);
			throw new Error("Failed to get caches");
		}
	});

export const createOrUpdateCache = createServerFn({ method: "POST" })
	.validator(createCacheSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const cache = await queries.growthChartCache.createOrUpdateCache({
				...data,
				chartType: data.chartType.toUpperCase() as "WEIGHT" | "HEIGHT" | "BMI" | "HEAD" | "VELOCITY",
				referenceSource: data.referenceSource.toUpperCase() as
					| "WHO_2006"
					| "WHO_2007"
					| "EGYPT_2020"
					| "CDC_2000"
			});
			return cache;
		} catch (error) {
			console.error("Error creating/updating cache:", error);
			throw new Error("Failed to create/update cache");
		}
	});

export const deleteCache = createServerFn({ method: "POST" })
	.validator(cacheIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const cache = await queries.growthChartCache.deleteCache(id);
			if (!cache) {
				throw new Error("Cache not found");
			}
			return cache;
		} catch (error) {
			console.error("Error deleting cache:", error);
			throw new Error("Failed to delete cache");
		}
	});

export const deleteCacheByPatient = createServerFn({ method: "POST" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const result = await queries.growthChartCache.deleteCacheByPatient(patientId);
			return result;
		} catch (error) {
			console.error("Error deleting caches by patient:", error);
			throw new Error("Failed to delete caches");
		}
	});

export const clearExpiredCache = createServerFn({ method: "POST" }).handler(async () => {
	try {
		const result = await queries.growthChartCache.clearExpiredCache();
		return result;
	} catch (error) {
		console.error("Error clearing expired cache:", error);
		throw new Error("Failed to clear expired cache");
	}
});

export const invalidatePatientCache = createServerFn({ method: "POST" })
	.validator(invalidateCacheSchema)
	.handler(async ctx => {
		try {
			const { patientId, chartType } = ctx.data;
			const result = await queries.growthChartCache.invalidatePatientCache({
				patientId,
				chartType: chartType?.toUpperCase() as "WEIGHT" | "HEIGHT" | "BMI" | "HEAD" | "VELOCITY" | undefined
			});
			return result;
		} catch (error) {
			console.error("Error invalidating patient cache:", error);
			throw new Error("Failed to invalidate cache");
		}
	});
