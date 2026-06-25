// features/encounters/schemas/encounter.ts
import { z } from "zod";

export const encounterStatusEnum = z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]);

export const encounterTypeEnum = z.enum([
	"CHECKUP",
	"FOLLOW_UP",
	"EMERGENCY",
	"CONSULTATION",
	"VACCINATION",
	"LAB_TEST",
	"PROCEDURE"
]);

export const encounterSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string().min(1, "Clinic ID is required"),
	patientId: z.string().min(1, "Patient ID is required"),
	doctorId: z.string().min(1, "Doctor ID is required"),
	appointmentId: z.string().nullable().optional(),
	encounterDate: z.date({ message: "Encounter date is required" }),
	type: encounterTypeEnum.default("CONSULTATION"),
	status: encounterStatusEnum.default("SCHEDULED"),
	chiefComplaint: z.string().nullable().optional(),
	historyOfPresentIllness: z.string().nullable().optional(),
	diagnosis: z.string().nullable().optional(),
	treatmentPlan: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	followUpDate: z.date().nullable().optional(),
	durationMinutes: z.number().min(5).default(30),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});

export const createEncounterSchema = encounterSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});

export const updateEncounterSchema = encounterSchema.partial().extend({
	id: z.string().min(1, "ID is required for updates")
});

export type EncounterZodType = z.infer<typeof encounterSchema>;
export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
