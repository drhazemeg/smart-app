// db/repositories/clinic.repo.ts

import { db } from "#/db/client.server";
import { eq, inArray, type SQL, sql } from "drizzle-orm";

import * as schema from "../schema";
import type {
	DoseGuidelineCreateInput,
	DoseGuidelineUpdateInput,
	DrugCreateInput,
	DrugUpdateInput,
	MedicationDispenseCreateInput,
	MedicationDispenseUpdateInput,
	PrescribedItemCreateInput,
	PrescribedItemsUpdateInput,
	PrescribedItemUpdateInput,
	PrescriptionCreateInput,
	PrescriptionLogCreateInput,
	PrescriptionLogUpdateInput,
	PrescriptionStatus,
	PrescriptionUpdateInput
} from "../zod";

export const pharmacyRepo = {
	// Clinic queries
	async getPrescriptionById(id: string) {
		return await db.query.prescription.findFirst({
			where: { id },
			with: {
				patient: true,
				doctor: true,
				prescribedItems: {
					with: {
						drug: true
					}
				},
				medicalRecord: true
			}
		});
	},

	async getPatientActivePrescriptions(patientId: string, clinicId?: string, includeExpired?: boolean) {
		const conditions: Record<string, unknown> = { patientId };
		if (clinicId) {
			conditions.clinicId = clinicId;
		}
		if (!includeExpired) {
			conditions.status = "active";
			conditions.OR = [{ endDate: { gt: new Date() } }, { endDA: null }];
		}

		return await db.query.prescription.findMany({
			where: conditions,
			with: {
				prescribedItems: {
					with: {
						drug: true,
						medicationDispenses: {
							orderBy: { dispensedAt: "desc" },
							limit: 10
						}
					}
				},
				doctor: {
					with: {
						user: true
					}
				}
			},
			orderBy: { issuedDate: "desc" }
		});
	},

	async getPrescriptionWithItems(id: string, clinicId?: string) {
		return await db.query.prescription.findFirst({
			where: { id, ...(clinicId ? { clinicId } : {}) },
			with: {
				prescribedItems: {
					with: {
						drug: true
					}
				}
			}
		});
	},

	async getPrescribedItem(id: string) {
		return await db.query.prescribedItem.findFirst({
			where: { id },
			with: {
				prescription: true,
				medicationDispenses: true
			}
		});
	},

	async getPrescribedItemsByPrescriptionId(prescriptionId: string) {
		return await db.query.prescribedItem.findMany({
			where: { prescriptionId }
		});
	},

	async getDrugsByIds(ids: string[], clinicId?: string) {
		return await db.query.drug.findMany({
			where: { id: { in: ids }, clinicId }
		});
	},

	async getDoseGuidelines(drugIds: string[]) {
		return await db.query.doseGuideline.findMany({
			where: { drugId: { in: drugIds } }
		});
	},

	async getPrescriptionsByDateRange(patientId: string, startDate: Date, endDate: Date) {
		return await db.query.prescription.findMany({
			where: {
				patientId,
				issuedDate: {
					gte: startDate,
					lte: endDate
				}
			},
			with: {
				prescribedItems: {
					with: {
						drug: true,
						medicationDispenses: true
					}
				}
			}
		});
	},

	async getPrescriptionsForAnalytics(clinicId: string, startDate: Date, endDate: Date) {
		return await db.query.prescription.findMany({
			where: {
				clinicId,
				issuedDate: {
					gte: startDate,
					lte: endDate
				}
			},
			with: {
				prescribedItems: {
					with: {
						drug: true
					}
				},
				doctor: true
			}
		});
	},

	async listDrugs(search?: string, category?: string, limit = 50, offset = 0) {
		let where: Record<string, unknown> | undefined;

		if (search || category) {
			where = {};

			if (search) {
				where.RAW = () => sql`
            ${schema.drug.name} LIKE ${`%${search}%`} OR
            ${schema.drug.genericName} LIKE ${`%${search}%`} OR
            ${schema.drug.brandName} LIKE ${`%${search}%`}
          `;
			}

			if (category) {
				if (where.RAW) {
					const searchRaw = where.RAW as () => SQL;
					where = {
						AND: [{ RAW: searchRaw }, { contraindications: category }]
					};
				} else {
					where.contraindications = category;
				}
			}
		}

		const drugsList = await db.query.drug.findMany({
			where,
			limit,
			offset,
			orderBy: { name: "asc" }
		});

		const [totalResult] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.drug);
		const total = totalResult?.count ?? 0;

		return {
			drugs: drugsList,
			pagination: { limit, offset, total, hasMore: offset + limit < total }
		};
	},

	async getPatientAllergies(patientId: string) {
		const patient = await db.query.patient.findFirst({
			where: { id: patientId },
			columns: { allergies: true }
		});
		return patient?.allergies;
	},

	async updatePrescriptionStatus(id: string, status: PrescriptionStatus, performedBy: string) {
		return await db.transaction(async tx => {
			await tx.update(schema.prescription).set({ status }).where(eq(schema.prescription.id, id));
			await tx.insert(schema.prescriptionLog).values({
				id: crypto.randomUUID(),
				prescriptionId: id,
				action: status.toUpperCase(),
				performedBy,
				createdAt: new Date()
			});
		});
	},

	async checkDoctorAccess(doctorId: string, userId: string, clinicId?: string) {
		const userRecord = await db.query.user.findFirst({
			where: { id: userId },
			with: {
				doctorProfile: true,
				clinic: true
			}
		});

		if (!userRecord) {
			return false;
		}

		// Admin has full access
		if (userRecord.role === "admin") {
			return true;
		}

		// Staff has limited access
		if (userRecord.role === "staff") {
			return true;
		}

		// Doctor access
		if (userRecord.role === "doctor") {
			const doctorRecord = await db.query.doctor.findFirst({
				where: {
					userId,
					id: doctorId
				}
			});
			return !!doctorRecord;
		}

		// Check clinic membership
		if (clinicId) {
			const clinicMember = await db.query.clinicMember.findFirst({
				where: {
					userId,
					clinicId
				}
			});
			return !!clinicMember;
		}

		return false;
	},
	async checkDrugStock(clinicId: string, threshold = 10) {
		const lowStockDrugs = await db.query.drug.findMany({
			where: {
				quantityInStock: { lt: threshold }
			}
		});

		for (const drug of lowStockDrugs) {
			await db.insert(schema.notification).values({
				id: crypto.randomUUID(),
				userId: "admin", // Should be clinic admin
				clinicId,
				title: "Low Stock Alert",
				body: `${drug.name} is running low. Only ${drug.quantityInStock} units remaining.`,
				type: "low_stock",
				priority: "HIGH"
			});
		}

		return lowStockDrugs;
	},

	// Dispense medication
	async dispenseMedication(data: {
		prescribedItemId: string;
		prescriptionId: string;
		quantityDispensed: number;
		dispensedBy: string;
		notes?: string;
	}) {
		return await db.transaction(async tx => {
			// Get prescribed item
			const prescribedItem = await tx.query.prescribedItem.findFirst({
				where: { id: data.prescribedItemId },
				with: { drug: true }
			});

			if (!prescribedItem) {
				throw new Error("Prescribed item not found");
			}

			// Check stock
			if (!prescribedItem.drug || (prescribedItem.drug.quantityInStock ?? 0) < data.quantityDispensed) {
				throw new Error("Insufficient stock");
			}

			// Create dispense record
			const [dispense] = await tx
				.insert(schema.medicationDispense)
				.values({
					id: crypto.randomUUID(),
					...data,
					dispensedAt: new Date()
				})
				.returning();

			// Update drug stock
			await tx
				.update(schema.drug)
				.set({
					quantityInStock: (prescribedItem.drug.quantityInStock ?? 0) - data.quantityDispensed,
					updatedAt: new Date()
				})
				.where(eq(schema.drug.id, prescribedItem.drugId));

			// Update prescribed item refills
			await tx
				.update(schema.prescribedItem)
				.set({
					refillsRemaining: (prescribedItem.refillsRemaining ?? 0) - 1,
					lastRefillDate: new Date(),
					quantityDispensedTotal: (prescribedItem.quantityDispensedTotal ?? 0) + data.quantityDispensed
				})
				.where(eq(schema.prescribedItem.id, data.prescribedItemId));

			// Create prescription log
			await tx.insert(schema.prescriptionLog).values({
				id: crypto.randomUUID(),
				prescriptionId: data.prescriptionId,
				action: "DISPENSED",
				performedBy: data.dispensedBy,
				details: `Dispensed ${data.quantityDispensed} units of ${prescribedItem.drug.name}`,
				createdAt: new Date()
			});

			return dispense;
		});
	},

	async createDrugs(data: DrugCreateInput) {
		const [result] = await db.insert(schema.drug).values(data).returning();
		return result;
	},

	async createManyDrugss(data: DrugCreateInput[]) {
		return await db.insert(schema.drug).values(data).returning();
	},

	async updateDrugs(id: string, data: DrugUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.drug).set(updateData).where(eq(schema.drug.id, id)).returning();
		return result;
	},

	async updateManyDrugss(ids: string[], data: DrugUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.drug).set(updateData).where(inArray(schema.drug.id, ids)).returning();
	},

	async deleteDrugs(id: string) {
		const [result] = await db.delete(schema.drug).where(eq(schema.drug.id, id)).returning();
		return result;
	},

	async createDoseGuidelines(data: DoseGuidelineCreateInput) {
		const [result] = await db.insert(schema.doseGuideline).values(data).returning();
		return result;
	},

	async createManyDoseGuideliness(data: DoseGuidelineCreateInput[]) {
		return await db.insert(schema.doseGuideline).values(data).returning();
	},

	async updateDoseGuidelines(id: string, data: DoseGuidelineUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.doseGuideline)
			.set(updateData)
			.where(eq(schema.doseGuideline.id, id))
			.returning();
		return result;
	},

	async updateManyDoseGuideliness(ids: string[], data: DoseGuidelineUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.doseGuideline)
			.set(updateData)
			.where(inArray(schema.doseGuideline.id, ids))
			.returning();
	},

	async deleteDoseGuidelines(id: string) {
		const [result] = await db.delete(schema.doseGuideline).where(eq(schema.doseGuideline.id, id)).returning();
		return result;
	},
	async createPrescribedItems(data: PrescribedItemCreateInput) {
		const [result] = await db.insert(schema.prescribedItem).values(data).returning();
		return result;
	},
	async createPrescriptionLog(data: PrescriptionLogCreateInput) {
		const [result] = await db
			.insert(schema.prescriptionLog)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID(),
				createdAt: new Date()
			})
			.returning();
		return result;
	},
	async createManyPrescribedItemss(data: PrescribedItemCreateInput[]) {
		return await db.insert(schema.prescribedItem).values(data).returning();
	},

	async updatePrescribedItems(id: string, data: PrescribedItemUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.prescribedItem)
			.set(updateData)
			.where(eq(schema.prescribedItem.id, id))
			.returning();
		return result;
	},

	async updateManyPrescribedItemss(ids: string[], data: PrescribedItemsUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.prescribedItem)
			.set(updateData)
			.where(inArray(schema.prescribedItem.id, ids))
			.returning();
	},
	async deletePrescribedItems(id: string) {
		const [result] = await db.delete(schema.prescribedItem).where(eq(schema.prescribedItem.id, id)).returning();
		return result;
	},

	async createMedicationDispenses(data: MedicationDispenseCreateInput) {
		const [result] = await db.insert(schema.medicationDispense).values(data).returning();
		return result;
	},

	async createManyMedicationDispensess(data: MedicationDispenseCreateInput[]) {
		return await db.insert(schema.medicationDispense).values(data).returning();
	},

	async updateMedicationDispenses(id: string, data: MedicationDispenseUpdateInput) {
		const updateData = { ...data };

		const [result] = await db
			.update(schema.medicationDispense)
			.set(updateData)
			.where(eq(schema.medicationDispense.id, id))
			.returning();
		return result;
	},

	async updateManyMedicationDispensess(ids: string[], data: MedicationDispenseUpdateInput) {
		const updateData = { ...data };

		return await db
			.update(schema.medicationDispense)
			.set(updateData)
			.where(inArray(schema.medicationDispense.id, ids))
			.returning();
	},

	async deleteMedicationDispenses(id: string) {
		const [result] = await db
			.delete(schema.medicationDispense)
			.where(eq(schema.medicationDispense.id, id))
			.returning();
		return result;
	},

	async createPrescriptionLogs(data: PrescriptionLogCreateInput) {
		const [result] = await db.insert(schema.prescriptionLog).values(data).returning();
		return result;
	},

	async createManyPrescriptionLogss(data: PrescriptionLogCreateInput[]) {
		return await db.insert(schema.prescriptionLog).values(data).returning();
	},

	async updatePrescriptionLogs(id: string, data: PrescriptionLogUpdateInput) {
		const updateData = { ...data };

		const [result] = await db
			.update(schema.prescriptionLog)
			.set(updateData)
			.where(eq(schema.prescriptionLog.id, id))
			.returning();
		return result;
	},

	async updateManyPrescriptionLogss(ids: string[], data: PrescriptionLogUpdateInput) {
		const updateData = { ...data };

		return await db
			.update(schema.prescriptionLog)
			.set(updateData)
			.where(inArray(schema.prescriptionLog.id, ids))
			.returning();
	},

	async deletePrescriptionLogs(id: string) {
		const [result] = await db.delete(schema.prescriptionLog).where(eq(schema.prescriptionLog.id, id)).returning();
		return result;
	},

	async createPrescriptions(data: PrescriptionCreateInput) {
		const [result] = await db.insert(schema.prescription).values(data).returning();
		return result;
	},

	async createManyPrescriptionss(data: PrescriptionCreateInput[]) {
		return await db.insert(schema.prescription).values(data).returning();
	},

	async updatePrescriptions(id: string, data: PrescriptionUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.prescription)
			.set(updateData)
			.where(eq(schema.prescription.id, id))
			.returning();
		return result;
	},

	async updateManyPrescriptionss(ids: string[], data: PrescriptionUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.prescription)
			.set(updateData)
			.where(inArray(schema.prescription.id, ids))
			.returning();
	},

	async deletePrescriptions(id: string) {
		const [result] = await db.delete(schema.prescription).where(eq(schema.prescription.id, id)).returning();
		return result;
	},

	async createDispense(data: MedicationDispenseCreateInput) {
		const [result] = await db
			.insert(schema.medicationDispense)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID()
			})
			.returning();
		return result;
	},

	async createPrescription(data: PrescriptionCreateInput) {
		const [result] = await db.insert(schema.prescription).values(data).returning();
		return result;
	},

	async createManyPrescriptions(data: PrescriptionCreateInput[]) {
		return await db.insert(schema.prescription).values(data).returning();
	},

	async updatePrescription(id: string, data: PrescriptionUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.prescription)
			.set(updateData)
			.where(eq(schema.prescription.id, id))
			.returning();
		return result;
	},

	async updateManyPrescriptions(ids: string[], data: PrescriptionUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.prescription)
			.set(updateData)
			.where(inArray(schema.prescription.id, ids))
			.returning();
	},

	async deletePrescription(id: string) {
		const [result] = await db.delete(schema.prescription).where(eq(schema.prescription.id, id)).returning();
		return result;
	},
	async createPrescritbedItems(data: schema.PrescribedItem[]) {
		return await db.insert(schema.prescribedItem).values(data).returning();
	}
};

export type PharmacyRepo = typeof pharmacyRepo;
