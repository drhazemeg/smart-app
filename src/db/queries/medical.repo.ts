// db/repositories/clinic.repo.ts

import { and, count, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import { db } from "@/db/client";

import * as schema from "../schema";
import type {
	createCompleteEncounterInput,
	DiagnosisCreateInput,
	DiagnosisUpdateInput,
	MedicalRecordCreateInput,
	MedicalRecordUpdateInput,
	PatientBillCreateInput,
	PatientBillUpdateInput,
	VitalSignCreateInput,
	VitalSignUpdateInput
} from "../zod";
import { pediatricRepo } from "./pediatric.repo";

export const medicalRepo = {
	// Clinic queries
	async countMedicalRecord(clinicId: string, patientId?: string, doctorId?: string) {
		return await db.$count(
			schema.medicalRecord,
			and(
				eq(schema.medicalRecord.clinicId, clinicId),
				patientId ? eq(schema.medicalRecord.patientId, patientId) : undefined,
				doctorId ? eq(schema.medicalRecord.doctorId, doctorId) : undefined,
				eq(schema.medicalRecord.isDeleted, false)
			)
		);
	},
	async listVitalSignsByPatient(
		patientId: string,
		clinicId: string,
		fromDate: Date,
		toDate: Date,
		pageSize: number,
		page: number
	) {
		const rqbWhere: Record<string, unknown> = { patientId, clinicId };
		if (fromDate) {
			rqbWhere.recordedAt = { gte: fromDate };
		}
		if (toDate) {
			rqbWhere.recordedAt = { lte: toDate };
		}
		return await db.query.vitalSign.findMany({
			where: rqbWhere,
			orderBy: { recordedAt: "desc" },
			limit: pageSize,
			offset: (page - 1) * pageSize
		});
	},

	// Create complete medical record with all related data
	async listMedicalRecord(
		patientId: string | undefined,
		doctorId: string | undefined,
		clinicId: string,
		limit = 50,
		offset = 0
	) {
		const rqbWhere: Record<string, unknown> = {
			clinicId,
			isDeleted: false
		};

		if (patientId) {
			rqbWhere.patientId = patientId;
		}
		if (doctorId) {
			rqbWhere.doctorId = doctorId;
		}

		return await db.query.medicalRecord.findMany({
			where: rqbWhere,
			with: {
				patient: true,
				doctor: true,
				appointment: true,
				encounters: true,
				vitalSigns: true,
				prescriptions: true
			},
			orderBy: { createdAt: "desc" },
			limit,
			offset
		});
	},
	async getMedicalRecordById(recordId: string, clinicId: string) {
		return await db.query.medicalRecord.findFirst({
			where: {
				id: recordId,
				clinicId,
				isDeleted: false
			},
			with: {
				patient: true,
				doctor: true,
				appointment: true,
				encounters: true,
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
		});
	},
	async getPatientMedicalRecords(patientId: string, clinicId: string, limit = 50, offset = 0) {
		return await db.query.medicalRecord.findMany({
			where: {
				patientId,
				clinicId,
				isDeleted: false
			},
			with: {
				doctor: true,
				appointment: true,
				encounters: true,
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
			},
			orderBy: { createdAt: "desc" },
			limit,
			offset
		});
	},
	async getEncounterById(id: string, clinicId: string) {
		return await db.query.diagnosis.findFirst({
			where: { id, clinicId },
			with: {
				patient: true,
				doctor: true,
				appointment: true,
				prescriptions: true,
				labTest: true,
				medical: {
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
	},

	async getPatientEncounters(patientId: string, clinicId: string) {
		const encounters = await db.query.diagnosis.findMany({
			where: { patientId, clinicId },
			orderBy: { createdAt: "desc" },
			with: { doctor: true, appointment: true, patient: true }
		});

		return encounters;
	},

	async getDiagnosesByMedicalRecordId(input: { medicalId: string }) {
		const diagnoses = await db.query.diagnosis.findMany({
			where: { medicalId: input.medicalId },
			orderBy: { date: "desc" }
		});
		return diagnoses;
	},
	async getVitalSignsByMedicalRecordId(medicalId: string) {
		return await db.query.vitalSign.findMany({
			where: { medicalRecordId: medicalId },
			orderBy: { recordedAt: "desc" }
		});
	},
	async getTrendData(patientId: string, clinicId: string, days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const [vitals, growth] = await Promise.all([
			db.query.vitalSign.findMany({
				where: {
					patientId,
					clinicId,
					recordedAt: { gte: startDate }
				},
				orderBy: { recordedAt: "asc" }
			}),
			db.query.measurement.findMany({
				where: {
					patientId,
					clinicId,
					measurementDate: { gte: startDate }
				},
				orderBy: { measurementDate: "asc" }
			})
		]);

		return { vitals, growth };
	},
	async getVitalSigns(params: {
		patientId: string;
		clinicId: string;
		limit?: number;
		page?: number;
		pageSize?: number;
		fromDate?: Date;
		toDate?: Date;
		encounterId?: string;
	}) {
		const { patientId, clinicId, page = 1, pageSize = 50, limit, fromDate, toDate, encounterId } = params;
		const finalLimit = limit ?? pageSize;

		const rqbWhere: Record<string, unknown> = { patientId, clinicId };

		if (fromDate || toDate) {
			const recordedAt: Record<string, unknown> = {};
			if (fromDate) {
				recordedAt.gte = fromDate;
			}
			if (toDate) {
				recordedAt.lte = toDate;
			}
			rqbWhere.recordedAt = recordedAt;
		}

		if (encounterId) {
			rqbWhere.encounterId = encounterId;
		}

		return await db.query.vitalSign.findMany({
			where: rqbWhere,
			orderBy: { recordedAt: "desc" },
			limit: finalLimit,
			offset: (page - 1) * finalLimit
		});
	},

	async getVitalSignsByMedicalRecord(medicalId: string) {
		return await db.query.vitalSign.findMany({
			where: { medicalRecordId: medicalId },
			orderBy: { recordedAt: "desc" }
		});
	},

	async getLatestVitalSigns(patientId: string, clinicId: string) {
		return await db.query.vitalSign.findFirst({
			where: { patientId, clinicId },
			orderBy: { recordedAt: "desc" }
		});
	},

	async getVitalSignById(id: string, clinicId: string) {
		return await db.query.vitalSign.findFirst({
			where: { id, clinicId }
		});
	},
	async checkVitalSignsAccess(userId: string, patientId: string): Promise<boolean> {
		const userData = await db.query.user.findFirst({
			where: { id: userId },
			with: {
				patientsCreated: true,
				doctorProfile: true
			}
		});

		if (!userData) {
			return false;
		}

		if (userData.role === "admin" || userData.role === "staff") {
			return true;
		}
		if (userData.role === "doctor" && userData.doctorProfile) {
			return true;
		}
		if (userData.role === "patient" && Array.isArray(userData.patientsCreated)) {
			return userData.patientsCreated.some(p => p.id === patientId);
		}

		// Check if user is guardian
		const guardianRecord = await db.query.guardian.findFirst({
			where: {
				userId,
				patientId
			}
		});

		return !!guardianRecord;
	},
	// Create bill for appointment
	async createBillForAppointment(appointmentId: string) {
		return await db.transaction(async tx => {
			const appointment = await tx.query.appointment.findFirst({
				where: { id: appointmentId },
				with: {
					patient: true,
					doctor: true,
					service: true
				}
			});

			if (!appointment) {
				throw new Error("Appointment not found");
			}

			// Calculate total amount
			let totalAmount = appointment.appointmentPrice ?? 0;
			if (appointment.service) {
				totalAmount += appointment.service.price || 0;
			}

			// Create payment record
			const [payment] = await tx
				.insert(schema.payment)
				.values({
					id: crypto.randomUUID(),
					clinicId: appointment.clinicId,
					patientId: appointment.patientId,
					appointmentId: appointment.id,
					billDate: new Date(),
					totalAmount,
					status: "PENDING",
					receiptNumber: Math.floor(Math.random() * 1_000_000)
				})
				.returning();

			return payment;
		});
	},

	async getPaymentById(id: string) {
		return await db.query.payment.findFirst({
			where: { id },
			with: {
				patient: true,
				appointment: true
			}
		});
	},

	async getPaymentsByPatientId(patientId: string) {
		return await db.query.payment.findMany({
			where: { patientId, isDeleted: false },
			orderBy: { paymentDate: "desc" }
		});
	},

	async getPaymentsByAppointmentId(appointmentId: string) {
		return await db.query.payment.findMany({
			where: { appointmentId, isDeleted: false }
		});
	},

	async listPayments(params: {
		clinicId: string;
		startDate?: Date;
		endDate?: Date;
		status?: string;
		limit: number;
		offset: number;
	}) {
		const { clinicId, startDate, endDate, status, limit, offset } = params;

		const conditions: SQL[] = [eq(schema.payment.clinicId, clinicId), eq(schema.payment.isDeleted, false)];

		if (startDate) {
			conditions.push(gte(schema.payment.paymentDate, startDate));
		}
		if (endDate) {
			conditions.push(lte(schema.payment.paymentDate, endDate));
		}
		if (status) {
			conditions.push(eq(schema.payment.status, status as schema.PaymentStatus));
		}

		const [items, totalResult] = await Promise.all([
			db.query.payment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					paymentDate: {
						gte: startDate,
						lte: endDate
					},
					status: status as schema.PaymentStatus
				},
				limit,
				offset,
				with: {
					patient: true,
					appointment: true
				},
				orderBy: { paymentDate: "desc" }
			}),
			db
				.select({ count: count() })
				.from(schema.payment)
				.where(and(...conditions))
		]);

		return {
			items,
			total: totalResult[0]?.count ?? 0
		};
	},

	async getClinicRevenue(clinicId: string, startDate: Date, endDate: Date) {
		const payments = await db.query.payment.findMany({
			where: {
				clinicId,
				isDeleted: false,
				createdAt: {
					gte: startDate,
					lte: endDate
				}
			},

			with: {
				patient: true
			},
			orderBy: (payment, { desc }) => [desc(payment.createdAt)]
		});

		const totalRevenue = payments.reduce((sum, p) => sum + (p.status === "PAID" ? (p.amountPaid ?? 0) : 0), 0);
		const totalBilled = payments.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);

		const outstanding = Math.max(0, totalBilled - totalRevenue);

		const pendingClaims = payments.filter(p => p.paymentMethod === "INSURANCE" && p.status !== "PAID").length;

		const collectionRate = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 100;

		const transactions = payments.map(p => {
			let status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
			if (p.status === "PAID") {
				status = "PAID";
			} else if (p.status === "PENDING" || p.status === "PARTIAL") {
				status = "PENDING";
			} else if (p.status === "UNPAID") {
				status = "OVERDUE";
			} else {
				status = "CANCELLED";
			}
			return {
				id: p.id,
				patientId: p.patientId || "",
				patientName: p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : "Unknown Patient",
				amount: p.totalAmount ?? 0,
				date: p.paymentDate || p.createdAt,
				type: p.status === "PAID" ? ("PAYMENT" as const) : ("INVOICE" as const),
				status,
				description: p.notes || undefined
			};
		});

		return {
			totalRevenue,
			totalBilled,
			monthlyRevenue: totalRevenue,
			revenueGrowth: 12,
			outstanding,
			pendingClaims,
			collectionRate,
			paymentCount: payments.length,
			averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0,
			payments,
			transactions
		};
	},

	// Process payment
	async processPayment(paymentId: string, amountPaid: number, paymentMethod: string, notes?: string) {
		return await db.transaction(async tx => {
			const payment = await tx.query.payment.findFirst({
				where: { id: paymentId }
			});

			if (!payment) {
				throw new Error("Payment not found");
			}

			const [updatedPayment] = await tx
				.update(schema.payment)
				.set({
					amountPaid,
					paymentMethod: paymentMethod as schema.PaymentMethod,
					paymentDate: new Date(),
					paidDate: new Date(),
					status: amountPaid >= (payment.totalAmount ?? 0) ? "PAID" : "PARTIAL",
					notes,
					updatedAt: new Date()
				})
				.where(eq(schema.payment.id, paymentId))
				.returning();

			return updatedPayment;
		});
	},
	async getTimeLeftForAppointment(appointmentId: string): Promise<string> {
		const record = await db.query.appointment.findFirst({
			with: {
				patient: true,
				doctor: true,
				clinic: true,
				service: true
			},
			where: { id: appointmentId }
		});

		if (!record?.appointmentDate) {
			return "Appointment not found or date missing";
		}

		const now = new Date();
		const appointmentTime = new Date(record.appointmentDate);

		const diffMs = appointmentTime.getTime() - now.getTime();
		if (diffMs < 0) {
			return "Appointment has already passed";
		}

		const diffMins = Math.floor(diffMs / (1000 * 60));
		const hours = Math.floor(diffMins / 60);
		const mins = diffMins % 60;

		if (hours > 0) {
			return `${hours} hours and ${mins} minutes remaining`;
		}
		return `${mins} minutes remaining`;
	},
	async createPatientBill(data: PatientBillCreateInput) {
		const [result] = await db.insert(schema.patientBill).values(data).returning();
		return result;
	},

	async createManyPatientBills(data: PatientBillCreateInput[]) {
		return await db.insert(schema.patientBill).values(data).returning();
	},

	async updatePatientBill(id: string, data: PatientBillUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.patientBill)
			.set(updateData)
			.where(eq(schema.patientBill.id, id))
			.returning();
		return result;
	},

	async updateManyPatientBills(ids: string[], data: PatientBillUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.patientBill)
			.set(updateData)
			.where(inArray(schema.patientBill.id, ids))
			.returning();
	},

	async deletePatientBill(id: string) {
		const [result] = await db.delete(schema.patientBill).where(eq(schema.patientBill.id, id)).returning();
		return result;
	},
	async createVitalSign(data: VitalSignCreateInput) {
		const [result] = await db.insert(schema.vitalSign).values(data).returning();
		return result;
	},

	async createManyVitalSigns(data: VitalSignCreateInput[]) {
		return await db.insert(schema.vitalSign).values(data).returning();
	},

	async updateVitalSign(id: string, data: VitalSignUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.vitalSign)
			.set(updateData)
			.where(eq(schema.vitalSign.id, id))
			.returning();
		return result;
	},

	async updateManyVitalSigns(ids: string[], data: VitalSignUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.vitalSign).set(updateData).where(inArray(schema.vitalSign.id, ids)).returning();
	},

	async deleteVitalSign(id: string) {
		const [result] = await db.delete(schema.vitalSign).where(eq(schema.vitalSign.id, id)).returning();
		return result;
	},
	async createManyDiagnosiss(data: DiagnosisCreateInput[]) {
		return await db.insert(schema.diagnosis).values(data).returning();
	},

	async updateDiagnosis(id: string, data: DiagnosisUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.diagnosis)
			.set(updateData)
			.where(eq(schema.diagnosis.id, id))
			.returning();
		return result;
	},

	async updateManyDiagnosiss(ids: string[], data: DiagnosisUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.diagnosis).set(updateData).where(inArray(schema.diagnosis.id, ids)).returning();
	},

	async deleteDiagnosis(id: string) {
		const [result] = await db.delete(schema.diagnosis).where(eq(schema.diagnosis.id, id)).returning();
		return result;
	},

	async softDeleteDiagnosis(id: string, clinicId: string) {
		const [result] = await db
			.update(schema.diagnosis)
			.set({ deletedAt: new Date(), clinicId })
			.where(eq(schema.diagnosis.id, id))
			.returning();
		return result;
	},

	async restoreDiagnosis(id: string) {
		const [result] = await db
			.update(schema.diagnosis)
			.set({ deletedAt: null })
			.where(eq(schema.diagnosis.id, id))
			.returning();
		return result;
	},
	async createDiagnosis(data: DiagnosisCreateInput) {
		const [result] = await db.insert(schema.diagnosis).values(data).returning();
		return result;
	},
	async restoreMedicalRecord(id: string) {
		const [result] = await db
			.update(schema.medicalRecord)
			.set({ deletedAt: null })
			.where(eq(schema.medicalRecord.id, id))
			.returning();
		return result;
	},
	async completeEncounter(encounterData: {
		medicalRecordId: string;
		diagnosisId?: string;
		notes?: string;
		followUpDate?: Date;
		prescribedMedications?: Array<{
			drugId: string;
			dosageValue: number;
			dosageUnit: string;
			frequency: schema.Frequency;
			duration: string;
			instructions?: string;
		}>;
	}) {
		return await db.transaction(async tx => {
			// Update medical record
			const [medicalRecord] = await tx
				.update(schema.medicalRecord)
				.set({
					status: "ACTIVE",
					notes: encounterData.notes,
					followUpDate: encounterData.followUpDate,
					updatedAt: new Date()
				})
				.where(eq(schema.medicalRecord.id, encounterData.medicalRecordId))
				.returning();

			if (!medicalRecord) {
				throw new Error("Medical record not found");
			}

			// Create prescribed items if provided
			const prescriptions: schema.PrescribedItem[] = [];
			if (encounterData.prescribedMedications?.length) {
				const [prescription] = await tx
					.insert(schema.prescription)
					.values({
						id: crypto.randomUUID(),
						medicalRecordId: medicalRecord.id,
						patientId: medicalRecord.patientId,
						doctorId: medicalRecord.doctorId,
						clinicId: medicalRecord.clinicId,
						diagnosis: medicalRecord.diagnosis, // Add diagnosis field
						encounterId: encounterData.diagnosisId || "",
						status: "ACTIVE",
						issuedDate: new Date()
					})
					.returning();

				for (const med of encounterData.prescribedMedications) {
					const [prescribedItem] = await tx
						.insert(schema.prescribedItem)
						.values({
							id: crypto.randomUUID(),
							prescriptionId: prescription?.id ?? "",
							clinicId: medicalRecord.clinicId,
							drugId: med.drugId,
							dosageValue: med.dosageValue,
							dosageUnit: med.dosageUnit, // Assuming dosageUnit is part of med
							drugRoute: "ORAL", // Defaulting to ORAL, adjust as needed
							frequency: med.frequency,
							duration: med.duration,
							instructions: med.instructions
						})
						.returning();
					if (prescribedItem) {
						prescriptions.push(prescribedItem);
					}
				}
			}

			// Update appointment status
			await tx
				.update(schema.appointment)
				.set({ status: "COMPLETED" })
				.where(eq(schema.appointment.id, medicalRecord.appointmentId));

			return { medicalRecord, prescriptions };
		});
	},

	async createMedicalRecord(data: MedicalRecordCreateInput) {
		// Use a transaction if you plan to add more operations later
		return await db.transaction(async tx => {
			const [result] = await tx.insert(schema.medicalRecord).values(data).returning();

			if (!result) {
				throw new Error("Failed to create medical record");
			}

			return result;
		});
	},

	async createManyMedicalRecords(data: MedicalRecordCreateInput[]) {
		return await db.insert(schema.medicalRecord).values(data).returning();
	},

	async updateMedicalRecord(id: string, data: MedicalRecordUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.medicalRecord)
			.set(updateData)
			.where(eq(schema.medicalRecord.id, id))
			.returning();
		return result;
	},

	async updateManyMedicalRecords(ids: string[], data: MedicalRecordUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.medicalRecord)
			.set(updateData)
			.where(inArray(schema.medicalRecord.id, ids))
			.returning();
	},

	async deleteMedicalRecord(id: string) {
		const [result] = await db.delete(schema.medicalRecord).where(eq(schema.medicalRecord.id, id)).returning();
		return result;
	},

	async softDeleteMedicalRecord(id: string) {
		const [result] = await db
			.update(schema.medicalRecord)
			.set({ deletedAt: new Date() })
			.where(eq(schema.medicalRecord.id, id))
			.returning();
		return result;
	},
	async addVitalSignsToMedicalRecord(
		medicalRecordId: string,
		vitalSigns: Omit<VitalSignCreateInput, "id" | "medicalId" | "clinicId" | "medicalRecordId" | "patientId"> & {
			measurementId?: string | null;
		}
	) {
		// 1. Fetch the parent medical record upfront to get clinicId and patientId
		const mr = await db.query.medicalRecord.findFirst({
			where: { id: medicalRecordId }
		});

		if (!mr) {
			throw new Error(`Medical record with ID ${medicalRecordId} not found.`);
		}

		// 2. Perform the insert safely with all required relational keys
		const [vitalSign] = await db
			.insert(schema.vitalSign)
			.values({
				...vitalSigns,
				id: crypto.randomUUID(),
				medicalRecordId,
				clinicId: mr.clinicId, // <-- Resolved TS Error (clinicId required)
				patientId: mr.patientId, // <-- Resolved TS Error (patientId required)
				measurementId: vitalSigns.measurementId ?? null
			})
			.returning();

		// 3. Handle measurement and growth chart updates if applicable
		if (vitalSigns.measurementId && vitalSign) {
			const growthRec = await db.query.measurement.findFirst({
				where: { id: vitalSign.measurementId ?? "" }
			});

			if (growthRec?.weightKg && growthRec.heightCm) {
				const heightNum = Number(growthRec.heightCm);
				const weightNum = Number(growthRec.weightKg);

				const bmi = weightNum / (heightNum / 100) ** 2;
				const bmiValue = Number.parseFloat(bmi.toFixed(1));

				await db
					.update(schema.vitalSign)
					.set({ notes: `Calculated BMI: ${bmiValue}` })
					.where(eq(schema.vitalSign.id, vitalSign.id));

				// Use the pre-fetched 'mr' record instead of re-fetching it here
				await pediatricRepo.addMeasurementPoint(
					{
						patientId: mr.patientId,
						measurementDate: vitalSigns.recordedAt ?? new Date(),
						weightKg: weightNum,
						heightCm: heightNum
					},
					mr.clinicId
				);
			}
		}

		return vitalSign;
	},
	async createCompleteEncounter(data: createCompleteEncounterInput) {
		return await db.transaction(async tx => {
			// 1. Fetch appointment & clinic
			const appointment = await tx.query.appointment.findFirst({
				where: { id: data.medicalRecord.appointmentId },
				columns: { clinicId: true }
			});

			if (!appointment?.clinicId) {
				throw new Error("Clinic assignment verification failed.");
			}

			// 2. Complete appointment
			await tx
				.update(schema.appointment)
				.set({ status: "COMPLETED" })
				.where(eq(schema.appointment.id, data.medicalRecord.appointmentId));

			// 3. Insert Medical Record (Drizzle automatically infers the array structure here)
			const [record] = await tx
				.insert(schema.medicalRecord)
				.values({
					...data.medicalRecord,
					id: data.medicalRecord.id ?? crypto.randomUUID(),
					clinicId: appointment.clinicId
				})
				.returning();

			if (!record) {
				throw new Error("Failed to create medical record base entry");
			}

			const diagInput = data.diagnoses?.[0];
			if (!diagInput) {
				throw new Error("Primary diagnosis required for clinical encounter");
			}

			// Insert Diagnosis
			const [diagnosis] = await tx
				.insert(schema.diagnosis)
				.values({
					...diagInput,
					id: diagInput.id ?? crypto.randomUUID(),
					medicalId: record.id,
					patientId: data.medicalRecord.patientId,
					doctorId: data.medicalRecord.doctorId,
					appointmentId: data.medicalRecord.appointmentId,
					symptoms: diagInput.symptoms ?? "",
					clinicId: appointment.clinicId
				})
				.returning();

			if (!diagnosis) {
				throw new Error("Diagnosis processing error occurred");
			}

			// 4. Conditional Inserts (Using structured arrays lets us assign variables cleanly)
			let vitalSigns: typeof schema.vitalSign.$inferSelect | undefined;

			if (data.vitalSigns && data.vitalSigns.length > 0) {
				const vitalsInput = data.vitalSigns[0];
				if (vitalsInput) {
					[vitalSigns] = await tx
						.insert(schema.vitalSign)
						.values({
							...vitalsInput,
							id: vitalsInput.id ?? crypto.randomUUID(),
							medicalRecordId: record.id,
							measurementId: vitalsInput.measurementId ?? null,
							encounterId: diagnosis.id,
							patientId: data.medicalRecord.patientId,
							clinicId: appointment.clinicId
						})
						.returning();
				}
			}

			let growthRecord: typeof schema.measurement.$inferSelect | undefined;

			if (data.measurements && data.measurements.length > 0) {
				const growthInput = data.measurements[0];
				if (growthInput) {
					let attachmentIds: string[] | undefined;
					if (growthInput.attachmentIds != null) {
						attachmentIds = Array.isArray(growthInput.attachmentIds)
							? growthInput.attachmentIds.map(String)
							: [String(growthInput.attachmentIds)];
					}

					[growthRecord] = await tx
						.insert(schema.measurement)
						.values({
							...growthInput,
							attachmentIds,
							chronologicalAgeMonths: growthInput.chronologicalAgeMonths ?? 0, // Provide a default or ensure it's always present
							id: growthInput.id ?? crypto.randomUUID(),
							patientId: data.medicalRecord.patientId,
							clinicId: appointment.clinicId
						})
						.returning();
				}
			}

			return { medicalRecord: record, diagnosis, vitalSigns, growthRecord };
		});
	}
};

export type MedicalRepo = typeof medicalRepo;
