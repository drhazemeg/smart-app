// db/repositories/pharmacy.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { pharmacyRepo } from "@/db/queries/pharmacy.repo";

// =======================
// Zod Validators
// =======================

const prescriptionIdSchema = z.object({
	id: z.string().min(1)
});

const prescriptionWithClinicSchema = z.object({
	id: z.string().min(1),
	clinicId: z.string().optional()
});

const patientActivePrescriptionsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string().optional(),
	includeExpired: z.boolean().optional()
});

const prescribedItemsByPrescriptionSchema = z.object({
	prescriptionId: z.string()
});

const getDrugsByIdsSchema = z.object({
	ids: z.array(z.string()),
	clinicId: z.string().optional()
});

const getDoseGuidelinesSchema = z.object({
	drugIds: z.array(z.string())
});

const dateRangeSchema = z.object({
	patientId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const clinicDateRangeSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const listDrugsSchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
	limit: z.number().default(20),
	offset: z.number().default(0)
});

const updatePrescriptionStatusSchema = z.object({
	id: z.string(),
	status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"]),
	performedBy: z.string()
});

const checkDoctorAccessSchema = z.object({
	doctorId: z.string(),
	userId: z.string(),
	clinicId: z.string().optional()
});

const checkDrugStockSchema = z.object({
	clinicId: z.string(),
	threshold: z.number().default(10)
});

const dispenseMedicationSchema = z.object({
	prescriptionId: z.string(),
	prescribedItemId: z.string(),
	quantityDispensed: z.number(),
	dispensedBy: z.string(),
	notes: z.string().optional()
});

// =======================
// Prescription Queries
// =======================

const getPrescriptionById = createServerFn({ method: "GET" })
	.validator(prescriptionIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.getPrescriptionById(id);
		} catch (error) {
			console.error("Error getting prescription:", error);
			throw new Error("Failed to get prescription");
		}
	});

const getPatientActivePrescriptions = createServerFn({ method: "POST" })
	.validator(patientActivePrescriptionsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, includeExpired } = ctx.data;
			return await pharmacyRepo.getPatientActivePrescriptions(patientId, clinicId, includeExpired);
		} catch (error) {
			console.error("Error getting active prescriptions:", error);
			throw new Error("Failed to get active prescriptions");
		}
	});

const getPrescriptionWithItems = createServerFn({ method: "GET" })
	.validator(prescriptionWithClinicSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			return await pharmacyRepo.getPrescriptionWithItems(id, clinicId);
		} catch (error) {
			console.error("Error getting prescription with items:", error);
			throw new Error("Failed to get prescription with items");
		}
	});

const getPrescribedItem = createServerFn({ method: "GET" })
	.validator(prescriptionIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.getPrescribedItem(id);
		} catch (error) {
			console.error("Error getting prescribed item:", error);
			throw new Error("Failed to get prescribed item");
		}
	});

const getPrescribedItemsByPrescriptionId = createServerFn({ method: "GET" })
	.validator(prescribedItemsByPrescriptionSchema)
	.handler(async ctx => {
		try {
			const { prescriptionId } = ctx.data;
			return await pharmacyRepo.getPrescribedItemsByPrescriptionId(prescriptionId);
		} catch (error) {
			console.error("Error getting prescribed items:", error);
			throw new Error("Failed to get prescribed items");
		}
	});

const getDrugsByIds = createServerFn({ method: "POST" })
	.validator(getDrugsByIdsSchema)
	.handler(async ctx => {
		try {
			const { ids, clinicId } = ctx.data;
			return await pharmacyRepo.getDrugsByIds(ids, clinicId);
		} catch (error) {
			console.error("Error getting drugs by IDs:", error);
			throw new Error("Failed to get drugs");
		}
	});

const getDoseGuidelines = createServerFn({ method: "POST" })
	.validator(getDoseGuidelinesSchema)
	.handler(async ctx => {
		try {
			const { drugIds } = ctx.data;
			return await pharmacyRepo.getDoseGuidelines(drugIds);
		} catch (error) {
			console.error("Error getting dose guidelines:", error);
			throw new Error("Failed to get dose guidelines");
		}
	});

const getPrescriptionsByDateRange = createServerFn({ method: "POST" })
	.validator(dateRangeSchema)
	.handler(async ctx => {
		try {
			const { patientId, startDate, endDate } = ctx.data;
			return await pharmacyRepo.getPrescriptionsByDateRange(patientId, startDate, endDate);
		} catch (error) {
			console.error("Error getting prescriptions by date range:", error);
			throw new Error("Failed to get prescriptions");
		}
	});

const getPrescriptionsForAnalytics = createServerFn({ method: "POST" })
	.validator(clinicDateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			return await pharmacyRepo.getPrescriptionsForAnalytics(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting prescriptions for analytics:", error);
			throw new Error("Failed to get prescriptions for analytics");
		}
	});

const listDrugs = createServerFn({ method: "POST" })
	.validator(listDrugsSchema)
	.handler(async ctx => {
		try {
			const { search, category, limit, offset } = ctx.data;
			return await pharmacyRepo.listDrugs(search, category, limit, offset);
		} catch (error) {
			console.error("Error listing drugs:", error);
			throw new Error("Failed to list drugs");
		}
	});

const getPatientAllergies = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			return await pharmacyRepo.getPatientAllergies(patientId);
		} catch (error) {
			console.error("Error getting patient allergies:", error);
			throw new Error("Failed to get patient allergies");
		}
	});

const updatePrescriptionStatus = createServerFn({ method: "POST" })
	.validator(updatePrescriptionStatusSchema)
	.handler(async ctx => {
		try {
			const { id, status, performedBy } = ctx.data;
			await pharmacyRepo.updatePrescriptionStatus(id, status, performedBy);
			return { success: true };
		} catch (error) {
			console.error("Error updating prescription status:", error);
			throw new Error("Failed to update prescription status");
		}
	});

const checkDoctorAccess = createServerFn({ method: "POST" })
	.validator(checkDoctorAccessSchema)
	.handler(async ctx => {
		try {
			const { doctorId, userId, clinicId } = ctx.data;
			return await pharmacyRepo.checkDoctorAccess(doctorId, userId, clinicId);
		} catch (error) {
			console.error("Error checking doctor access:", error);
			throw new Error("Failed to check doctor access");
		}
	});

const checkDrugStock = createServerFn({ method: "POST" })
	.validator(checkDrugStockSchema)
	.handler(async ctx => {
		try {
			const { clinicId, threshold } = ctx.data;
			return await pharmacyRepo.checkDrugStock(clinicId, threshold);
		} catch (error) {
			console.error("Error checking drug stock:", error);
			throw new Error("Failed to check drug stock");
		}
	});

const dispenseMedication = createServerFn({ method: "POST" })
	.validator(dispenseMedicationSchema)
	.handler(async ctx => {
		try {
			const { prescriptionId, prescribedItemId, quantityDispensed, dispensedBy, notes } = ctx.data;
			return await pharmacyRepo.dispenseMedication({
				prescriptionId,
				prescribedItemId,
				quantityDispensed,
				dispensedBy,
				notes
			});
		} catch (error) {
			console.error("Error dispensing medication:", error);
			throw new Error("Failed to dispense medication");
		}
	});

// =======================
// CRUD Operations for Drugs
// =======================

const createDrug = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await pharmacyRepo.createDrugs(data);
		} catch (error) {
			console.error("Error creating drug:", error);
			throw new Error("Failed to create drug");
		}
	});

const createManyDrugs = createServerFn({ method: "POST" })
	.validator(z.object({ drugs: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { drugs } = ctx.data;
			return await pharmacyRepo.createManyDrugss(drugs);
		} catch (error) {
			console.error("Error creating multiple drugs:", error);
			throw new Error("Failed to create drugs");
		}
	});

const updateDrug = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			return await pharmacyRepo.updateDrugs(id, data);
		} catch (error) {
			console.error("Error updating drug:", error);
			throw new Error("Failed to update drug");
		}
	});

const updateManyDrugs = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await pharmacyRepo.updateManyDrugss(ids, data);
		} catch (error) {
			console.error("Error updating multiple drugs:", error);
			throw new Error("Failed to update drugs");
		}
	});

const deleteDrug = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.deleteDrugs(id);
		} catch (error) {
			console.error("Error deleting drug:", error);
			throw new Error("Failed to delete drug");
		}
	});

// =======================
// CRUD Operations for Dose Guidelines
// =======================

const createDoseGuideline = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await pharmacyRepo.createDoseGuidelines(data);
		} catch (error) {
			console.error("Error creating dose guideline:", error);
			throw new Error("Failed to create dose guideline");
		}
	});

const createManyDoseGuidelines = createServerFn({ method: "POST" })
	.validator(z.object({ guidelines: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { guidelines } = ctx.data;
			return await pharmacyRepo.createManyDoseGuideliness(guidelines);
		} catch (error) {
			console.error("Error creating multiple dose guidelines:", error);
			throw new Error("Failed to create dose guidelines");
		}
	});

const updateDoseGuideline = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			return await pharmacyRepo.updateDoseGuidelines(id, data);
		} catch (error) {
			console.error("Error updating dose guideline:", error);
			throw new Error("Failed to update dose guideline");
		}
	});

const updateManyDoseGuidelines = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await pharmacyRepo.updateManyDoseGuideliness(ids, data);
		} catch (error) {
			console.error("Error updating multiple dose guidelines:", error);
			throw new Error("Failed to update dose guidelines");
		}
	});

const deleteDoseGuideline = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.deleteDoseGuidelines(id);
		} catch (error) {
			console.error("Error deleting dose guideline:", error);
			throw new Error("Failed to delete dose guideline");
		}
	});

// =======================
// CRUD Operations for Prescriptions
// =======================

const createPrescription = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await pharmacyRepo.createPrescriptions(data);
		} catch (error) {
			console.error("Error creating prescription:", error);
			throw new Error("Failed to create prescription");
		}
	});

const createManyPrescriptions = createServerFn({ method: "POST" })
	.validator(z.object({ prescriptions: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { prescriptions } = ctx.data;
			return await pharmacyRepo.createManyPrescriptionss(prescriptions);
		} catch (error) {
			console.error("Error creating multiple prescriptions:", error);
			throw new Error("Failed to create prescriptions");
		}
	});

const updatePrescription = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			return await pharmacyRepo.updatePrescriptions(id, data);
		} catch (error) {
			console.error("Error updating prescription:", error);
			throw new Error("Failed to update prescription");
		}
	});

const updateManyPrescriptions = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await pharmacyRepo.updateManyPrescriptionss(ids, data);
		} catch (error) {
			console.error("Error updating multiple prescriptions:", error);
			throw new Error("Failed to update prescriptions");
		}
	});

const deletePrescription = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.deletePrescriptions(id);
		} catch (error) {
			console.error("Error deleting prescription:", error);
			throw new Error("Failed to delete prescription");
		}
	});

// =======================
// CRUD Operations for Prescribed Items
// =======================

const createPrescribedItem = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await pharmacyRepo.createPrescribedItems(data);
		} catch (error) {
			console.error("Error creating prescribed item:", error);
			throw new Error("Failed to create prescribed item");
		}
	});

const createManyPrescribedItems = createServerFn({ method: "POST" })
	.validator(z.object({ items: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { items } = ctx.data;
			return await pharmacyRepo.createManyPrescribedItemss(items);
		} catch (error) {
			console.error("Error creating multiple prescribed items:", error);
			throw new Error("Failed to create prescribed items");
		}
	});

const updatePrescribedItem = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			return await pharmacyRepo.updatePrescribedItems(id, data);
		} catch (error) {
			console.error("Error updating prescribed item:", error);
			throw new Error("Failed to update prescribed item");
		}
	});

const updateManyPrescribedItems = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await pharmacyRepo.updateManyPrescribedItemss(ids, data);
		} catch (error) {
			console.error("Error updating multiple prescribed items:", error);
			throw new Error("Failed to update prescribed items");
		}
	});

const deletePrescribedItem = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.deletePrescribedItems(id);
		} catch (error) {
			console.error("Error deleting prescribed item:", error);
			throw new Error("Failed to delete prescribed item");
		}
	});

// =======================
// CRUD Operations for Prescription Logs
// =======================

const createPrescriptionLog = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await pharmacyRepo.createPrescriptionLogs(data);
		} catch (error) {
			console.error("Error creating prescription log:", error);
			throw new Error("Failed to create prescription log");
		}
	});

const createManyPrescriptionLogs = createServerFn({ method: "POST" })
	.validator(z.object({ logs: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { logs } = ctx.data;
			return await pharmacyRepo.createManyPrescriptionLogss(logs);
		} catch (error) {
			console.error("Error creating multiple prescription logs:", error);
			throw new Error("Failed to create prescription logs");
		}
	});

const updatePrescriptionLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			return await pharmacyRepo.updatePrescriptionLogs(id, data);
		} catch (error) {
			console.error("Error updating prescription log:", error);
			throw new Error("Failed to update prescription log");
		}
	});

const updateManyPrescriptionLogs = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await pharmacyRepo.updateManyPrescriptionLogss(ids, data);
		} catch (error) {
			console.error("Error updating multiple prescription logs:", error);
			throw new Error("Failed to update prescription logs");
		}
	});

const deletePrescriptionLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await pharmacyRepo.deletePrescriptionLogs(id);
		} catch (error) {
			console.error("Error deleting prescription log:", error);
			throw new Error("Failed to delete prescription log");
		}
	});

// =======================
// Exports
// =======================

export {
	checkDoctorAccess,
	checkDrugStock,
	createDoseGuideline,
	createDrug,
	createManyDoseGuidelines,
	createManyDrugs,
	createManyPrescribedItems,
	createManyPrescriptionLogs,
	createManyPrescriptions,
	createPrescribedItem,
	createPrescription,
	createPrescriptionLog,
	deleteDoseGuideline,
	deleteDrug,
	deletePrescribedItem,
	deletePrescription,
	deletePrescriptionLog,
	dispenseMedication,
	getDoseGuidelines,
	getDrugsByIds,
	getPatientActivePrescriptions,
	getPatientAllergies,
	getPrescribedItem,
	getPrescribedItemsByPrescriptionId,
	getPrescriptionById,
	getPrescriptionsByDateRange,
	getPrescriptionsForAnalytics,
	getPrescriptionWithItems,
	listDrugs,
	updateDoseGuideline,
	updateDrug,
	updateManyDoseGuidelines,
	updateManyDrugs,
	updateManyPrescribedItems,
	updateManyPrescriptionLogs,
	updateManyPrescriptions,
	updatePrescribedItem,
	updatePrescription,
	updatePrescriptionLog,
	updatePrescriptionStatus
};
