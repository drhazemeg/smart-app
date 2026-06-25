import { generateId } from "#/utils/id";
import {
	completeEncounterFn,
	createEncounterFn,
	deleteEncounterFn,
	getEncounterByIdFn,
	getEncounterWithDetails,
	getPatientEncounters,
	listEncountersFn,
	updateEncounterFn
} from "@/functions/encounter";
import { getClinicId } from "@/lib/clinic-utils";
import type {
	Encounter,
	EncounterByIdResponse,
	EncounterFilters,
	EncounterMutationPayload,
	EncountersResponse
} from "./type";

// Diagnosis table uses appointmentStatusEnum: PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
type DiagnosisStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

const DIAGNOSIS_STATUSES = new Set<DiagnosisStatus>(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);

/** Map encounter-level status strings to valid diagnosis table statuses */
function toDiagnosisStatus(status?: string): DiagnosisStatus | undefined {
	if (!status) return undefined;
	const statusMap: Record<string, DiagnosisStatus> = {
		PENDING: "PENDING",
		IN_PROGRESS: "PENDING",
		ACTIVE: "PENDING",
		CONFIRMED: "CONFIRMED",
		COMPLETED: "COMPLETED",
		CANCELLED: "CANCELLED",
		NO_SHOW: "NO_SHOW"
	};
	return statusMap[status] ?? "PENDING";
}

/** Narrow a string to DiagnosisStatus, falling back to undefined if not a valid enum value */
function asListStatus(status?: string): DiagnosisStatus | undefined {
	if (!status) return undefined;
	const mapped = toDiagnosisStatus(status);
	return mapped && DIAGNOSIS_STATUSES.has(mapped) ? mapped : undefined;
}

export async function getEncounters(filters: EncounterFilters): Promise<EncountersResponse> {
	const clinicId = await getClinicId();

	const result = await listEncountersFn({
		data: {
			clinicId: clinicId || filters.clinicId,
			page: filters.page || 1,
			limit: filters.limit || 10,
			patientId: filters.patientId,
			doctorId: filters.doctorId,
			status: asListStatus(filters.status),
			type: filters.type,
			fromDate: filters.fromDate ? new Date(filters.fromDate) : undefined,
			toDate: filters.toDate ? new Date(filters.toDate) : undefined,
			search: filters.search
		}
	});

	return {
		success: true,
		message: "Encounters fetched successfully",
		encounters: result.encounters as unknown as Encounter[],
		total: result.total,
		page: result.page,
		limit: result.limit,
		totalPages: result.totalPages
	};
}

export async function getEncounterById(id: string, clinicId: string): Promise<EncounterByIdResponse> {
	const encounter = await getEncounterByIdFn({
		data: { id, clinicId }
	});

	if (!encounter) {
		return {
			success: false,
			message: "Encounter not found",
			encounter: null
		};
	}

	// Get full details with vitals, diagnoses, prescriptions
	const fullEncounter = await getEncounterWithDetails({
		data: { id, clinicId }
	});

	return {
		success: true,
		message: "Encounter fetched successfully",
		encounter: fullEncounter as unknown as Encounter
	};
}

export async function createEncounter(data: EncounterMutationPayload): Promise<Encounter> {
	const clinicId = await getClinicId();
	// session is available for audit logging if needed; doctorId comes from data
	const result = await createEncounterFn({
		data: {
			id: generateId(),
			...data,
			clinicId: clinicId || data.clinicId,
			status: toDiagnosisStatus(data.status) ?? "PENDING",
			type: data.type || "CONSULTATION",
			duration: data.durationMinutes || 30,
			followUpDate: data.followUpDate ?? undefined,
			symptoms: ""
		}
	});

	return result as unknown as Encounter;
}

export async function updateEncounter(id: string, data: Partial<EncounterMutationPayload>): Promise<Encounter> {
	const clinicId = await getClinicId();

	const result = await updateEncounterFn({
		data: {
			id,
			clinicId: clinicId || data.clinicId,
			data: {
				...data,
				status: toDiagnosisStatus(data.status)
			}
		}
	});

	return result as unknown as Encounter;
}

export async function deleteEncounter(id: string): Promise<void> {
	await deleteEncounterFn({
		data: { id }
	});
}

export async function completeEncounter(id: string, notes?: string): Promise<Encounter> {
	const result = await completeEncounterFn({
		data: { id, notes }
	});

	return result as unknown as Encounter;
}

export async function getPatientEncountersList(patientId: string, clinicId: string): Promise<Encounter[]> {
	const result = await getPatientEncounters({
		data: { patientId, clinicId }
	});

	return result as unknown as Encounter[];
}
