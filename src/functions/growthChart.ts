// Server functions for growth chart data aggregation

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { growthChartRepo } from "@/db/queries/growthChart";

// =======================
// Zod Validators
// =======================

const patientIdSchema = z.object({
	patientId: z.string().min(1)
});

const getChartDataSchema = z.object({
	patientId: z.string().min(1),
	metric: z.enum(["weight", "height", "bmi"]),
	referenceSource: z.enum(["who2006", "who2007", "egypt2020", "cdc2000"]).default("egypt2020")
});

// =======================
// Server Functions
// =======================

export const getGrowthChartData = createServerFn({ method: "GET" })
	.validator(getChartDataSchema)
	.handler(async ctx => {
		try {
			return await growthChartRepo.getGrowthChartData(ctx.data);
		} catch (error) {
			console.error("Error getting growth chart data:", error);
			throw new Error("Failed to get growth chart data");
		}
	});
export const getGrowthChartSummary = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			return await growthChartRepo.getGrowthChartSummary(patientId);
		} catch (error) {
			console.error("Error getting growth chart summary:", error);
			throw new Error("Failed to get growth chart summary");
		}
	});
