// ============================================================
// Medical Record Service — Data Access Layer
// ============================================================

import * as medical from "@/functions/medical";
import { getClinicId } from "@/lib/clinic-utils";
import type { MedicalRecord, MedicalRecordFilters, MedicalRecordMutationPayload } from "./types";

export async function getMedicalRecords(filters: MedicalRecordFilters): Promise<MedicalRecord[]> {
	const clinicId = await getClinicId();

	const result = await medical.listMedicalRecord({
		data: {
			patientId: filters.patientId,
			doctorId: filters.doctorId,
			clinicId: clinicId,
			limit: filters.limit || 20,
			offset: filters.offset || 0
		}
	});

	return result as MedicalRecord[];
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
	const clinicId = await getClinicId();

	const record = await medical.getMedicalRecordById({
		data: { recordId: id, clinicId }
	});

	return record as MedicalRecord | null;
}

export async function createMedicalRecordFn(data: MedicalRecordMutationPayload): Promise<MedicalRecord> {
	const clinicId = await getClinicId();

	const result = await medical.createMedicalRecord({
		data: {
			...data,
			clinicId,
			diagnosisDate: data.diagnosisDate || new Date(),
			diagnosis: data.diagnosis || "",
			status: data.status || "ACTIVE",
			doctorId: data.doctorId,
			appointmentId: data.appointmentId ?? ""
		}
	});

	return result as MedicalRecord;
}
export async function updateMedicalRecordFn(
	id: string,
	data: Partial<MedicalRecordMutationPayload>
): Promise<MedicalRecord> {
	const clinicId = await getClinicId();

	const result = await medical.updateMedicalRecord({
		data: {
			id,
			data: {
				clinicId,
				...data,
				diagnosisDate: data.diagnosisDate || undefined,
				diagnosis: data.diagnosis || undefined,
				appointmentId: data.appointmentId ?? undefined
			}
		}
	});

	return result as MedicalRecord;
}

export async function deleteMedicalRecordFn(id: string): Promise<void> {
	await medical.softDeleteMedicalRecord({
		data: { id }
	});
}

// Import needed functions
