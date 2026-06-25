// Server functions for growth chart data aggregation

import z from "zod";
import { type DBorTx, db } from "@/db/client";

// =======================
// Zod Validators
// =======================

const getChartDataSchema = z.object({
	patientId: z.string().min(1),
	metric: z.enum(["weight", "height", "bmi"]),
	referenceSource: z.enum(["who2006", "who2007", "egypt2020", "cdc2000"]).default("egypt2020")
});

// =======================
// Server Functions
// =======================

export const growthChartRepo = {
	async getGrowthChartData(params: z.infer<typeof getChartDataSchema>, tx?: DBorTx) {
		const client = tx ?? db;
		const { patientId, metric, referenceSource } = params;

		// Get patient measurements
		const measurements = await client.query.measurement.findMany({
			where: { patientId },
			orderBy: (m, { asc }) => [asc(m.measurementDate)]
		});

		// Get patient for gender
		const patient = await client.query.patient.findFirst({
			where: { id: patientId },
			columns: { gender: true, dateOfBirth: true }
		});

		if (!patient) {
			throw new Error("Patient not found");
		}

		// Get Egyptian reference data
		const gender = patient.gender === "boy" ? "boy" : "girl";
		const metricType = metric === "bmi" ? "weight" : metric;

		const references = await client.query.lmsReference.findMany({
			where: { gender, metric: metricType as "WEIGHT" | "HEIGHT" },
			orderBy: { ageMonths: "asc" }
		});

		// Transform measurements for chart
		const chartData = measurements.map(m => {
			let value: number | null = null;
			let zScore: number | null = null;
			let percentile: number | null = null;

			if (metric === "weight") {
				value = m.weightKg;
				zScore = m.weightForAgeZ;
				percentile = m.weightPercentile;
			} else if (metric === "height") {
				value = m.heightCm || m.lengthCm;
				zScore = m.heightForAgeZ;
				percentile = m.heightPercentile;
			} else if (metric === "bmi") {
				value = m.bmi;
				zScore = m.bmiForAgeZ;
				percentile = m.bmiPercentile;
			}

			return {
				date: m.measurementDate,
				ageMonths: m.chronologicalAgeMonths,
				value,
				zScore,
				percentile
			};
		});

		// Transform references for chart (SD lines)
		const referenceLines = references.map(r => ({
			ageMonths: r.ageMonths,
			sd3neg: r.sd3neg,
			sd2neg: r.sd2neg,
			sd1neg: r.sd1neg,
			median: r.median,
			sd1pos: r.sd1pos,
			sd2pos: r.sd2pos,
			sd3pos: r.sd3pos
		}));

		return {
			patient: { gender: patient.gender, dateOfBirth: patient.dateOfBirth },
			chartData,
			referenceLines,
			referenceSource
		};
	},

	async getGrowthChartSummary(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;

		// Get latest measurement
		const latestMeasurement = await client.query.measurement.findFirst({
			where: { patientId },
			orderBy: { measurementDate: "desc" }
		});

		if (!latestMeasurement) {
			return null;
		}

		// Get patient for gender
		const patient = await client.query.patient.findFirst({
			where: { id: patientId },
			columns: { gender: true, dateOfBirth: true }
		});

		if (!patient) {
			throw new Error("Patient not found");
		}

		// Get all measurements for trend analysis
		const allMeasurements = await client.query.measurement.findMany({
			where: { patientId },
			orderBy: (m, { asc }) => [asc(m.measurementDate)],
			columns: {
				measurementDate: true,
				chronologicalAgeMonths: true,
				weightKg: true,
				heightCm: true,
				bmi: true,
				weightForAgeZ: true,
				heightForAgeZ: true,
				bmiForAgeZ: true
			}
		});

		// Calculate trends
		const weightTrend = calculateTrend(allMeasurements.map(m => m.weightKg).filter((v): v is number => v !== null));
		const heightTrend = calculateTrend(allMeasurements.map(m => m.heightCm).filter((v): v is number => v !== null));
		const bmiTrend = calculateTrend(allMeasurements.map(m => m.bmi).filter((v): v is number => v !== null));

		const weightZTrend = calculateTrend(
			allMeasurements.map(m => m.weightForAgeZ).filter((v): v is number => v !== null)
		);
		const heightZTrend = calculateTrend(
			allMeasurements.map(m => m.heightForAgeZ).filter((v): v is number => v !== null)
		);
		const bmiZTrend = calculateTrend(allMeasurements.map(m => m.bmiForAgeZ).filter((v): v is number => v !== null));

		// Get unresolved alerts
		const alerts = await client.query.growthAlert.findMany({
			where: { patientId, isResolved: false },
			orderBy: { createdAt: "desc" },
			limit: 5
		});

		return {
			latestMeasurement: {
				date: latestMeasurement.measurementDate,
				ageMonths: latestMeasurement.chronologicalAgeMonths,
				weight: latestMeasurement.weightKg,
				height: latestMeasurement.heightCm,
				bmi: latestMeasurement.bmi,
				weightZ: latestMeasurement.weightForAgeZ,
				heightZ: latestMeasurement.heightForAgeZ,
				bmiZ: latestMeasurement.bmiForAgeZ,
				weightPercentile: latestMeasurement.weightPercentile,
				heightPercentile: latestMeasurement.heightPercentile,
				bmiPercentile: latestMeasurement.bmiPercentile
			},
			trends: {
				weight: weightTrend,
				height: heightTrend,
				bmi: bmiTrend,
				weightZ: weightZTrend,
				heightZ: heightZTrend,
				bmiZ: bmiZTrend
			},
			alerts,
			totalMeasurements: allMeasurements.length
		};
	}
};

// Helper function to calculate trend
function calculateTrend(values: number[]): {
	current: number;
	change: number;
	changePercent: number;
} {
	if (values.length < 2) {
		return { current: values[0] || 0, change: 0, changePercent: 0 };
	}

	const current = values[values.length - 1] ?? 0;
	const previous = values[0] ?? 0;
	const change = current - previous;
	const changePercent = previous === 0 ? 0 : (change / previous) * 100;

	return { current, change, changePercent };
}
