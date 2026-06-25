// Server functions for growth percentile history table

import { type DBorTx, db } from "#/db/client.server";
import { eq } from "drizzle-orm";

import * as schema from "../schema";

export const growthPercentileRepo = {
	async getPercentileHistoryById(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthPercentileHistory.findFirst({
			where: { id },
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async getPercentileHistoryByPatient(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthPercentileHistory.findMany({
			where: { patientId },
			orderBy: { createdAt: "desc" },
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async getPercentileHistoryByMeasurement(measurementId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthPercentileHistory.findMany({
			where: { measurementId },
			orderBy: { createdAt: "desc" },
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async createPercentileHistory(data: schema.NewGrowthPercentileHistory, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.growthPercentileHistory)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID(),
				createdAt: new Date()
			})
			.returning();
		return result;
	},

	async updatePercentileHistory(id: string, data: Partial<schema.NewGrowthPercentileHistory>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.growthPercentileHistory)
			.set(data)
			.where(eq(schema.growthPercentileHistory.id, id))
			.returning();
		return result;
	},

	async deletePercentileHistory(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.delete(schema.growthPercentileHistory)
			.where(eq(schema.growthPercentileHistory.id, id))
			.returning();
		return result;
	},

	async getPercentileTrend(
		params: {
			patientId: string;
			metric: "weight" | "height" | "bmi" | "head";
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const { patientId, metric } = params;

		const history = await client.query.growthPercentileHistory.findMany({
			where: { patientId },
			orderBy: (h, { asc }) => [asc(h.ageMonths)]
		});

		const percentileKey = `${metric}Percentile` as keyof (typeof history)[0];
		const channelKey = `${metric}Channel` as keyof (typeof history)[0];
		const crossedKey = `${metric}ChannelCrossed` as keyof (typeof history)[0];

		return history.map(h => ({
			ageMonths: h.ageMonths,
			percentile: h[percentileKey] as number | null,
			channel: h[channelKey] as number | null,
			channelCrossed: h[crossedKey] as boolean | null,
			createdAt: h.createdAt
		}));
	},

	async getChannelCrossings(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		const history = await client.query.growthPercentileHistory.findMany({
			where: { patientId },
			orderBy: (h, { asc }) => [asc(h.ageMonths)]
		});

		return history.filter(h => h.weightChannelCrossed || h.heightChannelCrossed);
	},

	async autoCreatePercentileHistory(measurementId: string, tx?: DBorTx) {
		const client = tx ?? db;

		const measurement = await client.query.measurement.findFirst({
			where: { id: measurementId },
			with: { patient: true }
		});

		if (!measurement) {
			throw new Error("Measurement not found");
		}

		const previousHistory = await client.query.growthPercentileHistory.findFirst({
			where: { patientId: measurement.patientId },
			orderBy: (h, { desc }) => [desc(h.ageMonths)]
		});

		const weightChannel = measurement.weightForAgeZ
			? Math.max(1, Math.min(7, Math.floor(measurement.weightForAgeZ) + 4))
			: null;
		const heightChannel = measurement.heightForAgeZ
			? Math.max(1, Math.min(7, Math.floor(measurement.heightForAgeZ) + 4))
			: null;
		const bmiChannel = measurement.bmiForAgeZ
			? Math.max(1, Math.min(7, Math.floor(measurement.bmiForAgeZ) + 4))
			: null;

		const weightChannelCrossed =
			previousHistory && weightChannel && previousHistory.weightChannel
				? Math.abs(weightChannel - previousHistory.weightChannel) >= 1
				: false;
		const heightChannelCrossed =
			previousHistory && heightChannel && previousHistory.heightChannel
				? Math.abs(heightChannel - previousHistory.heightChannel) >= 1
				: false;

		const [result] = await client
			.insert(schema.growthPercentileHistory)
			.values({
				id: crypto.randomUUID(),
				patientId: measurement.patientId,
				measurementId,
				ageMonths: measurement.chronologicalAgeMonths,
				weightPercentile: measurement.weightPercentile,
				heightPercentile: measurement.heightPercentile,
				bmiPercentile: measurement.bmiPercentile,
				headPercentile: null,
				weightChannel,
				heightChannel,
				bmiChannel,
				weightChannelCrossed,
				heightChannelCrossed,
				createdAt: new Date()
			})
			.returning();

		return result;
	}
};
