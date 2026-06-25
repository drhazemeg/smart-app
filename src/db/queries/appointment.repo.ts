// db/repositories/appointment.repo.ts

import {
	and,
	type Column,
	type ColumnBaseConfig,
	type ColumnType,
	count,
	eq,
	gte,
	ilike,
	inArray,
	lte,
	ne,
	or,
	type SQL,
	type SQLWrapper,
	sql
} from "drizzle-orm";
import { generateId } from "@/utils/id";
import { type DBorTx, db } from "../client";
import * as schema from "../schema";
import type { AppointmentCreateInput, UpdateAppointmentInput } from "../zod";

export const appointmentRepository = {
	// ============================================================
	// CRUD OPERATIONS
	// ============================================================

	async getAppointmentCount(clinicId: string, role: schema.Role) {
		const conditions: SQL[] = [eq(schema.appointment.isDeleted, false)];

		if (role !== "admin" && role !== "doctor") {
			conditions.push(eq(schema.appointment.clinicId, clinicId));
		}

		const [result] = await db
			.select({ count: count() })
			.from(schema.appointment)
			.where(and(...conditions));

		return result?.count ?? 0;
	},

	async getAppointmentById(id: string, clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.appointment.findFirst({
			where: {
				id,
				clinicId,
				isDeleted: false
			},
			with: {
				patient: true,
				doctor: true,
				service: true,
				clinic: true
			}
		});
	},

	async createAppointment(data: schema.NewAppointment, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.appointment).values(data).returning();
		return result;
	},

	async updateAppointment(id: string, data: Partial<schema.NewAppointment>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.appointment)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.appointment.id, id))
			.returning();
		return result;
	},

	async softDeleteAppointment(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.appointment)
			.set({ deletedAt: new Date(), isDeleted: true })
			.where(eq(schema.appointment.id, id))
			.returning();
		return result;
	},

	async bulkUpdateAppointmentStatus(appointmentIds: string[], status: schema.AppointmentStatus) {
		return await db
			.update(schema.appointment)
			.set({ status, updatedAt: new Date() })
			.where(inArray(schema.appointment.id, appointmentIds))
			.returning();
	},

	// ============================================================
	// QUERIES WITH FILTERS (RQB v2 Object Syntax)
	// ============================================================

	async getAppointmentsInRange(clinicId: string, startDate: Date, endDate: Date, doctorId?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false,
			appointmentDate: { gte: startDate, lte: endDate }
		};
		if (doctorId) {
			where.doctorId = doctorId;
		}

		return await client.query.appointment.findMany({
			where,
			with: {
				patient: { with: { user: true } },
				doctor: true
			},
			orderBy: { appointmentDate: "asc" }
		});
	},

	async getAppointmentsByStatus(clinicId: string, status: schema.AppointmentStatus, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.appointment.findMany({
			where: { clinicId, status, isDeleted: false },
			with: { patient: true, doctor: true },
			orderBy: { appointmentDate: "asc" }
		});
	},

	async getAppointmentsFallback(clinicId: string, startDate: Date, endDate: Date, doctorId?: string) {
		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false,
			appointmentDate: { gte: startDate, lte: endDate }
		};
		if (doctorId) {
			where.doctorId = doctorId;
		}

		return await db.query.appointment.findMany({
			where,
			with: { patient: true, doctor: true },
			orderBy: { appointmentDate: "asc" }
		});
	},

	async getAppointmentCountsByStatus(clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		const results = await client
			.select({
				status: schema.appointment.status,
				count: count()
			})
			.from(schema.appointment)
			.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)))
			.groupBy(schema.appointment.status);

		return results.reduce(
			(acc, curr) => {
				if (curr.status) {
					acc[curr.status] = Number(curr.count);
				}
				return acc;
			},
			{} as Record<string, number>
		);
	},

	async getDoctorAvailability(doctorId: string, date: Date) {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		const [workingDays, appointments] = await Promise.all([
			db.query.workingDay.findMany({
				where: { doctorId }
			}),
			db.query.appointment.findMany({
				where: {
					doctorId,
					appointmentDate: { gte: startOfDay, lte: endOfDay },
					isDeleted: false
				}
			})
		]);
		return { workingDays, appointments };
	},

	async getAvailableTimeSlots(doctorId: string, date: Date, durationMinutes = 30) {
		const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as schema.Weekday;

		const workingDay = await db.query.workingDay.findFirst({
			where: {
				doctorId,
				day: dayName
			}
		});

		if (!workingDay) {
			return [];
		}

		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		const appointments = await db.query.appointment.findMany({
			where: {
				doctorId,
				appointmentDate: { gte: startOfDay, lte: endOfDay },
				isDeleted: false,
				status: { notIn: ["CANCELLED", "COMPLETED"] }
			}
		});

		// Generate time slots
		const [startHour, startMinute] = (workingDay.startTime.split(":") ?? ["0", "0"]).map(Number);
		const [endHour, endMinute] = (workingDay.endTime.split(":") ?? ["0", "0"]).map(Number);

		const slots: schema.Slot[] = [];
		const currentTime = new Date(date);
		currentTime.setHours(startHour || 0, startMinute || 0, 0, 0);
		const endTime = new Date(date);
		endTime.setHours(endHour || 0, endMinute || 0, 0, 0);

		while (currentTime < endTime) {
			const slotEnd = new Date(currentTime);
			slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

			const isBooked = appointments.some(apt => {
				const aptTime = new Date(apt.appointmentDate);
				return (
					aptTime.getHours() === currentTime.getHours() && aptTime.getMinutes() === currentTime.getMinutes()
				);
			});

			if (!isBooked) {
				slots.push({
					startTime: currentTime.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false
					}),
					endTime: slotEnd.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false
					}),
					isAvailable: true
				});
			}

			currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
		}

		return slots;
	},

	async getMonthlyAppointmentData(clinicId: string, year: number) {
		return await db
			.select({
				month: sql<number>`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`,
				count: count()
			})
			.from(schema.appointment)
			.where(
				and(
					eq(schema.appointment.clinicId, clinicId),
					eq(schema.appointment.isDeleted, false),
					sql`EXTRACT(YEAR FROM ${schema.appointment.appointmentDate}) = ${year}`
				)
			)
			.groupBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`)
			.orderBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`);
	},

	// ============================================================
	// ADVANCED FILTERS WITH PAGINATION (RQB v2 Object Syntax)
	// ============================================================

	async getAppointmentsWithFilters(
		clinicId: string,
		filters: {
			status?: schema.AppointmentStatus;
			startDate?: Date;
			endDate?: Date;
			doctorId?: string;
			patientId?: string;
			type?: string;
			search?: string;
		},
		pagination: { limit: number; offset: number },
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false
		};

		if (filters.status) {
			where.status = filters.status;
		}
		if (filters.doctorId) {
			where.doctorId = filters.doctorId;
		}
		if (filters.patientId) {
			where.patientId = filters.patientId;
		}
		if (filters.type) {
			where.type = filters.type;
		}
		if (filters.startDate) {
			where.appointmentDate = {
				...(where.appointmentDate as object),
				gte: filters.startDate
			};
		}
		if (filters.endDate) {
			where.appointmentDate = {
				...(where.appointmentDate as object),
				lte: filters.endDate
			};
		}
		if (filters.search) {
			// Use RAW for complex OR conditions with ilike
			where.RAW = (table: {
				reason:
					| SQLWrapper<unknown>
					| Column<ColumnBaseConfig<ColumnType>, object>
					| SQL.Aliased<unknown>
					| SQL<unknown>;
				type:
					| SQLWrapper<unknown>
					| Column<ColumnBaseConfig<ColumnType>, object>
					| SQL.Aliased<unknown>
					| SQL<unknown>;
			}) => or(ilike(table.reason, `%${filters.search}%`), ilike(table.type, `%${filters.search}%`));
		}

		const [appointments, total] = await Promise.all([
			client.query.appointment.findMany({
				where,
				with: { patient: true, doctor: true },
				limit: pagination.limit,
				offset: pagination.offset,
				orderBy: { appointmentDate: "desc" }
			}),
			db
				.select({ count: count() })
				.from(schema.appointment)
				.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)))
		]);

		return {
			appointments,
			total: total[0]?.count ?? 0
		};
	},

	// ============================================================
	// AVAILABILITY CHECKS
	// ============================================================

	async checkTimeSlotAvailability(
		doctorId: string,
		appointmentDate: Date,
		durationMinutes: number,
		clinicId: string,
		excludeId?: string,
		tx?: DBorTx
	): Promise<boolean> {
		const client = tx ?? db;
		const appointmentEnd = sql`${schema.appointment.appointmentDate} + (${durationMinutes} || ' minutes')::interval`;

		const conditions: SQL[] = [
			eq(schema.appointment.doctorId, doctorId),
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false),
			sql`${schema.appointment.appointmentDate} < ${appointmentEnd}`,
			sql`${schema.appointment.appointmentDate} + (${schema.appointment.durationMinutes} || ' minutes')::interval > ${appointmentDate}`
		];

		if (excludeId) {
			conditions.push(ne(schema.appointment.id, excludeId));
		}

		const overlapping = await client
			.select()
			.from(schema.appointment)
			.where(and(...conditions))
			.limit(1);

		return overlapping.length === 0;
	},

	async validateAppointment(appointmentId: string) {
		return await db.query.appointment.findFirst({
			where: {
				id: appointmentId,
				isDeleted: false,
				status: { notIn: ["CANCELLED", "COMPLETED"] }
			}
		});
	},

	// ============================================================
	// TRANSACTIONS
	// ============================================================

	async cancelAppointment(appointmentId: string, clinicId: string, reason: string) {
		return await db.transaction(async tx => {
			const [appointment] = await tx
				.update(schema.appointment)
				.set({
					status: "CANCELLED",
					note: reason,
					updatedAt: new Date()
				})
				.where(eq(schema.appointment.id, appointmentId))
				.returning();

			if (appointment) {
				await tx.insert(schema.notification).values({
					userId: appointment.patientId,
					clinicId,
					title: "Appointment Cancelled",
					body: `Your appointment has been cancelled. Reason: ${reason}`,
					type: "appointment_cancelled",
					priority: "HIGH"
				});
			}

			return appointment;
		});
	},

	// ============================================================
	// BULK OPERATIONS
	// ============================================================

	async createManyAppointments(data: AppointmentCreateInput[]) {
		return await db.insert(schema.appointment).values(data).returning();
	},

	async updateManyAppointments(ids: string[], data: UpdateAppointmentInput) {
		return await db
			.update(schema.appointment)
			.set({ ...data, updatedAt: new Date() })
			.where(inArray(schema.appointment.id, ids))
			.returning();
	},

	async deleteAppointment(id: string) {
		const [result] = await db.delete(schema.appointment).where(eq(schema.appointment.id, id)).returning();
		return result;
	},

	async restoreAppointment(id: string) {
		const [result] = await db
			.update(schema.appointment)
			.set({ deletedAt: null })
			.where(eq(schema.appointment.id, id))
			.returning();
		return result;
	},

	// ============================================================
	// MEDICAL RECORD WITH ENCOUNTER
	// ============================================================

	async createMedicalRecordWithEncounter(data: {
		patientId: string;
		doctorId: string;
		clinicId: string;
		appointmentId: string;
		diagnosis: string;
		symptoms: string;
		treatmentPlan: string;
		vitalSign?: {
			bodyTemperature?: number;
			systolic?: number;
			diastolic?: number;
			heartRate?: number;
			weight?: number;
			height?: number;
		};
		prescriptions?: Array<{
			medicationName: string;
			dosageValue: number;
			dosageUnit: string;
			frequency: string;
			duration: string;
		}>;
	}) {
		return await db.transaction(async tx => {
			// Create medical record
			const [medicalRecord] = await tx
				.insert(schema.medicalRecord)
				.values({
					id: crypto.randomUUID(),
					patientId: data.patientId,
					doctorId: data.doctorId,
					clinicId: data.clinicId,
					appointmentId: data.appointmentId,
					diagnosis: data.diagnosis,
					symptoms: data.symptoms,
					treatmentPlan: data.treatmentPlan,
					status: "ACTIVE"
				})
				.returning();

			// Create diagnosis record
			const [diagnosis] = await tx
				.insert(schema.diagnosis)
				.values({
					id: generateId(),
					patientId: data.patientId,
					doctorId: data.doctorId,
					clinicId: data.clinicId,
					appointmentId: data.appointmentId,
					medicalId: medicalRecord?.id ?? "",
					diagnosis: data.diagnosis,
					symptoms: data.symptoms,
					status: "PENDING"
				})
				.returning();

			// Create vital signs if provided
			if (data.vitalSign) {
				await tx.insert(schema.vitalSign).values({
					id: crypto.randomUUID(),
					medicalRecordId: medicalRecord?.id ?? "",
					clinicId: data.clinicId,
					patientId: data.patientId,
					doctorId: data.doctorId,
					encounterId: diagnosis?.id ?? "",
					recordedAt: new Date(),
					bodyTemperature: data.vitalSign.bodyTemperature,
					systolic: data.vitalSign.systolic,
					diastolic: data.vitalSign.diastolic,
					heartRate: data.vitalSign.heartRate,
					weight: data.vitalSign.weight,
					height: data.vitalSign.height
				});
			}

			// Create prescriptions if provided
			if (data.prescriptions && data.prescriptions.length > 0) {
				const [prescription] = await tx
					.insert(schema.prescription)
					.values({
						id: crypto.randomUUID(),
						medicalRecordId: medicalRecord?.id ?? "",
						patientId: data.patientId,
						doctorId: data.doctorId,
						clinicId: data.clinicId,
						encounterId: diagnosis?.id ?? "",
						status: "ACTIVE",
						issuedDate: new Date(),
						diagnosis: data.diagnosis
					})
					.returning();

				for (const med of data.prescriptions) {
					let drug = await tx.query.drug.findFirst({
						where: {
							name: med.medicationName
						}
					});

					if (!drug) {
						[drug] = await tx
							.insert(schema.drug)
							.values({
								id: crypto.randomUUID(),
								name: med.medicationName,
								clinicId: data.clinicId
							})
							.returning();
					}

					await tx.insert(schema.prescribedItem).values({
						id: crypto.randomUUID(),
						prescriptionId: prescription?.id ?? "",
						clinicId: data.clinicId,
						drugId: drug?.id ?? "",
						dosageValue: med.dosageValue,
						dosageUnit: med.dosageUnit,
						frequency: med.frequency as schema.Frequency,
						duration: med.duration,
						drugRoute: "ORAL"
					});
				}
			}

			// Update appointment status
			await tx
				.update(schema.appointment)
				.set({ status: "COMPLETED" })
				.where(eq(schema.appointment.id, data.appointmentId));

			return { medicalRecord, diagnosis };
		});
	},

	// ============================================================
	// RESCHEDULE
	// ============================================================

	async rescheduleAppointment(appointmentId: string, newDate: Date, newTime: string, reason?: string) {
		return await db.transaction(async tx => {
			const appointment = await tx.query.appointment.findFirst({
				where: { id: appointmentId }
			});

			if (!appointment) {
				throw new Error("Appointment not found");
			}

			// Check new time slot availability
			const conflict = await tx.query.appointment.findFirst({
				where: {
					doctorId: appointment.doctorId,
					time: appointment.time ?? "",
					isDeleted: false,
					appointmentDate: { gte: appointment.appointmentDate },
					status: {
						notIn: ["CANCELLED", "COMPLETED"]
					}
				}
			});

			if (conflict) {
				throw new Error("New time slot is already booked");
			}

			// Update appointment
			const [updated] = await tx
				.update(schema.appointment)
				.set({
					appointmentDate: newDate,
					time: newTime,
					note: reason ? `${appointment.note || ""}\nRescheduled: ${reason}` : appointment.note,
					updatedAt: new Date()
				})
				.where(eq(schema.appointment.id, appointmentId))
				.returning();

			// Notify patient
			const patient = await tx.query.patient.findFirst({
				where: { id: appointment.patientId },
				with: { user: true }
			});

			if (patient?.userId) {
				await tx.insert(schema.notification).values({
					userId: patient.userId,
					clinicId: appointment.clinicId,
					title: "Appointment Rescheduled",
					body: `Your appointment has been rescheduled to ${newDate.toLocaleDateString()} at ${newTime}`,
					type: "appointment_rescheduled",
					priority: "HIGH"
				});
			}

			return updated;
		});
	},

	// ============================================================
	// PAGINATION HELPERS
	// ============================================================

	async getAppointmentsWithPagination(
		clinicId: string,
		pagination: { page: number; limit: number },
		filters?: {
			status?: schema.AppointmentStatus;
			fromDate?: Date;
			toDate?: Date;
			patientId?: string;
			doctorId?: string;
			search?: string;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const { page, limit } = pagination;
		const offset = (page - 1) * limit;

		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false
		};

		if (filters?.status) {
			where.status = filters.status;
		}
		if (filters?.doctorId) {
			where.doctorId = filters.doctorId;
		}
		if (filters?.patientId) {
			where.patientId = filters.patientId;
		}
		if (filters?.fromDate) {
			where.appointmentDate = {
				...(where.appointmentDate as object),
				gte: filters.fromDate
			};
		}
		if (filters?.toDate) {
			where.appointmentDate = {
				...(where.appointmentDate as object),
				lte: filters.toDate
			};
		}
		if (filters?.search) {
			where.RAW = (table: {
				reason:
					| SQLWrapper<unknown>
					| Column<ColumnBaseConfig<ColumnType>, object>
					| SQL.Aliased<unknown>
					| SQL<unknown>;
				type:
					| SQLWrapper<unknown>
					| Column<ColumnBaseConfig<ColumnType>, object>
					| SQL.Aliased<unknown>
					| SQL<unknown>;
			}) => or(ilike(table.reason, `%${filters.search}%`), ilike(table.type, `%${filters.search}%`));
		}

		const [appointments, totalResult] = await Promise.all([
			client.query.appointment.findMany({
				where,
				with: {
					patient: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							phone: true
						}
					},
					doctor: {
						columns: { id: true, name: true, specialty: true, email: true }
					},
					service: {
						columns: {
							id: true,
							serviceName: true,
							price: true,
							duration: true
						}
					},
					clinic: {
						columns: { id: true, name: true, address: true, phone: true }
					}
				},
				limit,
				offset,
				orderBy: { appointmentDate: "desc" }
			}),
			db
				.select({ count: count() })
				.from(schema.appointment)
				.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)))
		]);

		const total = totalResult[0]?.count ?? 0;

		return {
			appointments,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	},

	// ============================================================
	// PATIENT APPOINTMENTS
	// ============================================================

	async getPatientAppointments(
		patientId: string,
		clinicId: string,
		pagination: { page: number; limit: number },
		status?: schema.AppointmentStatus,
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const { page, limit } = pagination;
		const offset = (page - 1) * limit;

		const where: Record<string, unknown> = {
			patientId,
			clinicId,
			isDeleted: false
		};

		if (status) {
			where.status = status;
		}

		const [appointments, totalResult] = await Promise.all([
			client.query.appointment.findMany({
				where,
				with: {
					doctor: true,
					service: true,
					clinic: true
				},
				limit,
				offset,
				orderBy: { appointmentDate: "desc" }
			}),
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.appointment)
				.where(
					and(
						eq(schema.appointment.patientId, patientId),
						eq(schema.appointment.clinicId, clinicId),
						eq(schema.appointment.isDeleted, false),
						status ? eq(schema.appointment.status, status) : sql`1=1`
					)
				)
		]);

		const total = totalResult[0]?.count ?? 0;

		return {
			appointments,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	},

	// ============================================================
	// DOCTOR APPOINTMENTS
	// ============================================================

	async getDoctorAppointmentsInRange(doctorId: string, startDate: Date, endDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.appointment.findMany({
			where: {
				doctorId,
				isDeleted: false,
				appointmentDate: { gte: startDate, lte: endDate }
			},
			with: { patient: true, service: true },
			orderBy: { appointmentDate: "asc" }
		});
	},

	async getBookedSlotsForDoctor(
		doctorId: string,
		date: Date,
		tx?: DBorTx
	): Promise<Array<{ start: Date; duration: number }>> {
		const client = tx ?? db;
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		const appointments = await client.query.appointment.findMany({
			where: {
				doctorId,
				isDeleted: false,
				appointmentDate: { gte: startOfDay, lte: endOfDay },
				status: { notIn: ["CANCELLED", "COMPLETED"] }
			},
			columns: { appointmentDate: true, durationMinutes: true }
		});

		return appointments.map(apt => ({
			start: apt.appointmentDate,
			duration: apt.durationMinutes ?? 30
		}));
	},

	async getDoctorAppointments(doctorId: string, startDate?: Date, endDate?: Date) {
		const where: Record<string, unknown> = {
			doctorId,
			isDeleted: false
		};

		if (startDate) {
			where.appointmentDate = { gte: startDate };
		}
		if (endDate) {
			where.appointmentDate = {
				...(where.appointmentDate as object),
				lte: endDate
			};
		}

		return await db.query.appointment.findMany({
			where,
			with: {
				patient: {
					columns: {
						id: true,
						firstName: true,
						lastName: true,
						dateOfBirth: true,
						phone: true
					}
				},
				service: {
					columns: { id: true, serviceName: true, price: true }
				}
			},
			orderBy: { appointmentDate: "desc" }
		});
	},

	// ============================================================
	// UPCOMING APPOINTMENTS
	// ============================================================

	async getUpcomingAppointments(params: {
		clinicId: string;
		limit?: number;
		patientIds?: string[];
		doctorId?: string;
	}) {
		const { clinicId, limit = 5, patientIds, doctorId } = params;

		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false,
			status: "CONFIRMED",
			appointmentDate: { gte: new Date() }
		};

		if (patientIds && patientIds.length > 0) {
			where.patientId = { in: patientIds };
		}

		if (doctorId) {
			where.doctorId = doctorId;
		}

		return await db.query.appointment.findMany({
			where,
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true }
				},
				doctor: {
					columns: { id: true, name: true, specialty: true }
				},
				service: {
					columns: { id: true, serviceName: true, price: true }
				}
			},
			orderBy: { appointmentDate: "asc" },
			limit
		});
	},

	async getUpcomingAppointmentsCount(params: { clinicId: string; patientIds?: string[]; doctorId?: string }) {
		const { clinicId, patientIds, doctorId } = params;

		const conditions: SQL[] = [
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false),
			eq(schema.appointment.status, "CONFIRMED"),
			gte(schema.appointment.appointmentDate, new Date())
		];

		if (patientIds && patientIds.length > 0) {
			const result = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.appointment)
				.where(and(...conditions, sql`${schema.appointment.patientId} IN (${patientIds.join(",")})`));
			return Number(result[0]?.count ?? 0);
		}

		if (doctorId) {
			const result = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.appointment)
				.where(and(...conditions, eq(schema.appointment.doctorId, doctorId)));
			return Number(result[0]?.count ?? 0);
		}

		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.appointment)
			.where(and(...conditions));

		return Number(result[0]?.count ?? 0);
	},

	async getUpcomingCount(clinicId: string, patientIds?: string[]) {
		const now = new Date();
		now.setHours(0, 0, 0, 0);

		const conditions: SQL[] = [
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false),
			gte(schema.appointment.appointmentDate, now),
			sql`${schema.appointment.status} IN ('PENDING', 'CONFIRMED')`
		];

		if (patientIds) {
			conditions.push(sql`${schema.appointment.patientId} IN (${patientIds.join(",")})`);
		}

		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.appointment)
			.where(and(...conditions));

		return Number(result[0]?.count ?? 0);
	},

	async getUpcomingPatientAppointments(patientId: string, limit?: number) {
		return await db.query.appointment.findMany({
			where: {
				patientId,
				isDeleted: false,
				status: { in: ["PENDING", "CONFIRMED"] },
				appointmentDate: { gte: new Date() }
			},
			with: {
				doctor: {
					columns: { id: true, name: true, specialty: true }
				},
				service: {
					columns: { id: true, serviceName: true, price: true }
				}
			},
			orderBy: { appointmentDate: "asc" },
			limit
		});
	},

	// ============================================================
	// DATE RANGE QUERIES
	// ============================================================

	async getAppointmentsByDateRange(params: {
		clinicId: string;
		startDate: Date;
		endDate: Date;
		status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
	}) {
		const { clinicId, startDate, endDate, status } = params;

		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false,
			appointmentDate: { gte: startDate, lte: endDate }
		};

		if (status) {
			where.status = status;
		}

		return await db.query.appointment.findMany({
			where,
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true }
				},
				doctor: {
					columns: { id: true, name: true, specialty: true }
				}
			},
			orderBy: { appointmentDate: "asc" }
			// Use await here if you want to await the query
		});
	},

	async getAppointmentsByDate(params: {
		clinicId: string;
		date: Date;
		status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
	}) {
		const { clinicId, date, status } = params;

		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		return await this.getAppointmentsByDateRange({
			clinicId,
			startDate: startOfDay,
			endDate: endOfDay,
			status
		});
	},

	// ============================================================
	// STATISTICS
	// ============================================================

	async getAppointmentStats(params: { clinicId: string; startDate: Date; endDate: Date }) {
		const { clinicId, startDate, endDate } = params;

		const baseConditions = [
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false),
			gte(schema.appointment.appointmentDate, startDate),
			lte(schema.appointment.appointmentDate, endDate)
		];

		const [total, pending, confirmed, completed, cancelled, noShow] = await Promise.all([
			db.$count(schema.appointment, and(...baseConditions)),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "PENDING"))),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "CONFIRMED"))),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "COMPLETED"))),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "CANCELLED"))),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "NO_SHOW")))
		]);

		return {
			total,
			pending,
			confirmed,
			completed,
			cancelled,
			noShow,
			completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
			cancellationRate: total > 0 ? Math.round(((cancelled + noShow) / total) * 100) : 0
		};
	},

	async getDoctorAppointmentStats(params: { doctorId: string; clinicId: string; startDate: Date; endDate: Date }) {
		const { doctorId, clinicId, startDate, endDate } = params;

		const baseConditions = [
			eq(schema.appointment.doctorId, doctorId),
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false),
			gte(schema.appointment.appointmentDate, startDate),
			lte(schema.appointment.appointmentDate, endDate)
		];

		const [total, completed, cancelled, noShow] = await Promise.all([
			db.$count(schema.appointment, and(...baseConditions)),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "COMPLETED"))),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "CANCELLED"))),
			db.$count(schema.appointment, and(...baseConditions, eq(schema.appointment.status, "NO_SHOW")))
		]);

		return {
			total,
			completed,
			cancelled,
			noShow,
			completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
			noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0
		};
	},

	// ============================================================
	// REMINDERS
	// ============================================================

	async getAppointmentsRequiringReminders(params: { clinicId: string; hoursBefore?: number }) {
		const { clinicId, hoursBefore = 24 } = params;

		const reminderTime = new Date();
		reminderTime.setHours(reminderTime.getHours() + hoursBefore);

		return await db.query.appointment.findMany({
			where: {
				clinicId,
				isDeleted: false,
				status: "CONFIRMED",
				appointmentDate: {
					gte: new Date(),
					lte: reminderTime
				}
			},
			with: {
				patient: {
					with: {
						guardians: true
					}
				},
				doctor: true
			}
		});
	},

	// ============================================================
	// LIST APPOINTMENTS (RQB v2 Object Syntax)
	// ============================================================

	async listAppointments(params: {
		clinicId: string;
		page: number;
		limit: number;
		status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
		patientId?: string;
		doctorId?: string;
		startDate?: Date;
		endDate?: Date;
		search?: string;
	}) {
		const { clinicId, page, limit, status, patientId, doctorId, startDate, endDate, search } = params;

		// Build RQB v2 object filter
		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false
		};

		if (status) {
			where.status = status;
		}
		if (patientId) {
			where.patientId = patientId;
		}
		if (doctorId) {
			where.doctorId = doctorId;
		}
		if (startDate) {
			where.appointmentDate = { gte: startDate };
		}
		if (endDate) {
			where.appointmentDate = {
				...(where.appointmentDate as object),
				lte: endDate
			};
		}

		if (search) {
			// Use RAW for complex search with relations
			where.RAW = (table: {
				patient: {
					firstName:
						| SQLWrapper<unknown>
						| Column<ColumnBaseConfig<ColumnType>, object>
						| SQL.Aliased<unknown>
						| SQL<unknown>;
					lastName:
						| SQLWrapper<unknown>
						| Column<ColumnBaseConfig<ColumnType>, object>
						| SQL.Aliased<unknown>
						| SQL<unknown>;
				};
				doctor: {
					name:
						| SQLWrapper<unknown>
						| Column<ColumnBaseConfig<ColumnType>, object>
						| SQL.Aliased<unknown>
						| SQL<unknown>;
				};
			}) =>
				or(
					ilike(table.patient.firstName, `%${search}%`),
					ilike(table.patient.lastName, `%${search}%`),
					ilike(table.doctor.name, `%${search}%`)
				);
		}

		// Build count conditions
		const countConditions: SQL[] = [
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false)
		];

		if (status) {
			countConditions.push(eq(schema.appointment.status, status));
		}
		if (patientId) {
			countConditions.push(eq(schema.appointment.patientId, patientId));
		}
		if (doctorId) {
			countConditions.push(eq(schema.appointment.doctorId, doctorId));
		}
		if (startDate) {
			countConditions.push(gte(schema.appointment.appointmentDate, startDate));
		}
		if (endDate) {
			countConditions.push(lte(schema.appointment.appointmentDate, endDate));
		}

		if (search) {
			const searchCondition = or(
				ilike(schema.patient.firstName, `%${search}%`),
				ilike(schema.patient.lastName, `%${search}%`),
				ilike(schema.doctor.name, `%${search}%`)
			);
			if (searchCondition) {
				countConditions.push(searchCondition);
			}
		}

		const [appointments, total] = await Promise.all([
			db.query.appointment.findMany({
				where,
				with: {
					patient: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							dateOfBirth: true,
							phone: true
						}
					},
					doctor: {
						columns: { id: true, name: true, specialty: true, phone: true }
					},
					service: {
						columns: { id: true, serviceName: true, price: true }
					}
				},
				limit,
				offset: (page - 1) * limit,
				orderBy: { appointmentDate: "desc" }
			}),
			db.$count(schema.appointment, and(...countConditions))
		]);

		return {
			appointments,
			total,
			totalPages: Math.ceil(total / limit),
			page
		};
	},

	// ============================================================
	// MISC HELPERS
	// ============================================================

	async isTimeSlotAvailable(params: { doctorId: string; date: Date; time: string }) {
		const { doctorId, date, time } = params;

		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		const existing = await db.query.appointment.findFirst({
			where: {
				doctorId,
				isDeleted: false,
				appointmentDate: { gte: startOfDay, lte: endOfDay },
				time,
				status: { in: ["PENDING", "CONFIRMED"] }
			}
		});

		return !existing;
	},

	async findManyByClinic(clinicId: string, limit = 5) {
		return await db.query.appointment.findMany({
			where: { clinicId, isDeleted: false, status: "CONFIRMED" },
			with: {
				patient: { columns: { id: true, firstName: true, lastName: true } },
				doctor: { columns: { id: true, name: true, specialty: true } }
			},
			orderBy: { appointmentDate: "asc" },
			limit
		});
	},

	async updateAppointmentStatus(id: string, status: schema.AppointmentStatus) {
		const [result] = await db
			.update(schema.appointment)
			.set({ status, updatedAt: new Date() })
			.where(eq(schema.appointment.id, id))
			.returning();
		return result;
	},

	async updateAppointmentWithNote(id: string, status: schema.AppointmentStatus, note?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.appointment)
			.set({
				status,
				note: note ? sql`${schema.appointment.note} || '\n' || ${note}` : undefined,
				updatedAt: new Date()
			})
			.where(eq(schema.appointment.id, id))
			.returning();
		return result;
	},

	// ============================================================
	// FALLBACK METHODS (DEPRECATED - keep for backward compat)
	// ============================================================

	async getAppointmentsFallbackPaginated(
		clinicId: string,
		page: number,
		limit: number,
		status?: schema.AppointmentStatus,
		doctorId?: string,
		patientId?: string
	) {
		const where: Record<string, unknown> = {
			clinicId,
			isDeleted: false
		};

		if (status) {
			where.status = status;
		}
		if (doctorId) {
			where.doctorId = doctorId;
		}
		if (patientId) {
			where.patientId = patientId;
		}

		const appointments = await db.query.appointment.findMany({
			where,
			with: {
				patient: true,
				doctor: true,
				service: true
			},
			orderBy: { appointmentDate: "desc" }
		});

		const paginated = appointments.slice((page - 1) * limit, page * limit);

		return {
			appointments: paginated,
			total: appointments.length
		};
	},

	async getAppointmentByIdFallback(id: string, clinicId: string) {
		return await db.query.appointment.findFirst({
			where: {
				id,
				clinicId,
				isDeleted: false
			},
			with: { patient: true, doctor: true }
		});
	},

	async getAllAppointments(clinicId: string) {
		return await db.query.appointment.findMany({
			where: { clinicId },
			with: { patient: true, doctor: true },
			orderBy: { appointmentDate: "asc" }
		});
	}
};

export type AppointmentRepo = typeof appointmentRepository;
