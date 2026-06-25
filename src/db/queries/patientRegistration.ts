// Repository for patient registration logic

import { z } from "zod";
import { type DBorTx, db } from "@/db/client";
// Assuming age calculator is available in a shared lib or utils
import { ageCalculator } from "@/utils/age-calculator";
import * as schema from "../schema";

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
export const patientRegistrationRepo = {
	async registerPatient(data: z.infer<typeof registrationSchema> & { clinicId: string }, tx?: DBorTx) {
		// ✅ If a transaction context 'tx' is passed, use it directly; otherwise use the root 'db'

		// A helper closure to execute the business logic cleanly
		const runInserts = async (transaction: DBorTx) => {
			// 1. Create User record (role: patient)
			const userId = crypto.randomUUID();
			await transaction.insert(schema.user).values({
				id: userId,
				name: `${data.firstName} ${data.lastName}`,
				email: data.email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@clinic.local`,
				role: "patient",
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// 2. Create Patient record
			const [patient] = await transaction
				.insert(schema.patient)
				.values({
					id: crypto.randomUUID(), // Ensure UUID handling is explicit if needed
					userId,
					clinicId: data.clinicId,
					firstName: data.firstName,
					lastName: data.lastName,
					dateOfBirth: data.dateOfBirth,
					gender: data.gender,
					email: data.email || undefined,
					phone: data.phone || undefined,
					allergies: data.allergies.length ? data.allergies.join(", ") : undefined,
					address: data.address,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			if (!patient) {
				throw new Error("Patient record creation failed");
			}
			const patientId = patient.id;

			// 3. Create initial Measurement if metrics are provided
			if (data.weightKg || data.heightCm || data.headCircumferenceCm) {
				const ageMonths = ageCalculator.calculateAgeMonths(
					data.dateOfBirth,
					data.measurementDate || new Date()
				);
				await transaction.insert(schema.measurement).values({
					id: crypto.randomUUID(),
					patientId,
					clinicId: data.clinicId,
					measurementDate: data.measurementDate || new Date(),
					weightKg: data.weightKg,
					heightCm: data.heightCm,
					headCircumferenceCm: data.headCircumferenceCm,
					chronologicalAgeMonths: ageMonths
				});
			}

			return patient;
		};

		// ✅ Safe nested vs root transaction management
		if (tx) {
			return await runInserts(tx);
		}
		return await db.transaction(async transaction => await runInserts(transaction));
	}
};

export type PatientRegistrationRepo = typeof patientRegistrationRepo;
