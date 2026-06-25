import type { DbDoctor, DbMedicalRecord, DbPatient } from "@/db";

export interface MedicalRecord extends DbMedicalRecord {
	patient?: DbPatient;
	doctor?: DbDoctor;
}

export interface MedicalRecordFilters {
	patientId?: string;
	doctorId?: string;
	clinicId: string;
	limit?: number;
	offset?: number;
	search?: string;
}

export type MedicalRecordMutationPayload = {
	patientId: string;
	doctorId: string;
	clinicId: string;
	appointmentId?: string | null;
	diagnosis?: string | null;
	symptoms?: string | null;
	treatmentPlan?: string | null;
	labRequest?: string | null;
	medications?: string | null;
	notes?: string | null;
	attachments?: string | null;
	diagnosisDate?: Date | null;
	followUpDate?: Date | null;
	status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
};
