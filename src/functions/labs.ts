// functions/labs.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { labsRepo } from "@/db/queries/labs.repo";

// Schema definitions
const clinicIdSchema = z.object({ clinicId: z.string().min(1) });
const patientIdSchema = z.object({ patientId: z.string().min(1) });
const labTestIdSchema = z.object({ labTestId: z.string().min(1) });
const patientLabTestsSchema = z.object({
	patientId: z.string(),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional()
});
const updateResultsSchema = z.object({
	labTestId: z.string(),
	result: z.string(),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
});
const createLabTestSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string(),
	diagnosisId: z.string().optional(),
	patientId: z.string(),
	recordId: z.string(),
	serviceId: z.string(),
	testDate: z.date(),
	result: z.string().default(""),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
	notes: z.string().optional()
});
const updateLabTestSchema = z.object({
	id: z.string(),
	data: z.object({
		diagnosisId: z.string().optional(),
		result: z.string().optional(),
		status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
		notes: z.string().optional(),
		testDate: z.date().optional()
	})
});

// Server Functions - Using labsRepo
export const getPendingByClinicId = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await labsRepo.getPendingByClinicId(clinicId);
		} catch (error) {
			console.error("Error getting pending lab tests by clinic:", error);
			throw new Error("Failed to get pending lab tests");
		}
	});

export const getByPatientId = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ({ data }) => {
		try {
			const { patientId } = data;
			return await labsRepo.getByPatientId(patientId);
		} catch (error) {
			console.error("Error getting lab tests by patient:", error);
			throw new Error("Failed to get lab tests");
		}
	});

export const getPatientLabTests = createServerFn({ method: "GET" })
	.validator(patientLabTestsSchema)
	.handler(async ({ data }) => {
		try {
			const { patientId, status } = data;
			return await labsRepo.getPatientLabTests(patientId, status);
		} catch (error) {
			console.error("Error getting patient lab tests:", error);
			throw new Error("Failed to get patient lab tests");
		}
	});

export const getLabTestById = createServerFn({ method: "GET" })
	.validator(labTestIdSchema)
	.handler(async ({ data }) => {
		try {
			const { labTestId } = data;
			return await labsRepo.getById(labTestId);
		} catch (error) {
			console.error("Error getting lab test by ID:", error);
			throw new Error("Failed to get lab test");
		}
	});

export const updateLabTestResults = createServerFn({ method: "POST" })
	.validator(updateResultsSchema)
	.handler(async ({ data }) => {
		try {
			const { labTestId, result, status } = data;
			return await labsRepo.updateLabTestResults(labTestId, result, status);
		} catch (error) {
			console.error("Error updating lab test results:", error);
			throw new Error("Failed to update lab test results");
		}
	});

export const getPendingLabTests = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await labsRepo.getPendingLabTests();
	} catch (error) {
		console.error("Error getting pending lab tests:", error);
		throw new Error("Failed to get pending lab tests");
	}
});

export const createLabTest = createServerFn({ method: "POST" })
	.validator(createLabTestSchema)
	.handler(async ({ data }) => {
		try {
			return await labsRepo.createLabTest(data);
		} catch (error) {
			console.error("Error creating lab test:", error);
			throw new Error("Failed to create lab test");
		}
	});

export const updateLabTest = createServerFn({ method: "POST" })
	.validator(updateLabTestSchema)
	.handler(async ({ data }) => {
		try {
			const { id, data: updateData } = data;
			return await labsRepo.updateLabTest(id, updateData);
		} catch (error) {
			console.error("Error updating lab test:", error);
			throw new Error("Failed to update lab test");
		}
	});

export const deleteLabTest = createServerFn({ method: "POST" })
	.validator(labTestIdSchema)
	.handler(async ({ data }) => {
		try {
			const { labTestId } = data;
			return await labsRepo.deleteLabTest(labTestId);
		} catch (error) {
			console.error("Error deleting lab test:", error);
			throw new Error("Failed to delete lab test");
		}
	});
