// Server functions for import batches table

import { eq, sql } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";
import * as schema from "../schema";

// =======================
// Zod Validators
// =======================

// =======================
// Server Functions
// =======================

export const importBatchRepo = {
	async getImportBatchById(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.importBatch.findFirst({
			where: { id }
		});
	},

	async getImportBatchesByClinic(clinicId: string) {
		return db.query.importBatch.findMany({
			where: { clinicId },
			orderBy: { createdAt: "desc" }
		});
		[];
	},

	async getImportBatchesByStatus(clinicId: string, status: schema.ImportStatus) {
		return db.query.importBatch.findMany({
			where: { clinicId, status },
			orderBy: { createdAt: "desc" }
		});
	},

	async createImportBatch(data: schema.NewImportBatch, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.importBatch)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID(),
				status: "PENDING",
				processedRecords: 0,
				failedRecords: 0,
				createdAt: new Date()
			})
			.returning();
		return result;
	},

	async updateImportBatch(id: string, data: Partial<schema.NewImportBatch>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.importBatch)
			.set(data)
			.where(eq(schema.importBatch.id, id))
			.returning();
		return result;
	},

	async deleteImportBatch(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.delete(schema.importBatch).where(eq(schema.importBatch.id, id)).returning();
		return result;
	},

	async incrementProcessedRecords(id: string, count = 1, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.importBatch)
			.set({
				processedRecords: sql`processed_records + ${count}`
			})
			.where(eq(schema.importBatch.id, id))
			.returning();
		return result;
	},

	async incrementFailedRecords(id: string, errorMessage: string, count = 1, tx?: DBorTx) {
		const client = tx ?? db;
		const batch = await this.getImportBatchById(id, client);
		if (!batch) {
			throw new Error("Import batch not found");
		}

		const errorLog = batch.errorLog ? JSON.parse(batch.errorLog) : [];
		errorLog.push({ timestamp: new Date().toISOString(), error: errorMessage });

		const [result] = await client
			.update(schema.importBatch)
			.set({
				failedRecords: sql`failed_records + ${count}`,
				errorLog: JSON.stringify(errorLog)
			})
			.where(eq(schema.importBatch.id, id))
			.returning();
		return result;
	},

	async startImportBatch(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		return this.updateImportBatch(id, { status: "PROCESSING", startedAt: new Date() }, client);
	},

	async completeImportBatch(id: string, status: "COMPLETED" | "FAILED", tx?: DBorTx) {
		const client = tx ?? db;
		return this.updateImportBatch(id, { status, completedAt: new Date() }, client);
	}
};

export type ImportBatchRepo = typeof importBatchRepo;
