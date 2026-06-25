import { db } from "#/db/client.server";
import * as schema from "@/db/schema";
import { DiagnosisCreateSchema, DiagnosisUpdateSchema } from "@/db/zod";
import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, gte, ilike, lte, or } from "drizzle-orm";
import z from "zod";

// Matches the appointmentStatusEnum used in the diagnosis table
type DiagnosisStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

// =======================
// Schema Validators
// =======================

const listEncountersSchema = z.object({
	clinicId: z.string(),
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
	type: z.string().optional(),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	search: z.string().optional(),
	page: z.number().default(1),
	limit: z.number().default(10)
});

const encounterIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const updateEncounterSchema = z.object({
	id: z.string(),
	clinicId: z.string().optional(),
	data: DiagnosisUpdateSchema
});

const deleteEncounterSchema = z.object({
	id: z.string()
});

const completeEncounterSchema = z.object({
	id: z.string(),
	notes: z.string().optional()
});

// =======================
// List Encounters
// =======================

export const listEncountersFn = createServerFn({ method: "GET" })
	.validator(listEncountersSchema)
	.handler(async ctx => {
		try {
			const { clinicId, patientId, doctorId, status, type, fromDate, toDate, search, page, limit } = ctx.data;

			const offset = (page - 1) * limit;

			// Build conditions array for SQL query
			const baseCondition = and(
				eq(schema.diagnosis.clinicId, clinicId),
				eq(schema.diagnosis.isDeleted, false),
				patientId ? eq(schema.diagnosis.patientId, patientId) : undefined,
				doctorId ? eq(schema.diagnosis.doctorId, doctorId) : undefined,
				status ? eq(schema.diagnosis.status, status) : undefined,
				type ? eq(schema.diagnosis.type, type) : undefined,
				fromDate ? gte(schema.diagnosis.date, fromDate) : undefined,
				toDate ? lte(schema.diagnosis.date, toDate) : undefined,
				search
					? or(
							ilike(schema.diagnosis.diagnosis, `%${search}%`),
							ilike(schema.diagnosis.symptoms, `%${search}%`),
							ilike(schema.diagnosis.notes, `%${search}%`)
						)
					: undefined
			);

			const [encounters, totalResult] = await Promise.all([
				db
					.select()
					.from(schema.diagnosis)
					.where(baseCondition)
					.orderBy(schema.diagnosis.createdAt)
					.limit(limit)
					.offset(offset),
				db.select({ total: count() }).from(schema.diagnosis).where(baseCondition)
			]);

			const total = totalResult[0]?.total ?? 0;
			const totalPages = Math.ceil(total / limit);

			return { encounters, total, page, limit, totalPages };
		} catch (error) {
			console.error("Error listing encounters:", error);
			throw new Error("Failed to list encounters");
		}
	});

// =======================
// Get Encounter by ID
// =======================

export const getEncounterByIdFn = createServerFn({ method: "GET" })
	.validator(encounterIdSchema)
	.handler(async ctx => {
		try {
			return await db.query.diagnosis.findFirst({
				where: {
					id: ctx.data.id,
					clinicId: ctx.data.clinicId,
					isDeleted: false
				},
				with: {
					patient: true,
					doctor: true,
					appointment: true
				}
			});
		} catch (error) {
			console.error("Error getting encounter by ID:", error);
			throw new Error("Failed to get encounter");
		}
	});

// =======================
// Get Encounter with Full Details
// =======================

export const getEncounterWithDetails = createServerFn({ method: "GET" })
	.validator(encounterIdSchema)
	.handler(async ctx => {
		try {
			return await db.query.diagnosis.findFirst({
				where: {
					id: ctx.data.id,
					clinicId: ctx.data.clinicId,
					isDeleted: false
				},
				with: {
					patient: true,
					doctor: true,
					appointment: true,
					prescriptions: true,
					labTests: true,
					medicalRecord: {
						with: {
							vitalSigns: true,
							prescriptions: {
								with: {
									prescribedItems: {
										with: {
											drug: true
										}
									}
								}
							}
						}
					}
				}
			});
		} catch (error) {
			console.error("Error getting encounter with details:", error);
			throw new Error("Failed to get encounter details");
		}
	});

// =======================
// Create Encounter
// =======================

export const createEncounterFn = createServerFn({ method: "POST" })
	.validator(DiagnosisCreateSchema)
	.handler(async ctx => {
		try {
			const [created] = await db.insert(schema.diagnosis).values(ctx.data).returning();
			return created;
		} catch (error) {
			console.error("Error creating encounter:", error);
			throw new Error("Failed to create encounter");
		}
	});

// =======================
// Update Encounter
// =======================

export const updateEncounterFn = createServerFn({ method: "POST" })
	.validator(updateEncounterSchema)
	.handler(async ctx => {
		try {
			const [updated] = await db
				.update(schema.diagnosis)
				.set({ ...ctx.data.data, updatedAt: new Date() })
				.where(
					and(
						eq(schema.diagnosis.id, ctx.data.id),
						ctx.data.clinicId ? eq(schema.diagnosis.clinicId, ctx.data.clinicId) : undefined
					)
				)
				.returning();
			return updated;
		} catch (error) {
			console.error("Error updating encounter:", error);
			throw new Error("Failed to update encounter");
		}
	});

// =======================
// Delete Encounter (soft delete)
// =======================

export const deleteEncounterFn = createServerFn({ method: "POST" })
	.validator(deleteEncounterSchema)
	.handler(async ctx => {
		try {
			await db
				.update(schema.diagnosis)
				.set({ isDeleted: true, deletedAt: new Date() })
				.where(eq(schema.diagnosis.id, ctx.data.id));
		} catch (error) {
			console.error("Error deleting encounter:", error);
			throw new Error("Failed to delete encounter");
		}
	});

// =======================
// Complete Encounter
// =======================

export const completeEncounterFn = createServerFn({ method: "POST" })
	.validator(completeEncounterSchema)
	.handler(async ctx => {
		try {
			const completedStatus: DiagnosisStatus = "COMPLETED";
			const [updated] = await db
				.update(schema.diagnosis)
				.set({
					status: completedStatus,
					notes: ctx.data.notes,
					updatedAt: new Date()
				})
				.where(eq(schema.diagnosis.id, ctx.data.id))
				.returning();
			return updated;
		} catch (error) {
			console.error("Error completing encounter:", error);
			throw new Error("Failed to complete encounter");
		}
	});

// =======================
// Get Patient Encounters
// =======================

export const getPatientEncounters = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			return await db.query.diagnosis.findMany({
				where: {
					patientId: ctx.data.patientId,
					clinicId: ctx.data.clinicId,
					isDeleted: false
				},
				with: {
					patient: true,
					doctor: true,
					appointment: true
				},
				orderBy: { createdAt: "desc" }
			});
		} catch (error) {
			console.error("Error getting patient encounters:", error);
			throw new Error("Failed to get patient encounters");
		}
	});
