// Server functions for import batches table

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { queries } from "@/db/queries";

// =======================
// Zod Validators
// =======================

const batchIdSchema = z.object({
	id: z.string().min(1)
});

const clinicIdSchema = z.object({
	clinicId: z.string().min(1)
});

const createBatchSchema = z.object({
	batchId: z.string().min(1),
	clinicId: z.string().min(1),
	totalRecords: z.number().optional()
});

const updateBatchSchema = z.object({
	status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
	processedRecords: z.number().optional(),
	failedRecords: z.number().optional(),
	errorLog: z.string().optional(),
	startedAt: z.date().optional(),
	completedAt: z.date().optional()
});

// =======================
// Server Functions
// =======================

export const getImportBatchById = createServerFn({ method: "GET" })
	.validator(batchIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const batch = await queries.importBatches.getImportBatchById(id);
			return batch;
		} catch (error) {
			console.error("Error getting import batch by ID:", error);
			throw new Error("Failed to get import batch");
		}
	});

export const getImportBatchesByClinic = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const batches = await queries.importBatches.getImportBatchesByClinic(clinicId);
			return batches;
		} catch (error) {
			console.error("Error getting import batches by clinic:", error);
			throw new Error("Failed to get import batches");
		}
	});

export const getImportBatchesByStatus = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string().min(1),
			status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, status } = ctx.data;
			const batches = await queries.importBatches.getImportBatchesByStatus(clinicId, status);
			return batches;
		} catch (error) {
			console.error("Error getting import batches by status:", error);
			throw new Error("Failed to get import batches");
		}
	});

export const createImportBatch = createServerFn({ method: "POST" })
	.validator(createBatchSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const batch = await queries.importBatches.createImportBatch({
				...data,
				id: crypto.randomUUID(),
				status: "PENDING",
				processedRecords: 0,
				failedRecords: 0,
				createdAt: new Date()
			});
			return batch;
		} catch (error) {
			console.error("Error creating import batch:", error);
			throw new Error("Failed to create import batch");
		}
	});

export const updateImportBatch = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1), data: updateBatchSchema }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const batch = await queries.importBatches.updateImportBatch(id, data);
			if (!batch) {
				throw new Error("Import batch not found");
			}
			return batch;
		} catch (error) {
			console.error("Error updating import batch:", error);
			throw new Error("Failed to update import batch");
		}
	});

export const deleteImportBatch = createServerFn({ method: "POST" })
	.validator(batchIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const batch = await queries.importBatches.deleteImportBatch(id);
			if (!batch) {
				throw new Error("Import batch not found");
			}
			return batch;
		} catch (error) {
			console.error("Error deleting import batch:", error);
			throw new Error("Failed to delete import batch");
		}
	});

export const incrementProcessedRecords = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1), count: z.number().default(1) }))
	.handler(async ctx => {
		try {
			const { id, count } = ctx.data;
			const batch = await queries.importBatches.incrementProcessedRecords(id, count);
			if (!batch) {
				throw new Error("Import batch not found");
			}
			return batch;
		} catch (error) {
			console.error("Error incrementing processed records:", error);
			throw new Error("Failed to increment processed records");
		}
	});

export const incrementFailedRecords = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string().min(1),
			count: z.number().default(1),
			error: z.string()
		})
	)
	.handler(async ctx => {
		try {
			const { id, count, error } = ctx.data;
			const batch = await queries.importBatches.incrementFailedRecords(id, error, count);
			if (!batch) {
				throw new Error("Import batch not found");
			}
			return batch;
		} catch (error) {
			console.error("Error incrementing failed records:", error);
			throw new Error("Failed to increment failed records");
		}
	});

export const startImportBatch = createServerFn({ method: "POST" })
	.validator(batchIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const batch = await queries.importBatches.startImportBatch(id);
			if (!batch) {
				throw new Error("Import batch not found");
			}
			return batch;
		} catch (error) {
			console.error("Error starting import batch:", error);
			throw new Error("Failed to start import batch");
		}
	});

export const completeImportBatch = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1), status: z.enum(["COMPLETED", "FAILED"]) }))
	.handler(async ctx => {
		try {
			const { id, status } = ctx.data;
			const batch = await queries.importBatches.completeImportBatch(id, status);
			if (!batch) {
				throw new Error("Import batch not found");
			}
			return batch;
		} catch (error) {
			console.error("Error completing import batch:", error);
			throw new Error("Failed to complete import batch");
		}
	});
