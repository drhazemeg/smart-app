// Server functions for growth percentile history table

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { queries } from "@/db/queries";

// =======================
// Zod Validators
// =======================

const historyIdSchema = z.object({
	id: z.string().min(1)
});

const patientIdSchema = z.object({
	patientId: z.string().min(1)
});

const createHistorySchema = z.object({
	patientId: z.string().min(1),
	measurementId: z.string().min(1),
	ageMonths: z.number(),
	weightPercentile: z.number().optional(),
	heightPercentile: z.number().optional(),
	bmiPercentile: z.number().optional(),
	headPercentile: z.number().optional(),
	weightChannel: z.number().optional(),
	heightChannel: z.number().optional(),
	bmiChannel: z.number().optional(),
	weightChannelCrossed: z.boolean().optional(),
	heightChannelCrossed: z.boolean().optional()
});

const updateHistorySchema = z.object({
	weightPercentile: z.number().optional(),
	heightPercentile: z.number().optional(),
	bmiPercentile: z.number().optional(),
	headPercentile: z.number().optional(),
	weightChannel: z.number().optional(),
	heightChannel: z.number().optional(),
	bmiChannel: z.number().optional(),
	weightChannelCrossed: z.boolean().optional(),
	heightChannelCrossed: z.boolean().optional()
});

const trendSchema = z.object({
	patientId: z.string().min(1),
	metric: z.enum(["weight", "height", "bmi", "head"])
});

// =======================
// Server Functions
// =======================

export const getPercentileHistoryById = createServerFn({ method: "GET" })
	.validator(historyIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const history = await queries.growthPercentileHistory.getPercentileHistoryById(id);
			return history;
		} catch (error) {
			console.error("Error getting percentile history by ID:", error);
			throw new Error("Failed to get percentile history");
		}
	});

export const getPercentileHistoryByPatient = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const history = await queries.growthPercentileHistory.getPercentileHistoryByPatient(patientId);
			return history;
		} catch (error) {
			console.error("Error getting percentile history by patient:", error);
			throw new Error("Failed to get percentile history");
		}
	});

export const getPercentileHistoryByMeasurement = createServerFn({
	method: "GET"
})
	.validator(z.object({ measurementId: z.string().min(1) }))
	.handler(async ctx => {
		try {
			const { measurementId } = ctx.data;
			const history = await queries.growthPercentileHistory.getPercentileHistoryByMeasurement(measurementId);
			return history;
		} catch (error) {
			console.error("Error getting percentile history by measurement:", error);
			throw new Error("Failed to get percentile history");
		}
	});

export const createPercentileHistory = createServerFn({ method: "POST" })
	.validator(createHistorySchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const history = await queries.growthPercentileHistory.createPercentileHistory(data);
			return history;
		} catch (error) {
			console.error("Error creating percentile history:", error);
			throw new Error("Failed to create percentile history");
		}
	});

export const updatePercentileHistory = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1), data: updateHistorySchema }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const history = await queries.growthPercentileHistory.updatePercentileHistory(id, data);
			if (!history) {
				throw new Error("Percentile history not found");
			}
			return history;
		} catch (error) {
			console.error("Error updating percentile history:", error);
			throw new Error("Failed to update percentile history");
		}
	});

export const deletePercentileHistory = createServerFn({ method: "POST" })
	.validator(historyIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const history = await queries.growthPercentileHistory.deletePercentileHistory(id);
			if (!history) {
				throw new Error("Percentile history not found");
			}
			return history;
		} catch (error) {
			console.error("Error deleting percentile history:", error);
			throw new Error("Failed to delete percentile history");
		}
	});

export const getPercentileTrend = createServerFn({ method: "GET" })
	.validator(trendSchema)
	.handler(async ctx => {
		try {
			const { patientId, metric } = ctx.data;
			const trend = await queries.growthPercentileHistory.getPercentileTrend({
				patientId,
				metric: metric as "weight" | "height" | "bmi" | "head"
			});
			return trend;
		} catch (error) {
			console.error("Error getting percentile trend:", error);
			throw new Error("Failed to get percentile trend");
		}
	});

export const getChannelCrossings = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const crossings = await queries.growthPercentileHistory.getChannelCrossings(patientId);
			return crossings;
		} catch (error) {
			console.error("Error getting channel crossings:", error);
			throw new Error("Failed to get channel crossings");
		}
	});

export const autoCreatePercentileHistory = createServerFn({ method: "POST" })
	.validator(z.object({ measurementId: z.string().min(1) }))
	.handler(async ctx => {
		try {
			const { measurementId } = ctx.data;
			const result = await queries.growthPercentileHistory.autoCreatePercentileHistory(measurementId);
			return result;
		} catch (error) {
			console.error("Error auto-creating percentile history:", error);
			throw new Error("Failed to auto-create percentile history");
		}
	});
