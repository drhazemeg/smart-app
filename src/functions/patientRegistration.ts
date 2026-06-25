// src/functions/patientRegistration.ts

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { patientRegistrationRepo } from "@/db/queries/patientRegistration";

const registrationSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.date().refine(date => date <= new Date(), "Birth date cannot be in the future"),
	gender: z.enum(["boy", "girl"]),
	mrn: z.string().optional(),
	email: z.email("Invalid email format").optional().or(z.literal("")),
	phone: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
		.optional()
		.or(z.literal("")),
	address: z.string().optional(),
	guardianName: z.string().optional(),
	guardianRelation: z.string().optional(),
	guardianContact: z.string().optional(),
	allergies: z.array(z.string()).default([]),
	medicalConditions: z.string().optional(),
	medicalHistory: z.string().optional(),
	weightKg: z.number().positive().optional(),
	heightCm: z.number().positive().optional(),
	headCircumferenceCm: z.number().positive().optional(),
	measurementDate: z.date().optional()
});
export const registerPatientAction = createServerFn({ method: "POST" })
	.validator(registrationSchema)
	.handler(async ({ data }) => {
		try {
			// In a real application context, resolve the true clinic ID dynamically (e.g., via session auth)
			const currentClinicId = "default-clinic";

			// ✅ Fixed: Grouped inputs together so argument maps exactly to the expected payload schema
			const result = await patientRegistrationRepo.registerPatient({
				firstName: data.firstName,
				lastName: data.lastName,
				dateOfBirth: data.dateOfBirth,
				gender: data.gender,
				mrn: data.mrn,
				email: data.email,
				phone: data.phone,
				address: data.address,
				guardianName: data.guardianName,
				guardianRelation: data.guardianRelation,
				guardianContact: data.guardianContact,
				allergies: data.allergies,
				medicalConditions: data.medicalConditions,
				medicalHistory: data.medicalHistory,
				weightKg: data.weightKg,
				heightCm: data.heightCm,
				headCircumferenceCm: data.headCircumferenceCm,
				measurementDate: data.measurementDate || new Date(),
				clinicId: currentClinicId
			});

			return result;
		} catch (error) {
			console.error("Error registering patient:", error);
			throw new Error(error instanceof Error ? error.message : "Failed to register patient");
		}
	});
