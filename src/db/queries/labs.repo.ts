// db/repositories/clinic.repo.ts

import { db } from "#/db/client.server";
import { eq, inArray } from "drizzle-orm";

import * as schema from "../schema";
import type { LabTestCreateInput, LabTestUpdateInput } from "../zod";

export const labsRepo = {
	// Clinic queries
	async getPendingByClinicId(clinicId: string) {
		return await db.query.labTest.findMany({
			where: {
				status: "PENDING",
				patient: {
					clinicId
				}
			},
			with: {
				patient: true,
				service: true,
				medicalRecord: {
					with: {
						doctor: true
					}
				}
			},
			orderBy: { testDate: "asc" }
		});
	},
	// Get lab tests by patient
	async getByPatientId(patientId: string) {
		return await db.query.labTest.findMany({
			where: { patientId },
			with: {
				service: true,
				medicalRecord: {
					with: {
						doctor: true
					}
				}
			},
			orderBy: { testDate: "desc" }
		});
	},

	async getPatientLabTests(patientId: string, status?: schema.LabTestStatus) {
		return await db.query.labTest.findMany({
			where: {
				patientId,
				...(status && { status })
			},
			with: {
				service: true,
				medicalRecord: {
					with: {
						doctor: true
					}
				}
			},
			orderBy: { testDate: "desc" }
		});
	},
	async getById(labTestId: string) {
		return await db.query.labTest.findFirst({
			where: { id: labTestId },
			with: {
				patient: true,
				service: true,
				medicalRecord: {
					with: {
						doctor: true
					}
				}
			}
		});
	},
	// Update lab test results
	async updateLabTestResults(labTestId: string, result: string, status: schema.LabTestStatus) {
		return await db
			.update(schema.labTest)
			.set({
				result,
				status,
				updatedAt: new Date()
			})
			.where(eq(schema.labTest.id, labTestId))
			.returning();
	},

	// Get pending lab tests
	async getPendingLabTests() {
		return await db.query.labTest.findMany({
			where: {
				status: "PENDING"
			},
			with: {
				patient: true,
				service: true,
				medicalRecord: {
					with: {
						doctor: true
					}
				}
			},
			orderBy: { testDate: "asc" }
		});
	},

	async createLabTest(data: LabTestCreateInput) {
		const [result] = await db.insert(schema.labTest).values(data).returning();
		return result;
	},

	async createManyLabTests(data: LabTestCreateInput[]) {
		return await db.insert(schema.labTest).values(data).returning();
	},

	async updateLabTest(id: string, data: LabTestUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.labTest).set(updateData).where(eq(schema.labTest.id, id)).returning();
		return result;
	},

	async updateManyLabTests(ids: string[], data: LabTestUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.labTest).set(updateData).where(inArray(schema.labTest.id, ids)).returning();
	},

	async deleteLabTest(id: string) {
		const [result] = await db.delete(schema.labTest).where(eq(schema.labTest.id, id)).returning();
		return result;
	}
};

export type LabsRepo = typeof labsRepo;
