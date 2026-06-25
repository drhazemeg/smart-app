import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { growthChartCacheRepo } from "@/db/queries/growthChartCache";
import { patientRepo } from "@/db/queries/patient.repo";
import {
	PatientCreateSchema as CreatePatientSchema,
	deletePatientSchema,
	listPatientsSchema,
	MeasurementCreateSchema,
	patientByClinicSchema,
	patientIdSchema,
	patientMRNSchema,
	restorePatientSchema,
	PatientUpdateSchema as UpdatePatientSchema
} from "@/db/zod";
import { ageCalculator } from "@/utils/age-calculator";
import { generateId } from "@/utils/id";
import { authMiddleware } from "./get-user";

// =======================
// Zod Validators
// =======================

const patientAgeRangeSchema = z
	.object({
		minAge: z.number().min(0),
		maxAge: z.number().min(0)
	})
	.refine(data => data.minAge <= data.maxAge, {
		message: "minAge must be less than or equal to maxAge",
		path: ["maxAge"]
	});

const patientDateRangeSchema = z
	.object({
		from: z.preprocess(value => {
			if (typeof value === "string" || value instanceof Date) {
				return new Date(value);
			}
			return value;
		}, z.date()),
		to: z.preprocess(value => {
			if (typeof value === "string" || value instanceof Date) {
				return new Date(value);
			}
			return value;
		}, z.date())
	})
	.refine(data => data.from <= data.to, {
		message: "from must be before or equal to to",
		path: ["to"]
	});

const searchPatientsSchema = z.object({
	q: z.string().min(1),
	limit: z.number().int().positive().optional()
});

// =======================
// READ Operations
// =======================

/**
 * Get a single patient by ID with all relations
 */
export const getPatient = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(patientIdSchema)
	.handler(async ({ data, context }) => {
		try {
			const { id } = data;
			const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.getPatient(id, clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			const age = ageCalculator.calculate(patient.dateOfBirth);
			const ageGroup = ageCalculator.getAgeGroup(patient.dateOfBirth);

			// Return only serializable data
			return {
				...patient,
				age,
				ageGroup,
				medicalRecords:
					patient.medicalRecords?.map(record => ({
						...record
						// Remove any non-serializable data
					})) || []
			};
		} catch (error) {
			console.error("Error getting patient:", error);
			throw new Error("Failed to get patient");
		}
	});

/**
 * Get a single patient with full history
 */
export const getPatientWithFullHistory = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(patientIdSchema)
	.handler(async ({ data, context }) => {
		try {
			const { id } = data;
			const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.getPatientFullHistory(id, clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			const age = ageCalculator.calculate(patient.dateOfBirth);
			const ageGroup = ageCalculator.getAgeGroup(patient.dateOfBirth);

			// Return only serializable data
			return {
				...patient,
				age,
				ageGroup,
				medicalRecords:
					patient.medicalRecords?.map(record => ({
						...record
						// Remove any non-serializable data
					})) || []
			};
		} catch (error) {
			console.error("Error getting patient with full history:", error);
			throw new Error("Failed to get patient with full history");
		}
	});

/**
 * Get multiple patients by their IDs
 */
// export const getPatientAppointments = createServerFn({ method: "POST" })
// 	.middleware([authMiddleware])
// 	.validator(
// 		z.object({
// 			patientId: z.string().min(1),
// 			limit: z.number().int().positive().optional()
// 		})
// 	)
// 	.handler(async ({ data, context }) => {
// 		try {
// 			const { patientId, limit = 10 } = data;
// 			const clinicId = context?.clinicId ?? "";

// 			const appointments = await appointmentRepository.getPatientAppointments(patientId, clinicId, {
// 				page: 1,
// 				limit
// 			});

// 			return appointments;
// 		} catch (error) {
// 			console.error("Error getting patient appointments:", error);
// 			throw new Error("Failed to get patient appointments");
// 		}
// 	});

export const getPatientRecords = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		z.object({
			patientId: z.string().min(1),
			limit: z.number().int().positive().optional(),
			offset: z.number().int().nonnegative().optional()
		})
	)
	.handler(async ({ data, context }) => {
		try {
			const { patientId, limit = 10, offset = 0 } = data;
			const clinicId = context?.clinicId ?? "";

			// Fetch the patient with related records from the repo
			const patient = await patientRepo.getPatientRecords(patientId, clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			// Paginate medicalRecords if present
			const allRecords = Array.isArray(patient.medicalRecords) ? patient.medicalRecords : [];
			const total = allRecords.length;
			const paged = allRecords.slice(offset, offset + limit);

			return {
				patient: {
					...patient,
					medicalRecords: paged
				},
				totalRecords: total,
				limit,
				offset
			};
		} catch (error) {
			console.error("Error getting patient records:", error);
			throw new Error("Failed to get patient records");
		}
	});

export const getPatientsByAgeRange = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(patientAgeRangeSchema)
	.handler(async ({ data, context }) => {
		try {
			const { minAge, maxAge } = data;
			const clinicId = context?.clinicId ?? "";

			return await patientRepo.getPatientsByAgeRange(clinicId, minAge * 12, maxAge * 12);
		} catch (error) {
			console.error("Error getting patients by age range:", error);
			throw new Error("Failed to get patients by age range");
		}
	});

export const getPatientsCreatedBetween = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(patientDateRangeSchema)
	.handler(async ({ data, context }) => {
		try {
			const { from, to } = data;
			const clinicId = context?.clinicId ?? "";

			return await patientRepo.getPatientsCreatedBetween(clinicId, from, to);
		} catch (error) {
			console.error("Error getting patients created between dates:", error);
			throw new Error("Failed to get patients created between dates");
		}
	});

export const getPatientsInDateRange = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(patientDateRangeSchema)
	.handler(async ({ data, context }) => {
		try {
			const { from, to } = data;
			const clinicId = context?.clinicId ?? "";

			return await patientRepo.getPatientsInDateRange(clinicId, from, to);
		} catch (error) {
			console.error("Error getting patients in date range:", error);
			throw new Error("Failed to get patients in date range");
		}
	});

export const searchPatients = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(searchPatientsSchema)
	.handler(async ({ data, context }) => {
		try {
			const { q, limit } = data;
			const clinicId = context?.clinicId ?? "";

			return await patientRepo.searchPatients({
				q,
				limit: limit || 50,
				clinicId
			});
		} catch (error) {
			console.error("Error searching patients:", error);
			throw new Error("Failed to search patients");
		}
	});

export const getPatientsCount = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const clinicId = context?.clinicId ?? "";
			const total = await patientRepo.getPatientsCount(clinicId);
			return { total };
		} catch (error) {
			console.error("Error getting patients count:", error);
			throw new Error("Failed to get patients count");
		}
	});

export const getPatientByClinicId = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(patientByClinicSchema)
	.handler(async ({ context }) => {
		try {
			// const { id } = data;
			const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.getPatientByClinicId(clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			return patient;
		} catch (error) {
			console.error("Error getting patient by clinic ID:", error);
			throw new Error("Failed to get patient by clinic ID");
		}
	});

export const getPatientByMRN = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(patientMRNSchema)
	.handler(async ({ data, context }) => {
		try {
			const { mrn } = data;
			const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.getPatientByMRN(mrn, clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			return patient;
		} catch (error) {
			console.error("Error getting patient by MRN:", error);
			throw new Error("Failed to get patient by MRN");
		}
	});

/**
 * Get patient with growth summary (measurements + alerts)
 */
export const getPatientGrowthSummary = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(patientIdSchema)
	.handler(async ({ data, context }) => {
		try {
			const { id } = data;
			const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.getPatientWithGrowthSummary(id, clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			const age = ageCalculator.calculate(patient.dateOfBirth);

			type Measurement = {
				weightKg?: number | null;
				heightCm?: number | null;
				bmi?: number | null;
				weightForAgeZ?: number | null;
				heightForAgeZ?: number | null;
				bmiForAgeZ?: number | null;
				measurementDate?: string | Date | null;
				chronologicalAgeMonths?: number | null;
			};

			const measurements: Measurement[] = patient.measurements || [];
			const weightTrend = calculateTrend(
				measurements
					.map((m: Measurement) => m.weightKg)
					.filter((v): v is number => v !== null && v !== undefined)
			);
			const heightTrend = calculateTrend(
				measurements
					.map((m: Measurement) => m.heightCm)
					.filter((v): v is number => v !== null && v !== undefined)
			);
			const bmiTrend = calculateTrend(
				measurements.map((m: Measurement) => m.bmi).filter((v): v is number => v !== null && v !== undefined)
			);

			const weightZTrend = calculateTrend(
				measurements
					.map((m: Measurement) => m.weightForAgeZ)
					.filter((v): v is number => v !== null && v !== undefined)
			);
			const heightZTrend = calculateTrend(
				measurements
					.map((m: Measurement) => m.heightForAgeZ)
					.filter((v): v is number => v !== null && v !== undefined)
			);
			const bmiZTrend = calculateTrend(
				measurements
					.map((m: Measurement) => m.bmiForAgeZ)
					.filter((v): v is number => v !== null && v !== undefined)
			);

			const latest = measurements[0] || null;

			return {
				patient: {
					id: patient.id,
					firstName: patient.firstName,
					lastName: patient.lastName,
					gender: patient.gender,
					dateOfBirth: patient.dateOfBirth,
					mrn: patient.mrn,
					age
				},
				latestMeasurement: latest
					? {
							date: latest.measurementDate,
							ageMonths: latest.chronologicalAgeMonths,
							weight: latest.weightKg,
							height: latest.heightCm,
							bmi: latest.bmi,
							weightZ: latest.weightForAgeZ,
							heightZ: latest.heightForAgeZ,
							bmiZ: latest.bmiForAgeZ
						}
					: null,
				trends: {
					weight: weightTrend,
					height: heightTrend,
					bmi: bmiTrend,
					weightZ: weightZTrend,
					heightZ: heightZTrend,
					bmiZ: bmiZTrend
				},
				alerts: patient.growthAlerts || [],
				totalMeasurements: measurements.length
			};
		} catch (error) {
			console.error("Error getting patient growth summary:", error);
			throw new Error("Failed to get patient growth summary");
		}
	});

/**
 * List patients with pagination, filtering, and sorting
 */
export const listPatients = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(listPatientsSchema)
	.handler(async ({ data, context }) => {
		try {
			const { limit, offset, search, gender } = data;
			const clinicId = context?.clinicId ?? "";

			const result = await patientRepo.listPatients({
				clinicId,
				limit,
				offset,
				search,
				status: undefined,
				gender: gender as "boy" | "girl" | "other" | undefined
			});

			return result;
		} catch (error) {
			console.error("Error listing patients:", error);
			throw new Error("Failed to list patients");
		}
	});

/**
 * Get patients needing attention (critical alerts or severe Z-scores)
 */
export const getPatientsNeedingAttention = createServerFn({
	method: "GET"
})
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const clinicId = context?.clinicId ?? "";
			const patients = await patientRepo.getPatientsByClinicList(clinicId);
			return patients.filter(patient => Array.isArray(patient.growthAlerts) && patient.growthAlerts.length > 0);
		} catch (error) {
			console.error("Error getting patients needing attention:", error);
			throw new Error("Failed to get patients needing attention");
		}
	});

// =======================
// CREATE Operations
// =======================

/**
 * Create a new patient with optional initial measurement
 */
export const createPatient = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		CreatePatientSchema.extend({
			measurements: MeasurementCreateSchema.optional()
		})
	)
	.handler(async ({ data, context }) => {
		try {
			const { measurements, ...patientData } = data;
			const patientId = generateId("patient");
			const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.createPatient({
				...patientData,
				id: patientId,
				clinicId
			});

			let initialMeasurement: Awaited<ReturnType<typeof patientRepo.createMeasurement>> | null = null;
			if (measurements && patient) {
				const ageMonths = ageCalculator.inMonths(patientData.dateOfBirth);
				const heightOrLengthCm = measurements.heightCm ?? measurements.lengthCm;

				const zScores = heightOrLengthCm
					? await patientRepo.calculateZScores({
							gender: patientData.gender as "boy" | "girl",
							ageMonths,
							weightKg: measurements.weightKg ?? 0,
							heightCm: heightOrLengthCm,
							referenceSource: "EGYPT_2020"
						})
					: null;

				const measurement = await patientRepo.createMeasurement({
					patientId: patient.id,
					measurementDate: measurements.measurementDate || new Date(),
					chronologicalAgeMonths: ageMonths,
					weightKg: measurements.weightKg,
					heightCm: measurements.heightCm,
					lengthCm: measurements.lengthCm,
					headCircumferenceCm: measurements.headCircumferenceCm,
					clinicId
				});

				initialMeasurement = measurement;

				if (zScores && Object.values(zScores).some(score => score !== null)) {
					await patientRepo.autoGenerateAlertsForMeasurement(measurement.id);
				}
			}

			return {
				patient,
				initialMeasurement
			};
		} catch (error) {
			console.error("Error creating patient:", error);
			throw new Error("Failed to create patient");
		}
	});

// =======================
// UPDATE Operations
// =======================

/**
 * Update a patient's information
 */
export const updatePatient = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		z.object({
			id: z.string().min(1),
			data: UpdatePatientSchema
		})
	)
	.handler(async ({ data }) => {
		try {
			const { id, data: updateData } = data;
			// const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.updatePatient(id, updateData);

			if (!patient) {
				throw new Error("Patient not found");
			}

			await growthChartCacheRepo.invalidatePatientCache({ patientId: id });

			return patient;
		} catch (error) {
			console.error("Error updating patient:", error);
			throw new Error("Failed to update patient");
		}
	});

/**
 * Update patient alerts (resolve/unresolve)
 */
export const updatePatientAlerts = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		z.object({
			patientId: z.string().min(1),
			alertIds: z.array(z.string()),
			resolved: z.boolean(),
			resolvedBy: z.string().optional(),
			resolutionNote: z.string().optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { patientId, alertIds, resolved, resolvedBy, resolutionNote } = data;

			const results = await patientRepo.updateAlerts(alertIds, resolved, resolvedBy, resolutionNote);

			// Invalidate cache for the patient
			await growthChartCacheRepo.invalidatePatientCache({
				patientId,
				chartType: undefined
			});

			return results;
		} catch (error) {
			console.error("Error updating patient alerts:", error);
			throw new Error("Failed to update alerts");
		}
	});

// =======================
// DELETE Operations
// =======================

/**
 * Soft delete a patient (mark as deleted)
 */
export const deletePatient = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(deletePatientSchema)
	.handler(async ({ data, context }) => {
		try {
			const { id, permanent } = data;
			const clinicId = context?.clinicId ?? "";

			const patient = permanent
				? await patientRepo.deletePatient(id, clinicId)
				: await patientRepo.softDeletePatient(id, clinicId);

			if (!patient) {
				throw new Error("Patient not found");
			}

			await growthChartCacheRepo.invalidatePatientCache({ patientId: id });

			return patient;
		} catch (error) {
			console.error("Error deleting patient:", error);
			throw new Error("Failed to delete patient");
		}
	});

/**
 * Restore a soft-deleted patient
 */
export const restorePatient = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(restorePatientSchema)
	.handler(async ({ data }) => {
		try {
			const { id } = data;
			// const clinicId = context?.clinicId ?? "";

			const patient = await patientRepo.restorePatient(id);

			if (!patient) {
				throw new Error("Patient not found");
			}

			await growthChartCacheRepo.invalidatePatientCache({ patientId: id });

			return patient;
		} catch (error) {
			console.error("Error restoring patient:", error);
			throw new Error("Failed to restore patient");
		}
	});

/**
 * Bulk delete patients
 */
export const bulkDeletePatients = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		z.object({
			ids: z.array(z.string()),
			permanent: z.boolean().default(false)
		})
	)
	.handler(async ({ data, context }) => {
		try {
			const { ids, permanent } = data;
			const clinicId = context?.clinicId ?? "";

			const results = await Promise.all(
				ids.map(patientId =>
					permanent
						? patientRepo.deletePatient(patientId, clinicId)
						: patientRepo.softDeletePatient(patientId, clinicId)
				)
			);

			await Promise.all(ids.map(patientId => growthChartCacheRepo.invalidatePatientCache({ patientId })));

			return results;
		} catch (error) {
			console.error("Error bulk deleting patients:", error);
			throw new Error("Failed to bulk delete patients");
		}
	});

// =======================
// Helper Functions
// =======================

/**
 * Calculate trend from values
 */
function calculateTrend(values: number[]): {
	current: number;
	change: number;
	changePercent: number;
} {
	if (values.length < 2) {
		return { current: values[0] || 0, change: 0, changePercent: 0 };
	}

	const current = values.at(-1) ?? 0;
	const previous = values[0];
	const change = current - previous;
	const changePercent = previous === 0 ? 0 : (change / previous) * 100;

	return { current, change, changePercent };
}

const getPatientUpcomingAppointmentsSchema = z.object({
	patientId: z.string(),
	limit: z.number().optional()
});

export const getPatientUpcomingAppointments = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(getPatientUpcomingAppointmentsSchema)
	.handler(async ({ data, context }) => {
		try {
			const { patientId } = data;
			const clinicId = context?.clinicId ?? "";

			return await patientRepo.getPatientUpcomingAppointments(patientId, clinicId);
		} catch (error) {
			console.error("Error getting patient upcoming appointments:", error);
			throw new Error("Failed to get patient upcoming appointments");
		}
	});
