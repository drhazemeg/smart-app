import * as z from "zod";

export const recordStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

export const medicalRecordSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string().min(1, "Clinic ID is required"),
	patientId: z.string().min(1, "Patient ID is required"),
	appointmentId: z.string().nullable().optional(),
	doctorId: z.string().min(1, "Doctor ID is required"),
	diagnosis: z.string().nullable().optional(),
	symptoms: z.string().nullable().optional(),
	treatmentPlan: z.string().nullable().optional(),
	labRequest: z.string().nullable().optional(),
	medications: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	attachments: z.string().nullable().optional(),
	diagnosisDate: z.date().nullable().optional(),
	followUpDate: z.date().nullable().optional(),
	status: recordStatusEnum.default("ACTIVE")
});

export const createMedicalRecordSchema = medicalRecordSchema.omit({
	id: true
});

export const updateMedicalRecordSchema = medicalRecordSchema.partial().extend({
	id: z.string().min(1, "ID is required for updates")
});

export type MedicalRecord = z.infer<typeof medicalRecordSchema>;
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;
