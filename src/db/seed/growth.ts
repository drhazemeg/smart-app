// ============================================
// FILE: src/db/seed/growth.ts
// ============================================
// Growth chart data generator for patient charts
import { faker } from "@faker-js/faker";
import type { DB } from "../client.server";
import { growthAlert, type lmsReference, measurement } from "../schema";
import type { DbPatient, ReferenceSource } from "../zod";
import type { CoreData } from "./core";
import { calculateAgeInMonths, getRandomSubset } from "./utils";

const CONFIG = {
	totalMeasurements: 500,
	totalAlerts: 50
};

export interface GrowthData {
	lmsReferences: (typeof lmsReference.$inferSelect)[];
	measurements: (typeof measurement.$inferSelect)[];
}

export async function seedGrowthData(db: DB, coreData: CoreData): Promise<GrowthData> {
	console.log("🌱 Seeding growth data...");

	const measurements = await createMeasurements(db, coreData.patients);
	console.log(`  ✅ ${measurements.length} measurements created`);

	await createGrowthAlerts(db, measurements as unknown as (typeof measurement.$inferSelect)[]);
	console.log(`  ✅ ${CONFIG.totalAlerts} growth alerts created`);

	// LMS data is seeded separately, so we return an empty array here for the summary.
	return {
		measurements: measurements as unknown as (typeof measurement.$inferSelect)[],
		lmsReferences: []
	};
}

async function createMeasurements(db: DB, patients: DbPatient[]) {
	const measurements: (typeof measurement.$inferInsert)[] = [];
	for (let i = 0; i < CONFIG.totalMeasurements; i++) {
		const patient = faker.helpers.arrayElement(patients);
		const now = new Date();
		const measurementDate = faker.date.between({
			from: patient.dateOfBirth <= now ? patient.dateOfBirth : now,
			to: patient.dateOfBirth <= now ? now : patient.dateOfBirth
		});
		const ageMonths = calculateAgeInMonths(patient.dateOfBirth, measurementDate);

		const weightKg = faker.number.float({ min: 2, max: 40, fractionDigits: 2 });
		const heightCm = faker.number.float({
			min: 50,
			max: 150,
			fractionDigits: 1
		});

		const measurementData = {
			id: faker.string.uuid() ?? "",
			clinicId: patient.clinicId,
			patientId: patient.id,
			medicalRecordId: null,
			measurementDate,
			chronologicalAgeMonths: ageMonths,
			weightKg,
			heightCm,
			headCircumferenceCm: faker.datatype.boolean(0.8)
				? faker.number.float({ min: 30, max: 55, fractionDigits: 1 })
				: null,
			bmi: weightKg / (heightCm / 100) ** 2,
			weightForAgeZ: faker.number.float({ min: -3, max: 3, fractionDigits: 2 }),
			heightForAgeZ: faker.number.float({ min: -3, max: 3, fractionDigits: 2 }),
			bmiForAgeZ: faker.number.float({ min: -3, max: 3, fractionDigits: 2 }),
			headCircumferenceForAgeZ: faker.number.float({
				min: -3,
				max: 3,
				fractionDigits: 2
			}),
			weightPercentile: faker.number.float({
				min: 1,
				max: 99,
				fractionDigits: 1
			}),
			heightPercentile: faker.number.float({
				min: 1,
				max: 99,
				fractionDigits: 1
			}),
			createdAt: measurementDate,
			updatedAt: measurementDate,
			measuredBy: null,
			measurementLocation: null,
			correctedAgeMonths: null,
			gestationalAgeAtMeasurement: null,
			lengthCm: null,
			chestCircumferenceCm: null,
			midUpperArmCircumferenceCm: null,
			tricepsSkinfoldMm: null,
			subscapularSkinfoldMm: null,
			bmiPercentile: null,
			weightForLengthPercentile: null,
			referenceSource: "WHO_2007" as ReferenceSource,
			weightForHeightZ: faker.number.float({
				min: -3,
				max: 3,
				fractionDigits: 2
			}),
			weightVelocityGPerDay: null,
			heightVelocityCmPerYear: null,
			headGrowthVelocityCmPerWeek: null,
			nutritionalStatus: null,
			stuntingStatus: null,
			wastingStatus: null,
			milestones: null,
			developmentalAgeMonths: null,
			feedingType: null,
			sleepHoursPerDay: null,
			physicalActivityMinutesPerDay: null,
			clinicalNotes: null,
			recommendations: null,
			followUpPlan: null,
			attachmentIds: null,
			createdBy: null,
			updatedBy: null,
			syncStatus: "PENDING" as const,
			version: 1,
			followUpDate: null
		};
		measurements.push(measurementData);
	}
	if (measurements.length > 0) {
		await db.insert(measurement).values(measurements);
	}
	return measurements;
}
async function createGrowthAlerts(db: DB, measurements: (typeof measurement.$inferSelect)[]) {
	// Change $inferSelect to $inferInsert
	const alerts: (typeof growthAlert.$inferInsert)[] = [];

	const subset = getRandomSubset(measurements, CONFIG.totalAlerts);

	for (const meas of subset) {
		const alertData: typeof growthAlert.$inferInsert = {
			id: faker.string.uuid(),
			clinicId: meas.clinicId,
			patientId: meas.patientId,
			measurementId: meas.id,
			alertType: faker.helpers.arrayElement([
				"SEVERE_UNDERWEIGHT",
				"MODERATE_UNDERWEIGHT",
				"SEVERE_STUNTING",
				"OBESITY"
			]),
			severity: faker.helpers.arrayElement(["WARNING", "CRITICAL"]),
			zScore: meas.weightForAgeZ,
			message: faker.lorem.sentence(),
			isResolved: faker.datatype.boolean(0.3),
			createdAt: meas.measurementDate
			// You can now omit fields that have defaults in your DB schema
		};
		alerts.push(alertData);
	}

	if (alerts.length > 0) {
		await db.insert(growthAlert).values(alerts);
	}
	return alerts;
}

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

export function generateChartData(measurements: (typeof measurement.$inferSelect)[]) {
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
