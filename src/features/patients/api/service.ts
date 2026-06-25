// products/patients/api/service.ts
// ============================================================
// Patient Service — Data Access Layer
// ============================================================

import {
	createPatient as createPatientFn,
	deletePatient as deletePatientFn,
	getPatient as getPatientFn,
	getPatientGrowthSummary as getPatientGrowthSummaryFn,
	getPatientByClinicId as getPatientsByClinicFn,
	getPatientUpcomingAppointments as getPatientUpcomingAppointmentsFn,
	getPatientWithFullHistory as getPatientWithFullHistoryFn,
	listPatients as listPatientsFn,
	restorePatient as restorePatientFn,
	updatePatient as updatePatientFn
} from "@/functions/patient";
import { getClinicId } from "@/lib/clinic-utils";

import type {
	GrowthChartData,
	GrowthSummary,
	Patient,
	PatientByIdResponse,
	PatientFilters,
	PatientMutationPayload,
	PatientsResponse,
	PatientWithDetailsResponse
} from "./types";

const allowedBloodGroups = [
	"A_POSITIVE",
	"A_NEGATIVE",
	"B_POSITIVE",
	"B_NEGATIVE",
	"O_POSITIVE",
	"O_NEGATIVE",
	"AB_POSITIVE",
	"AB_NEGATIVE"
] as const;

type BloodGroup = (typeof allowedBloodGroups)[number];

const allowedMaritalStatuses = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"] as const;

type MaritalStatus = (typeof allowedMaritalStatuses)[number];

function normalizeBloodGroup(value?: string | null): BloodGroup | null | undefined {
	if (value === null) return null;
	return allowedBloodGroups.includes(value as BloodGroup) ? (value as BloodGroup) : undefined;
}

function normalizeMaritalStatus(value?: string | null): MaritalStatus | null | undefined {
	if (value === null) return null;
	return allowedMaritalStatuses.includes(value as MaritalStatus) ? (value as MaritalStatus) : undefined;
}

export async function getPatients(filters: PatientFilters): Promise<PatientsResponse> {
	const clinicId = await getClinicId();

	const page = filters.page || 1;
	const limit = filters.limit || 10;
	const offset = (page - 1) * limit;

	const result = await listPatientsFn({
		data: {
			clinicId: filters.clinicId || clinicId,
			limit,
			offset,
			search: filters.search,
			gender: filters.gender as "boy" | "girl" | "other" | undefined,
			isActive: filters.isActive,
			bloodGroup: filters.bloodGroup,
			status: filters.status
		}
	});

	return {
		success: true,
		time: new Date().toISOString(),
		message: "Patients fetched successfully",
		total: result.total,
		offset,
		limit,
		patients: result.patients as unknown as Patient[]
	};
}

export async function getPatientById(id: string): Promise<PatientByIdResponse> {
	// const clinicId = await getClinicId();

	const patient = await getPatientFn({
		data: { id }
	});

	if (!patient) {
		throw new Error("Patient not found");
	}

	return {
		success: true,
		time: new Date().toISOString(),
		message: "Patient fetched successfully",
		patient: patient as Patient
	};
}

export async function getPatientWithDetails(id: string): Promise<PatientWithDetailsResponse> {
	const result = await getPatientWithFullHistoryFn({
		data: { id }
	});

	if (!result) {
		throw new Error("Patient not found");
	}

	return result as unknown as PatientWithDetailsResponse;
}

export async function getPatientGrowthSummary(id: string): Promise<GrowthSummary> {
	const result = await getPatientGrowthSummaryFn({
		data: { id }
	});

	if (!result) {
		throw new Error("Patient not found");
	}

	return result as GrowthSummary;
}

export async function getPatientUpcomingAppointments(
	patientId: string,
	limit = 10
): Promise<
	Array<{
		id: string;
		appointmentDate: Date;
		status: string;
		type: string;
		doctorName: string;
		doctorSpecialty: string;
	}>
> {
	const result = await getPatientUpcomingAppointmentsFn({
		data: { patientId, limit }
	});

	return result as Array<{
		id: string;
		appointmentDate: Date;
		status: string;
		doctorName: string;
		doctorSpecialty: string;
		type: string;
	}>;
}

export async function createPatient(data: PatientMutationPayload): Promise<Patient> {
	const clinicId = await getClinicId();
	const session = await getSession();
	const userId = session?.user.id ?? "";
	const { bloodGroup, maritalStatus, ...rest } = data;
	const normalizedBloodGroup = normalizeBloodGroup(bloodGroup);
	const normalizedMaritalStatus = normalizeMaritalStatus(maritalStatus);

	const result = await createPatientFn({
		data: {
			...rest,
			userId,
			clinicId,
			isActive: data.isActive ?? true,
			gender: data.gender || "boy",
			bloodGroup: normalizedBloodGroup,
			maritalStatus: normalizedMaritalStatus
		}
	});

	return result.patient as Patient;
}

export async function updatePatient(id: string, data: PatientMutationPayload): Promise<Patient> {
	const { bloodGroup, maritalStatus, ...rest } = data;
	const normalizedBloodGroup = normalizeBloodGroup(bloodGroup);
	const normalizedMaritalStatus = normalizeMaritalStatus(maritalStatus);

	const result = await updatePatientFn({
		data: {
			id,
			data: {
				...rest,
				isActive: data.isActive ?? true,
				bloodGroup: normalizedBloodGroup,
				maritalStatus: normalizedMaritalStatus
			}
		}
	});

	return result as Patient;
}

export async function deletePatient(id: string): Promise<void> {
	await deletePatientFn({
		data: { id, permanent: false }
	});
}

export async function deletePatientPermanently(id: string): Promise<void> {
	await deletePatientFn({
		data: { id, permanent: true }
	});
}

export async function restorePatient(id: string): Promise<Patient> {
	const result = await restorePatientFn({
		data: { id }
	});

	return result as Patient;
}

export async function getPatientsByClinic(): Promise<Patient[]> {
	const clinicId = await getClinicId();

	const result = await getPatientsByClinicFn({
		data: { clinicId }
	});

	return result as unknown as Patient[];
}

// Measurement functions
import {
	createMeasurement as createMeasurementFn,
	deleteMeasurement as deleteMeasurementFn,
	getLatestMeasurement as getLatestMeasurementFn,
	getMeasurementById as getMeasurementByIdFn,
	getMeasurementsByPatient as getMeasurementsByPatientFn,
	listMeasurements as listMeasurementsFn,
	updateMeasurement as updateMeasurementFn
} from "@/functions/measurements";

import type { CreateMeasurementInput, Measurement } from "../../../db/zod";

export async function getMeasurementsByPatient(patientId: string): Promise<Measurement[]> {
	const result = await getMeasurementsByPatientFn({
		data: { patientId }
	});

	return result as Measurement[];
}

export async function getMeasurementById(id: string): Promise<Measurement> {
	const clinicId = await getClinicId();

	const result = await getMeasurementByIdFn({
		data: { id, clinicId }
	});

	if (!result) {
		throw new Error("Measurement not found");
	}

	return result as Measurement;
}

export async function getLatestMeasurement(patientId: string): Promise<Measurement | null> {
	const result = await getLatestMeasurementFn({
		data: { patientId }
	});

	return result as Measurement | null;
}

export async function listMeasurements(
	patientId: string,
	limit = 20,
	offset = 0
): Promise<{ records: Measurement[]; total: number }> {
	const result = await listMeasurementsFn({
		data: { patientId, limit, offset }
	});

	return result as { records: Measurement[]; total: number };
}

export async function createMeasurement(data: CreateMeasurementInput): Promise<Measurement> {
	const result = await createMeasurementFn({
		data
	});

	return result as unknown as Measurement;
}

export async function updateMeasurement(id: string, data: Partial<CreateMeasurementInput>): Promise<Measurement> {
	const result = await updateMeasurementFn({
		data: { id, data }
	});

	return result as Measurement;
}

export async function deleteMeasurement(id: string): Promise<void> {
	const clinicId = await getClinicId();

	await deleteMeasurementFn({
		data: { id, clinicId }
	});
}

// Growth chart functions
import { getGrowthChartData as getGrowthChartDataFn } from "@/functions/growthChart";
import { getSession } from "../../auth/functions";

export async function getGrowthChartData(
	patientId: string,
	metric: "weight" | "height" | "bmi" = "weight",
	referenceSource: "who2006" | "who2007" | "egypt2020" | "cdc2000" = "egypt2020"
): Promise<GrowthChartData> {
	const result = await getGrowthChartDataFn({
		data: { patientId, metric, referenceSource }
	});

	return result as unknown as GrowthChartData;
}
