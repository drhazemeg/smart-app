// features/encounters/api/types.ts
import type { DbDoctor, Diagnosis as DbEncounter, DbPatient } from "@/db";

export interface Encounter extends DbEncounter {
	durationMinutes: number;
	patient?: DbPatient;
	doctor?: DbDoctor;
	vitals?: VitalSigns[];
	diagnoses?: Diagnosis[];
	prescriptions?: Prescription[];
}

export interface EncounterFilters {
	clinicId: string;
	patientId?: string;
	doctorId?: string;
	status?: string;
	type?: string;
	fromDate?: string;
	toDate?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface EncountersResponse {
	success: boolean;
	message: string;
	encounters: Encounter[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface EncounterByIdResponse {
	success: boolean;
	message: string;
	encounter: Encounter | null;
}

export interface VitalSigns {
	id: string;
	encounterId: string;
	patientId: string;
	bodyTemperature: number | null;
	systolic: number | null;
	diastolic: number | null;
	heartRate: number | null;
	respiratoryRate: number | null;
	weightKg: number | null;
	heightCm: number | null;
	bmi: number | null;
	oxygenSaturation: number | null;
	painScore: number | null;
	recordedAt: Date;
}

export interface Diagnosis {
	id: string;
	encounterId: string;
	code: string | null;
	description: string;
	isPrimary: boolean;
	status: "ACTIVE" | "RESOLVED" | "CHRONIC";
}

export interface Prescription {
	id: string;
	encounterId: string;
	medicationName: string;
	dosageValue: number;
	dosageUnit: string;
	frequency: string;
	duration: string;
	instructions: string | null;
	status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface EncounterMutationPayload {
	patientId: string;
	medicalId: string;
	doctorId: string;
	clinicId: string;
	appointmentId?: string | null;
	encounterDate: Date;
	type: string | null;
	status: string;
	chiefComplaint?: string | null;
	historyOfPresentIllness?: string | null;
	diagnosis?: string | null;
	treatmentPlan?: string | null;
	notes?: string | null;
	followUpDate?: Date | null;
	durationMinutes?: number;
	vitals?: Partial<VitalSigns>;
	diagnoses?: Partial<Diagnosis>[];
	prescriptions?: Partial<Prescription>[];
}
