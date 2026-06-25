// db/repo/medical.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { medicalRepo } from "@/db/queries/medical.repo";
import {
	DiagnosisCreateSchema,
	MeasurementCreateSchema,
	MedicalRecordCreateSchema,
	PatientBillCreateSchema,
	VitalSignCreateSchema
} from "@/db/zod";

// =======================
// Schema Validators
// =======================

const medicalRecordCountSchema = z.object({
	clinicId: z.string(),
	patientId: z.string().optional(),
	doctorId: z.string().optional()
});
const vitalSignsListSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	fromDate: z.date(),
	toDate: z.date(),
	pageSize: z.number().default(50),
	page: z.number().default(1)
});
const medicalRecordListSchema = z.object({
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	clinicId: z.string(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});
const medicalRecordIdSchema = z.object({
	recordId: z.string(),
	clinicId: z.string()
});
const patientMedicalRecordsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});
const encounterIdSchema = z.object({ id: z.string(), clinicId: z.string() });
const patientEncountersSchema = z.object({
	patientId: z.string(),
	clinicId: z.string()
});
const trendDataSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	days: z.number().default(30)
});
const vitalSignsParamsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	limit: z.number().optional(),
	page: z.number().default(1),
	pageSize: z.number().default(50),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	encounterId: z.string().optional()
});
const vitalSignIdSchema = z.object({ id: z.string(), clinicId: z.string() });
const checkAccessSchema = z.object({
	userId: z.string(),
	patientId: z.string()
});
const paymentIdSchema = z.object({ id: z.string() });
const patientPaymentsSchema = z.object({ patientId: z.string() });
const appointmentPaymentsSchema = z.object({ appointmentId: z.string() });
const listPaymentsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	status: z.string().optional(),
	limit: z.number(),
	offset: z.number()
});
const clinicRevenueSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});
const processPaymentSchema = z.object({
	paymentId: z.string(),
	amountPaid: z.number(),
	paymentMethod: z.string(),
	notes: z.string().optional()
});
const appointmentTimeSchema = z.object({ appointmentId: z.string() });
const patientBillSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string(),
	billId: z.string(),
	serviceId: z.string(),
	serviceDate: z.date(),
	quantity: z.number(),
	unitCost: z.number().optional(),
	totalCost: z.number().optional()
});

const completeEncounterSchema = z.object({
	medicalRecordId: z.string(),
	diagnosisId: z.string().optional(),
	notes: z.string().optional(),
	followUpDate: z.date().optional(),
	prescribedMedications: z
		.array(
			z.object({
				drugId: z.string(),
				dosageValue: z.number(),
				dosageUnit: z.string(),
				frequency: z.enum([
					"ONCE_DAILY",
					"TWICE_DAILY",
					"THREE_TIMES_DAILY",
					"FOUR_TIMES_DAILY",
					"EVERY_OTHER_DAY",
					"WEEKLY",
					"MONTHLY",
					"AS_NEEDED"
				]),
				duration: z.string(),
				instructions: z.string().optional()
			})
		)
		.optional()
});

const createCompleteEncounterSchema = z.object({
	medicalRecord: MedicalRecordCreateSchema,
	diagnoses: z.array(DiagnosisCreateSchema),
	vitalSigns: z.array(VitalSignCreateSchema).optional(),
	measurements: z.array(MeasurementCreateSchema).optional()
	// growthRecord: z
	// 	.array(
	// 		z.object({
	// 			patientId: z.string(),
	// 			clinicId: z.string(),
	// 			gender: z.enum(["BOY", "GIRL", "OTHER"]).optional(),
	// 			ageDays: z.number().optional(),
	// 			ageMonths: z.number().optional(),
	// 			headCircumference: z.number().optional(),
	// 			bmi: z.number().optional(),
	// 			percentile: z.number().optional(),
	// 			weightForAgeZ: z.number().optional(),
	// 			heightForAgeZ: z.number().optional(),
	// 			bmiForAgeZ: z.number().optional(),
	// 			hcForAgeZ: z.number().optional(),
	// 			weight: z.number(),
	// 			height: z.number(),
	// 			notes: z.string().optional(),
	// 			date: z.date()
	// 		})
	// 	)
	// 	.optional()
});

// =======================
// Medical Record Count
// =======================

export const countMedicalRecord = createServerFn({ method: "GET" })
	.validator(medicalRecordCountSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.countMedicalRecord(ctx.data.clinicId, ctx.data.patientId, ctx.data.doctorId);
		} catch (error) {
			console.error("Error counting medical records:", error);
			throw new Error("Failed to count medical records");
		}
	});

// =======================
// Vital Signs Queries
// =======================

export const listVitalSignsByPatient = createServerFn({ method: "GET" })
	.validator(vitalSignsListSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, fromDate, toDate, pageSize, page } = ctx.data;
			return await medicalRepo.listVitalSignsByPatient(patientId, clinicId, fromDate, toDate, pageSize, page);
		} catch (error) {
			console.error("Error listing vital signs:", error);
			throw new Error("Failed to list vital signs");
		}
	});

export const listMedicalRecord = createServerFn({ method: "GET" })
	.validator(medicalRecordListSchema)
	.handler(async ctx => {
		try {
			const { patientId, doctorId, clinicId, limit, offset } = ctx.data;
			return await medicalRepo.listMedicalRecord(patientId, doctorId, clinicId, limit, offset);
		} catch (error) {
			console.error("Error listing medical records:", error);
			throw new Error("Failed to list medical records");
		}
	});

export const getMedicalRecordById = createServerFn({ method: "GET" })
	.validator(medicalRecordIdSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getMedicalRecordById(ctx.data.recordId, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting medical record:", error);
			throw new Error("Failed to get medical record");
		}
	});

export const getPatientMedicalRecords = createServerFn({ method: "GET" })
	.validator(patientMedicalRecordsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, limit, offset } = ctx.data;
			return await medicalRepo.getPatientMedicalRecords(patientId, clinicId, limit, offset);
		} catch (error) {
			console.error("Error getting patient medical records:", error);
			throw new Error("Failed to get patient medical records");
		}
	});

export const getEncounterById = createServerFn({ method: "GET" })
	.validator(encounterIdSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getEncounterById(ctx.data.id, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting encounter:", error);
			throw new Error("Failed to get encounter");
		}
	});

export const getPatientEncounters = createServerFn({ method: "GET" })
	.validator(patientEncountersSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getPatientEncounters(ctx.data.patientId, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting patient encounters:", error);
			throw new Error("Failed to get patient encounters");
		}
	});

export const getDiagnosesByMedicalRecordId = createServerFn({ method: "GET" })
	.validator(z.object({ medicalId: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.getDiagnosesByMedicalRecordId({
				medicalId: ctx.data.medicalId
			});
		} catch (error) {
			console.error("Error getting diagnoses by medical record:", error);
			throw new Error("Failed to get diagnoses");
		}
	});

export const getVitalSignsByMedicalRecordId = createServerFn({ method: "GET" })
	.validator(z.object({ medicalId: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.getVitalSignsByMedicalRecordId(ctx.data.medicalId);
		} catch (error) {
			console.error("Error getting vital signs by medical record:", error);
			throw new Error("Failed to get vital signs");
		}
	});

export const getTrendData = createServerFn({ method: "GET" })
	.validator(trendDataSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getTrendData(ctx.data.patientId, ctx.data.clinicId, ctx.data.days);
		} catch (error) {
			console.error("Error getting trend data:", error);
			throw new Error("Failed to get trend data");
		}
	});

export const getVitalSigns = createServerFn({ method: "GET" })
	.validator(vitalSignsParamsSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getVitalSigns(ctx.data);
		} catch (error) {
			console.error("Error getting vital signs:", error);
			throw new Error("Failed to get vital signs");
		}
	});

export const getLatestVitalSigns = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.getLatestVitalSigns(ctx.data.patientId, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting latest vital signs:", error);
			throw new Error("Failed to get latest vital signs");
		}
	});

export const getVitalSignById = createServerFn({ method: "GET" })
	.validator(vitalSignIdSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getVitalSignById(ctx.data.id, ctx.data.clinicId);
		} catch (error) {
			console.error("Error getting vital sign by ID:", error);
			throw new Error("Failed to get vital sign");
		}
	});

export const checkVitalSignsAccess = createServerFn({ method: "GET" })
	.validator(checkAccessSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.checkVitalSignsAccess(ctx.data.userId, ctx.data.patientId);
		} catch (error) {
			console.error("Error checking vital signs access:", error);
			throw new Error("Failed to check access");
		}
	});

// =======================
// Billing & Payments
// =======================

export const createBillForAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ appointmentId: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.createBillForAppointment(ctx.data.appointmentId);
		} catch (error) {
			console.error("Error creating bill for appointment:", error);
			throw new Error("Failed to create bill for appointment");
		}
	});

export const getPaymentById = createServerFn({ method: "GET" })
	.validator(paymentIdSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getPaymentById(ctx.data.id);
		} catch (error) {
			console.error("Error getting payment:", error);
			throw new Error("Failed to get payment");
		}
	});

export const getPaymentsByPatientId = createServerFn({ method: "GET" })
	.validator(patientPaymentsSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getPaymentsByPatientId(ctx.data.patientId);
		} catch (error) {
			console.error("Error getting payments by patient:", error);
			throw new Error("Failed to get payments");
		}
	});

export const getPaymentsByAppointmentId = createServerFn({ method: "GET" })
	.validator(appointmentPaymentsSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getPaymentsByAppointmentId(ctx.data.appointmentId);
		} catch (error) {
			console.error("Error getting payments by appointment:", error);
			throw new Error("Failed to get payments");
		}
	});

export const listPayments = createServerFn({ method: "GET" })
	.validator(listPaymentsSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.listPayments(ctx.data);
		} catch (error) {
			console.error("Error listing payments:", error);
			throw new Error("Failed to list payments");
		}
	});

export const getClinicRevenue = createServerFn({ method: "GET" })
	.validator(clinicRevenueSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getClinicRevenue(ctx.data.clinicId, ctx.data.startDate, ctx.data.endDate);
		} catch (error) {
			console.error("Error getting clinic revenue:", error);
			throw new Error("Failed to get clinic revenue");
		}
	});

export const processPayment = createServerFn({ method: "POST" })
	.validator(processPaymentSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.processPayment(
				ctx.data.paymentId,
				ctx.data.amountPaid,
				ctx.data.paymentMethod,
				ctx.data.notes
			);
		} catch (error) {
			console.error("Error processing payment:", error);
			throw new Error("Failed to process payment");
		}
	});

export const getTimeLeftForAppointment = createServerFn({ method: "GET" })
	.validator(appointmentTimeSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.getTimeLeftForAppointment(ctx.data.appointmentId);
		} catch (error) {
			console.error("Error getting time left for appointment:", error);
			throw new Error("Failed to get time left");
		}
	});

// =======================
// Patient Bill CRUD
// =======================

export const createPatientBill = createServerFn({ method: "POST" })
	.validator(PatientBillCreateSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.createPatientBill(ctx.data);
		} catch (error) {
			console.error("Error creating patient bill:", error);
			throw new Error("Failed to create patient bill");
		}
	});

export const updatePatientBill = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: patientBillSchema.partial() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.updatePatientBill(ctx.data.id, ctx.data.data);
		} catch (error) {
			console.error("Error updating patient bill:", error);
			throw new Error("Failed to update patient bill");
		}
	});

export const deletePatientBill = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.deletePatientBill(ctx.data.id);
		} catch (error) {
			console.error("Error deleting patient bill:", error);
			throw new Error("Failed to delete patient bill");
		}
	});

// =======================
// Vital Sign CRUD
// =======================

export const createVitalSign = createServerFn({ method: "POST" })
	.validator(VitalSignCreateSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.createVitalSign(ctx.data);
		} catch (error) {
			console.error("Error creating vital sign:", error);
			throw new Error("Failed to create vital sign");
		}
	});

export const updateVitalSign = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: VitalSignCreateSchema.partial() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.updateVitalSign(ctx.data.id, ctx.data.data);
		} catch (error) {
			console.error("Error updating vital sign:", error);
			throw new Error("Failed to update vital sign");
		}
	});

export const deleteVitalSign = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.deleteVitalSign(ctx.data.id);
		} catch (error) {
			console.error("Error deleting vital sign:", error);
			throw new Error("Failed to delete vital sign");
		}
	});

// =======================
// Diagnosis CRUD
// =======================

export const createDiagnosis = createServerFn({ method: "POST" })
	.validator(DiagnosisCreateSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.createDiagnosis(ctx.data);
		} catch (error) {
			console.error("Error creating diagnosis:", error);
			throw new Error("Failed to create diagnosis");
		}
	});

export const updateDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: DiagnosisCreateSchema.partial() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.updateDiagnosis(ctx.data.id, ctx.data.data);
		} catch (error) {
			console.error("Error updating diagnosis:", error);
			throw new Error("Failed to update diagnosis");
		}
	});

export const deleteDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.deleteDiagnosis(ctx.data.id);
		} catch (error) {
			console.error("Error deleting diagnosis:", error);
			throw new Error("Failed to delete diagnosis");
		}
	});

export const softDeleteDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.softDeleteDiagnosis(ctx.data.id, ctx.data.clinicId);
		} catch (error) {
			console.error("Error soft deleting diagnosis:", error);
			throw new Error("Failed to soft delete diagnosis");
		}
	});

export const restoreDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.restoreDiagnosis(ctx.data.id);
		} catch (error) {
			console.error("Error restoring diagnosis:", error);
			throw new Error("Failed to restore diagnosis");
		}
	});

// =======================
// Medical Record CRUD
// =======================

export const createMedicalRecord = createServerFn({ method: "POST" })
	.validator(MedicalRecordCreateSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.createMedicalRecord(ctx.data);
		} catch (error) {
			console.error("Error creating medical record:", error);
			throw new Error("Failed to create medical record");
		}
	});

export const updateMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: MedicalRecordCreateSchema.partial() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.updateMedicalRecord(ctx.data.id, ctx.data.data);
		} catch (error) {
			console.error("Error updating medical record:", error);
			throw new Error("Failed to update medical record");
		}
	});

export const deleteMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.deleteMedicalRecord(ctx.data.id);
		} catch (error) {
			console.error("Error deleting medical record:", error);
			throw new Error("Failed to delete medical record");
		}
	});

export const softDeleteMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.softDeleteMedicalRecord(ctx.data.id);
		} catch (error) {
			console.error("Error soft deleting medical record:", error);
			throw new Error("Failed to soft delete medical record");
		}
	});

export const restoreMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			return await medicalRepo.restoreMedicalRecord(ctx.data.id);
		} catch (error) {
			console.error("Error restoring medical record:", error);
			throw new Error("Failed to restore medical record");
		}
	});

// =======================
// Complex Operations
// =======================

export const completeEncounter = createServerFn({ method: "POST" })
	.validator(completeEncounterSchema)
	.handler(async ctx => {
		try {
			return await medicalRepo.completeEncounter(ctx.data);
		} catch (error) {
			console.error("Error completing encounter:", error);
			throw new Error("Failed to complete encounter");
		}
	});

export const addVitalSignsToMedicalRecord = createServerFn({ method: "POST" })
	.validator(VitalSignCreateSchema)
	.handler(async ctx => {
		try {
			const { medicalRecordId, ...vitalSigns } = ctx.data;
			return await medicalRepo.addVitalSignsToMedicalRecord(medicalRecordId, vitalSigns);
		} catch (error) {
			console.error("Error adding vital signs to medical record:", error);
			throw new Error("Failed to add vital signs");
		}
	});

export const createCompleteEncounter = createServerFn({ method: "POST" })
	.validator(createCompleteEncounterSchema)
	.handler(async ctx => {
		try {
			const clinicId = ctx.context?.["clinicId" as keyof typeof ctx.context] || ctx.data.medicalRecord.clinicId;

			// Sanitize measurements explicitly eliminating nulls
			const sanitizedMeasurements = (ctx.data.measurements ?? []).map(measurement => {
				return {
					...measurement,
					// Explicitly convert null to undefined to satisfy the repository input type
					weightKg: measurement.weightKg === null ? undefined : measurement.weightKg,
					heightCm: measurement.heightCm === null ? undefined : measurement.heightCm,
					bmi: measurement.bmi === null ? undefined : measurement.bmi
				};
			});

			return await medicalRepo.createCompleteEncounter({
				...ctx.data,
				medicalRecord: {
					...ctx.data.medicalRecord,
					clinicId
				},
				vitalSigns: ctx.data.vitalSigns ?? [],
				// Force-cast to the exact inner array type expected by the repository if inference persists
				measurements: sanitizedMeasurements as Parameters<
					typeof medicalRepo.createCompleteEncounter
				>[0]["measurements"]
			});
		} catch (error) {
			console.error("Error creating complete encounter:", error);
			throw new Error("Failed to create complete encounter");
		}
	});
