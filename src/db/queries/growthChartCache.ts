// Repository for growth chart cache table

import { db } from "#/db/client.server";
import { eq, lt } from "drizzle-orm";
import * as schema from "../schema";

// =======================
// Zod Validators
// =======================

// =======================
// Server Functions
// =======================

export const growthChartCacheRepo = {
	async getChartCache(params: {
		patientId: string;
		chartType: "WEIGHT" | "HEIGHT" | "BMI" | "HEAD" | "VELOCITY";
		referenceSource: "WHO_2006" | "WHO_2007" | "EGYPT_2020" | "CDC_2000";
	}) {
		const { patientId, chartType, referenceSource } = params;

		const cache = await db.query.growthChartCache.findFirst({
			where: { patientId, chartType, referenceSource }
		});

		// Check if cache is expired
		if (cache?.expiresAt && cache.expiresAt < new Date()) {
			await db.delete(schema.growthChartCache).where(eq(schema.growthChartCache.id, cache.id));
			return null;
		}

		return cache;
	},

	async getCacheById(id: string) {
		return await db.query.growthChartCache.findFirst({
			where: { id }
		});
	},

	async getCachesByPatient(patientId: string) {
		return await db.query.growthChartCache.findMany({
			where: { patientId }
		});
	},

	async createOrUpdateCache(data: schema.NewGrowthChartCache) {
		const now = new Date();

		// Check if cache exists
		const existing = await db.query.growthChartCache.findFirst({
			where: {
				patientId: data.patientId,
				chartType: data.chartType,
				referenceSource: data.referenceSource
			}
		});

		if (existing) {
			const [result] = await db
				.update(schema.growthChartCache)
				.set({
					chartData: data.chartData,
					lastCalculatedAt: now,
					expiresAt: data.expiresAt
				})
				.where(eq(schema.growthChartCache.id, existing.id))
				.returning();
			return result;
		}

		const [result] = await db
			.insert(schema.growthChartCache)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID(),
				lastCalculatedAt: now
			})
			.returning();
		return result;
	},

	async deleteCache(id: string) {
		const [result] = await db.delete(schema.growthChartCache).where(eq(schema.growthChartCache.id, id)).returning();
		return result;
	},

	async deleteCacheByPatient(patientId: string) {
		return await db
			.delete(schema.growthChartCache)
			.where(eq(schema.growthChartCache.patientId, patientId))
			.returning();
	},

	async clearExpiredCache() {
		return await db
			.delete(schema.growthChartCache)
			.where(lt(schema.growthChartCache.expiresAt, new Date()))
			.returning();
	},

	async invalidatePatientCache(params: {
		patientId: string;
		chartType?: "WEIGHT" | "HEIGHT" | "BMI" | "HEAD" | "VELOCITY";
	}) {
		const { patientId, chartType } = params;
		const conditions = [eq(schema.growthChartCache.patientId, patientId)];
		if (chartType) {
			conditions.push(eq(schema.growthChartCache.chartType, chartType));
		}
		return await db
			.delete(schema.growthChartCache)
			.where(conditions.length > 1 ? conditions[0] : conditions[0]) // Simplified for single/multi condition logic
			.returning();
	}
};
