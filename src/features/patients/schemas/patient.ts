// products/patients/schemas/patient.ts

import * as z from "zod";
import type { PatientSelect } from "#/db/schema";

export const genderEnum = z.enum(["boy", "girl", "other"]);
export const bloodGroupEnum = z.enum([
	"A_POSITIVE",
	"A_NEGATIVE",
	"B_POSITIVE",
	"B_NEGATIVE",
	"O_POSITIVE",
	"O_NEGATIVE",
	"AB_POSITIVE",
	"AB_NEGATIVE"
]);
export const maritalStatusEnum = z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"]);
export const nutritionalStatusEnum = z.enum(["NORMAL", "UNDERWEIGHT", "OVERWEIGHT", "OBESE", "MALNOURISHED"]);
export const statusEnum = z.enum([
	"ACTIVE",
	"INACTIVE",
	"PENDING",
	"SUSPENDED",
	"COMPLETED",
	"CANCELLED",
	"EXPIRED",
	"ON_HOLD"
]);
export const roleEnum = z.enum(["admin", "doctor", "staff", "patient"]);

export const patientSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string().min(1, "Clinic ID is required"),
	userId: z.string().min(1, "User ID is required"),
	mrn: z.string().optional().nullable(),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.date({
		error: "Date of birth is required or is not a valid date"
	}),
	gender: genderEnum.default("boy"),
	email: z.email("Invalid email format").optional().nullable(),
	phone: z.string().optional().nullable(),
	address: z.string().optional().nullable(),
	emergencyContactName: z.string().optional().nullable(),
	emergencyContactNumber: z.string().optional().nullable(),
	relation: z.string().optional().nullable(),
	allergies: z.string().optional().nullable(),
	medicalConditions: z.string().optional().nullable(),
	medicalHistory: z.string().optional().nullable(),
	bloodGroup: bloodGroupEnum.optional().nullable(),
	maritalStatus: maritalStatusEnum.optional().nullable(),
	image: z.string().optional().nullable(),
	colorCode: z.string().optional().nullable(),
	isActive: z.boolean().default(true),
	isDeleted: z.boolean().default(false),
	createdById: z.string().optional().nullable(),
	updatedById: z.string().optional().nullable()
});

export const createPatientSchema = patientSchema.omit({
	id: true,
	isDeleted: true,
	userId: true
});

export const updatePatientSchema = patientSchema.partial().extend({
	id: z.string().min(1, "ID is required for updates")
});

export const patientListFilterSchema = z.object({
	clinicId: z.string(),
	search: z.string().optional(),
	gender: genderEnum.optional(),
	status: statusEnum.optional(),
	isActive: z.boolean().optional(),
	bloodGroup: bloodGroupEnum.optional(),
	page: z.number().default(1),
	limit: z.number().default(10)
});

// Growth Measurement Schema
export const measurementSchema = z.object({
	id: z.string().optional(),
	patientId: z.string().min(1, "Patient ID is required"),
	clinicId: z.string().min(1, "Clinic ID is required"),
	measurementDate: z.date().default(() => new Date()),
	chronologicalAgeMonths: z.number().optional(),
	correctedAgeMonths: z.number().optional(),
	gestationalAgeAtMeasurement: z.number().optional(),
	weightKg: z.number().min(0.1, "Weight must be greater than 0").optional(),
	heightCm: z.number().min(1, "Height must be greater than 0").optional(),
	lengthCm: z.number().optional(),
	headCircumferenceCm: z.number().optional(),
	chestCircumferenceCm: z.number().optional(),
	midUpperArmCircumferenceCm: z.number().optional(),
	tricepsSkinfoldMm: z.number().optional(),
	subscapularSkinfoldMm: z.number().optional(),
	bmi: z.number().optional(),
	bmiPercentile: z.number().optional(),
	weightForAgeZ: z.number().optional(),
	heightForAgeZ: z.number().optional(),
	bmiForAgeZ: z.number().optional(),
	headCircumferenceForAgeZ: z.number().optional(),
	weightPercentile: z.number().optional(),
	heightPercentile: z.number().optional(),
	nutritionalStatus: nutritionalStatusEnum.optional(),
	stuntingStatus: z.enum(["SEVERE_STUNTING", "MODERATE_STUNTING", "NORMAL", "TALL"]).optional(),
	wastingStatus: z.enum(["SEVERE_WASTING", "MODERATE_WASTING", "NORMAL", "OVERWEIGHT"]).optional(),
	clinicalNotes: z.string().optional(),
	recommendations: z.string().optional(),
	followUpPlan: z.string().optional(),
	followUpDate: z.date().optional()
});

export const createMeasurementSchema = measurementSchema.omit({
	id: true,
	bmi: true,
	bmiPercentile: true,
	weightForAgeZ: true,
	heightForAgeZ: true,
	bmiForAgeZ: true,
	headCircumferenceForAgeZ: true,
	weightPercentile: true,
	heightPercentile: true,
	nutritionalStatus: true,
	stuntingStatus: true,
	wastingStatus: true
});

export const PatientResponseSchema = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	mrn: z.string().nullable(),
	dateOfBirth: z.coerce.date(),
	gender: z.enum(["boy", "girl", "other"]),
	isActive: z.boolean()
}) as z.ZodType<PatientSelect>;

export type PatientResponse = z.infer<typeof PatientResponseSchema>;
