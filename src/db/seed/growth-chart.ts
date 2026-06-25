// ============================================
// FILE: src/db/seed/seed-growth-chart.ts
// ============================================
// Growth chart data generator for patient charts

import type { DB } from "../client.server";
import type { Measurement } from "../schema";

export interface GrowthChartData {
	growthAlerts: Array<{
		type: string;
		severity: string;
		date: Date;
		message: string;
	}>;
	measurements: Array<{
		ageMonths: number;
		date: Date;
		weight: number | null;
		height: number | null;
		bmi: number | null;
		headCircumference: number | null;
		zScores: {
			weightForAge: number | null;
			heightForAge: number | null;
			bmiForAge: number | null;
			headForAge: number | null;
		};
		percentiles: {
			weight: number | null;
			height: number | null;
			bmi: number | null;
			head: number | null;
		};
	}>;
	patientId: string;
}

export async function generatePatientGrowthChart(db: DB, patientId: string): Promise<GrowthChartData | null> {
	const measurements = await db.query.measurement.findMany({
		where: { patientId },
		orderBy: { measurementDate: "asc" }
	});

	if (measurements.length === 0) {
		return null;
	}

	const alerts = await db.query.growthAlert.findMany({
		where: { patientId },
		orderBy: { createdAt: "asc" }
	});

	return {
		patientId,
		measurements: measurements.map(m => ({
			ageMonths: m.chronologicalAgeMonths,
			date: m.measurementDate,
			weight: m.weightKg,
			height: m.heightCm,
			bmi: m.bmi,
			headCircumference: m.headCircumferenceCm,
			zScores: {
				weightForAge: m.weightForAgeZ,
				heightForAge: m.heightForAgeZ,
				bmiForAge: m.bmiForAgeZ,
				headForAge: m.headCircumferenceForAgeZ
			},
			percentiles: {
				weight: m.weightPercentile,
				height: m.heightPercentile,
				bmi: m.bmiPercentile,
				head: null
			}
		})),
		growthAlerts: alerts.map(a => ({
			type: a.alertType,
			severity: a.severity,
			date: a.createdAt,
			message: a.message
		}))
	};
}

export function generateChartData(measurements: Measurement[]) {
	// Generate reference lines for growth charts
	const referencePercentiles = [3, 15, 50, 85, 97];

	const sortedMeasurements = [...measurements].sort((a, b) => a.chronologicalAgeMonths - b.chronologicalAgeMonths);

	return {
		points: sortedMeasurements.map(m => ({
			ageMonths: m.chronologicalAgeMonths,
			weight: m.weightKg,
			height: m.heightCm,
			bmi: m.bmi,
			headCircumference: m.headCircumferenceCm,
			weightZ: m.weightForAgeZ,
			heightZ: m.heightForAgeZ,
			bmiZ: m.bmiForAgeZ,
			headZ: m.headCircumferenceForAgeZ
		})),
		referencePercentiles,
		// These would be populated from LMS data
		referenceLines: {
			weight: [],
			height: [],
			bmi: [],
			head: []
		}
	};
}
