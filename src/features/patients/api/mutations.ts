// products/patients/api/mutations.ts
import { mutationOptions } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query-client";
import type { MeasurementCreateInput } from "../../../db/zod";
import { patientKeys } from "./queries";
import {
	createMeasurement,
	createPatient,
	deleteMeasurement,
	deletePatient,
	deletePatientPermanently,
	restorePatient,
	updateMeasurement,
	updatePatient
} from "./service";
import type { PatientMutationPayload } from "./types";

// ============================================================
// Measurement Mutations
// ============================================================

// src/features/patients/api/mutations.ts

// ============================================================
// Helper to clean measurement data with proper typing
// ============================================================

// Define a type that matches what the repository expects
type RepositoryMeasurementInput = {
	patientId: string;
	clinicId: string;
	measurementDate: Date;
	chronologicalAgeMonths: number;
	correctedAgeMonths?: number | null;
	gestationalAgeAtMeasurement?: number | null;
	followUpDate?: Date | null;
	weightKg?: number | null;
	heightCm?: number | null;
	lengthCm?: number | null;
	headCircumferenceCm?: number | null;
	chestCircumferenceCm?: number | null;
	midUpperArmCircumferenceCm?: number | null;
	tricepsSkinfoldMm?: number | null;
	subscapularSkinfoldMm?: number | null;
	bmi?: number | null;
	bmiPercentile?: number | null;
	weightForAgeZ?: number | null;
	heightForAgeZ?: number | null;
	bmiForAgeZ?: number | null;
	headCircumferenceForAgeZ?: number | null;
	weightPercentile?: number | null;
	heightPercentile?: number | null;
	nutritionalStatus?:
		| "SEVERE_ACUTE_MALNUTRITION"
		| "MODERATE_ACUTE_MALNUTRITION"
		| "AT_RISK"
		| "NORMAL"
		| "OVERWEIGHT"
		| "OBESE"
		| "SEVERE_OBESITY"
		| null;
	stuntingStatus?: "SEVERE_STUNTING" | "MODERATE_STUNTING" | "NORMAL" | "TALL" | null;
	wastingStatus?: "SEVERE_WASTING" | "MODERATE_WASTING" | "NORMAL" | "OVERWEIGHT" | null;
	clinicalNotes?: string | null;
	recommendations?: string | null;
	followUpPlan?: string | null;
	attachmentIds?: string[] | null;
};

function cleanMeasurementData(data: MeasurementCreateInput): RepositoryMeasurementInput {
	const cleaned: Partial<RepositoryMeasurementInput> = {};

	// Required fields
	cleaned.patientId = data.patientId;
	cleaned.clinicId = data.clinicId ?? "";
	cleaned.measurementDate = data.measurementDate ?? new Date();
	cleaned.chronologicalAgeMonths = data.chronologicalAgeMonths ?? 0;

	// Optional fields - only include if not null/undefined
	type OptionalField = keyof Pick<
		MeasurementCreateInput,
		| "correctedAgeMonths"
		| "gestationalAgeAtMeasurement"
		| "followUpDate"
		| "weightKg"
		| "heightCm"
		| "lengthCm"
		| "headCircumferenceCm"
		| "chestCircumferenceCm"
		| "midUpperArmCircumferenceCm"
		| "tricepsSkinfoldMm"
		| "subscapularSkinfoldMm"
		| "bmi"
		| "bmiPercentile"
		| "weightForAgeZ"
		| "heightForAgeZ"
		| "bmiForAgeZ"
		| "headCircumferenceForAgeZ"
		| "weightPercentile"
		| "heightPercentile"
		| "nutritionalStatus"
		| "stuntingStatus"
		| "wastingStatus"
		| "clinicalNotes"
		| "recommendations"
		| "followUpPlan"
		| "attachmentIds"
	>;

	const optionalFields: OptionalField[] = [
		"correctedAgeMonths",
		"gestationalAgeAtMeasurement",
		"followUpDate",
		"weightKg",
		"heightCm",
		"lengthCm",
		"headCircumferenceCm",
		"chestCircumferenceCm",
		"midUpperArmCircumferenceCm",
		"tricepsSkinfoldMm",
		"subscapularSkinfoldMm",
		"bmi",
		"bmiPercentile",
		"weightForAgeZ",
		"heightForAgeZ",
		"bmiForAgeZ",
		"headCircumferenceForAgeZ",
		"weightPercentile",
		"heightPercentile",
		"nutritionalStatus",
		"stuntingStatus",
		"wastingStatus",
		"clinicalNotes",
		"recommendations",
		"followUpPlan",
		"attachmentIds"
	];

	for (const field of optionalFields) {
		const value = data[field];
		if (value !== undefined && value !== null) {
			// Handle attachmentIds specially - ensure it's an array or null
			if (field === "attachmentIds") {
				// If it's a string, convert to single-element array
				if (typeof value === "string") {
					(cleaned as Record<string, unknown>)[field] = [value];
				} else if (Array.isArray(value)) {
					(cleaned as Record<string, unknown>)[field] = value;
				} else {
					(cleaned as Record<string, unknown>)[field] = null;
				}
			} else {
				(cleaned as Record<string, unknown>)[field] = value;
			}
		}
	}

	return cleaned as RepositoryMeasurementInput;
}

// ============================================================
// Patient Mutations
// ============================================================

export const createPatientMutation = mutationOptions({
	mutationFn: (data: PatientMutationPayload) => createPatient(data),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
	}
});

export const updatePatientMutation = mutationOptions({
	mutationFn: ({ id, values }: { id: string; values: PatientMutationPayload }) => updatePatient(id, values),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
		getQueryClient().invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
		getQueryClient().invalidateQueries({ queryKey: patientKeys.fullDetail(variables.id) });
		getQueryClient().invalidateQueries({ queryKey: patientKeys.summary(variables.id) });
	}
});

export const deletePatientMutation = mutationOptions({
	mutationFn: (id: string) => deletePatient(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
	}
});

export const deletePatientPermanentlyMutation = mutationOptions({
	mutationFn: (id: string) => deletePatientPermanently(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
	}
});

export const restorePatientMutation = mutationOptions({
	mutationFn: (id: string) => restorePatient(id),
	onSuccess: (_, id) => {
		getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
		getQueryClient().invalidateQueries({ queryKey: patientKeys.detail(id) });
	}
});

// ============================================================
// Measurement Mutations - FIXED
// ============================================================

export const createMeasurementMutation = mutationOptions({
	mutationFn: (data: MeasurementCreateInput) => {
		const cleanedData = cleanMeasurementData(data);
		// The createMeasurement function expects the repository input type
		return createMeasurement(cleanedData);
	},
	onSuccess: (_, variables) => {
		const patientId = variables?.patientId;
		if (!patientId) return;

		getQueryClient().invalidateQueries({
			queryKey: patientKeys.measurements(patientId)
		});
		getQueryClient().invalidateQueries({
			queryKey: patientKeys.latestMeasurement(patientId)
		});
		getQueryClient().invalidateQueries({
			queryKey: patientKeys.measurementsList(patientId)
		});
		getQueryClient().invalidateQueries({
			queryKey: patientKeys.growthChart(patientId, "weight")
		});
		getQueryClient().invalidateQueries({
			queryKey: patientKeys.summary(patientId)
		});
	}
});

export const updateMeasurementMutation = mutationOptions({
	mutationFn: ({ id, data }: { id: string; data: Partial<MeasurementCreateInput> }) => {
		// Clean the data and ensure it's properly typed
		const cleanedData = cleanMeasurementData(data as MeasurementCreateInput);
		return updateMeasurement(id, cleanedData);
	},
	onSuccess: (_, variables) => {
		// Invalidate the specific measurement
		getQueryClient().invalidateQueries({
			queryKey: patientKeys.measurement(variables.id)
		});

		// Invalidate patient-specific queries if we have patientId
		const data = variables.data as { patientId?: string };
		if (data?.patientId) {
			getQueryClient().invalidateQueries({
				queryKey: patientKeys.measurements(data.patientId)
			});
			getQueryClient().invalidateQueries({
				queryKey: patientKeys.latestMeasurement(data.patientId)
			});
			getQueryClient().invalidateQueries({
				queryKey: patientKeys.growthChart(data.patientId, "weight")
			});
			getQueryClient().invalidateQueries({
				queryKey: patientKeys.summary(data.patientId)
			});
		}
	}
});

export const deleteMeasurementMutation = mutationOptions({
	mutationFn: (id: string) => deleteMeasurement(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: patientKeys.all });
	}
});
