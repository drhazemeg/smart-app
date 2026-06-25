// db/repositories/doctor.repo.ts

import { db, type DBorTx } from "#/db/client.server";
import { and, count, eq, ilike, inArray, or, type SQL } from "drizzle-orm";

import * as schema from "../schema";
import type { DoctorCreateInput, DoctorUpdateInput, WorkingDayCreateInput, WorkingDayUpdateInput } from "../zod";

export const doctorRepo = {
	async getDoctorById(id: string, clinicId?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const conditions: Record<string, unknown> = { id, isDeleted: false };
		if (clinicId) {
			conditions.clinicId = clinicId;
		}

		return await client.query.doctor.findFirst({
			where: conditions,
			with: {
				user: true,
				clinic: true,
				workingDays: true
			}
		});
	},

	async getDoctorByUserId(userId: string, clinicId?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const conditions: Record<string, unknown> = { userId, isDeleted: false };
		if (clinicId) {
			conditions.clinicId = clinicId;
		}

		return await client.query.doctor.findFirst({
			where: conditions,
			with: { user: true, clinic: true }
		});
	},

	async listDoctors(
		params: {
			clinicId: string;
			limit: number;
			offset: number;
			search?: string;
			specialty?: string;
			status?: schema.Status;
			availabilityStatus?: schema.AvailabilityStatus;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const { clinicId, limit, offset, search, specialty, availabilityStatus } = params;

		const conditions: SQL[] = [eq(schema.doctor.clinicId, clinicId), eq(schema.doctor.isDeleted, false)];

		if (specialty) {
			conditions.push(eq(schema.doctor.specialty, specialty));
		}
		if (availabilityStatus) {
			conditions.push(eq(schema.doctor.availabilityStatus, availabilityStatus));
		}
		if (search) {
			conditions.push(
				or(ilike(schema.doctor.name, `%${search}%`), ilike(schema.doctor.specialty, `%${search}%`)) as SQL
			);
		}

		const [doctors, total] = await Promise.all([
			client.query.doctor.findMany({
				where: { AND: conditions.map(c => ({ RAW: () => c })) },
				limit,
				offset,
				orderBy: { name: "asc" }
			}),
			client
				.select({ count: count() })
				.from(schema.doctor)
				.where(and(...conditions))
		]);

		return { doctors, total: total[0]?.count ?? 0 };
	},

	async createDoctor(data: schema.NewDoctor, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.doctor).values(data).returning();
		return result;
	},

	async updateDoctor(id: string, data: Partial<schema.NewDoctor>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.doctor)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.doctor.id, id))
			.returning();
		return result;
	},

	async upsertDoctor(data: schema.NewDoctor, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.doctor)
			.values({ ...data, updatedAt: new Date() })
			.onConflictDoUpdate({
				target: schema.doctor.userId,
				set: { ...data, updatedAt: new Date() }
			})
			.returning();
		return result;
	},

	async softDeleteDoctor(id: string, clinicId?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const conditions = [eq(schema.doctor.id, id)];
		if (clinicId) {
			conditions.push(eq(schema.doctor.clinicId, clinicId));
		}

		const [result] = await client
			.update(schema.doctor)
			.set({ deletedAt: new Date(), isDeleted: true })
			.where(and(...conditions))
			.returning();
		return result;
	},

	// Working days
	async getWorkingDays(doctorId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.workingDay.findMany({
			where: { doctorId },
			orderBy: { day: "asc" }
		});
	},

	async createWorkingDay(data: schema.NewWorkingDay, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.workingDay).values(data).returning();
		return result;
	},

	async updateWorkingDay(id: string, data: Partial<schema.NewWorkingDay>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.workingDay)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.workingDay.id, id))
			.returning();
		return result;
	},

	async deleteWorkingDay(id: string, clinicId?: string) {
		if (clinicId) {
			const [result] = await db
				.delete(schema.workingDay)
				.where(
					and(
						eq(schema.workingDay.id, id),
						inArray(
							schema.workingDay.doctorId,
							db
								.select({ id: schema.doctor.id })
								.from(schema.doctor)
								.where(eq(schema.doctor.clinicId, clinicId))
						)
					)
				)
				.returning();
			return result;
		}
		const [result] = await db.delete(schema.workingDay).where(eq(schema.workingDay.id, id)).returning();
		return result;
	},

	async replaceWorkingDays(doctorId: string, workingDays: schema.NewWorkingDay[], tx?: DBorTx) {
		const client = tx ?? db;
		return await client.transaction(async tx => {
			await tx.delete(schema.workingDay).where(eq(schema.workingDay.doctorId, doctorId));
			if (workingDays.length > 0) {
				await tx.insert(schema.workingDay).values(workingDays);
			}
		});
	},

	// Doctor performance
	async getDoctorPerformance(doctorId: string, startDate: Date, endDate: Date, clinicId?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [appointments, prescriptions] = await Promise.all([
			client.query.appointment.findMany({
				where: {
					doctorId,
					isDeleted: false,
					clinicId,
					appointmentDate: { gte: startDate, lte: endDate }
				}
			}),

			client.query.prescription.findMany({
				where: {
					doctorId,
					issuedDate: { gte: startDate, lte: endDate }
				}
			})
		]);

		const completedAppointments = appointments.filter(a => a.status === "COMPLETED");
		const cancelledAppointments = appointments.filter(a => a.status === "CANCELLED");
		return {
			totalAppointments: appointments.length,
			completedAppointments: completedAppointments.length,
			cancelledAppointments: cancelledAppointments.length,
			completionRate: appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0, // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			totalPrescriptions: prescriptions?.length ?? 0,
			totalRevenue: completedAppointments.reduce((sum, a) => sum + (a.appointmentPrice ?? 0), 0)
		};
	},
	async getDoctorAvailability(doctorId: string, date: Date) {
		const [workingDays, appointments] = await Promise.all([
			db.query.workingDay.findMany({
				where: { doctorId }
			}),

			db.query.appointment.findMany({
				where: {
					doctorId,
					appointmentDate: {
						gte: new Date(date.setHours(0, 0, 0, 0)),
						lte: new Date(date.setHours(23, 59, 59, 999))
					},
					isDeleted: false
				}
			})
		]);

		return { workingDays, appointments };
	},

	// Get doctor with patients and appointments
	async getDoctorWithSchedule(doctorId: string, clinicId?: string) {
		return await db.query.doctor.findFirst({
			where: { id: doctorId, ...(clinicId ? { clinicId } : {}) },
			with: {
				user: true,
				clinic: true,
				workingDays: true,
				appointments: {
					where: { isDeleted: false, appointmentDate: { gte: new Date() } },
					with: {
						patient: true,
						service: true
					},
					orderBy: { appointmentDate: "asc" }
				},
				medicalRecords: {
					with: {
						patient: true,
						diagnoses: true
					},
					orderBy: { createdAt: "desc" },
					limit: 20
				},
				prescriptions: {
					where: { status: "ACTIVE" },
					with: {
						patient: true,
						prescribedItems: {
							with: {
								drug: true
							}
						}
					},
					orderBy: { issuedDate: "desc" }
				}
			}
		});
	},

	async getAvailableTimeSlots(doctorId: string, date: Date, durationMinutes = 30) {
		const workingDay = await db.query.workingDay.findFirst({
			where: {
				doctorId,
				day: date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as schema.Weekday
			}
		});

		if (!workingDay) {
			return [];
		}

		const appointments = await db.query.appointment.findMany({
			where: {
				doctorId,
				appointmentDate: {
					gte: new Date(date.setHours(0, 0, 0, 0)),
					lte: new Date(date.setHours(23, 59, 59, 999))
				},
				isDeleted: false,
				status: {
					notIn: ["CANCELLED", "COMPLETED"]
				}
			}
		});

		// Generate time slots
		const startHour = Number.parseInt(workingDay.startTime.split(":")[0] ?? "", 10);
		const startMinute = Number.parseInt(workingDay.startTime.split(":")[1] ?? "", 10);
		const endHour = Number.parseInt(workingDay.endTime.split(":")[0] ?? "", 10);
		const endMinute = Number.parseInt(workingDay.endTime.split(":")[1] ?? "", 10);

		const slots: schema.Slot[] = [];
		const currentTime = new Date(date);
		currentTime.setHours(startHour, startMinute, 0, 0);
		const endTime = new Date(date);
		endTime.setHours(endHour, endMinute, 0, 0);

		while (currentTime < endTime) {
			const slotEnd = new Date(currentTime);
			slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

			// Check if slot is available
			const isBooked = appointments.some(apt => {
				const aptTime = new Date(apt.appointmentDate);
				return (
					aptTime.getHours() === currentTime.getHours() && aptTime.getMinutes() === currentTime.getMinutes()
				);
			});

			if (!isBooked) {
				slots.push({
					startTime: currentTime.toLocaleTimeString(),
					endTime: slotEnd.toLocaleTimeString(),
					isAvailable: true
				});
			}

			currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
		}

		return slots;
	},
	// Update doctor schedule
	async updateDoctorSchedule(doctorId: string, workingDays: (typeof schema.workingDay.$inferInsert)[]) {
		// Delete existing working days and insert new ones
		await db.transaction(async tx => {
			await tx.delete(schema.workingDay).where(eq(schema.workingDay.doctorId, doctorId));

			for (const day of workingDays) {
				await tx.insert(schema.workingDay).values({
					...day,
					doctorId,
					id: crypto.randomUUID()
				});
			}
		});
	},

	async createManyDoctors(data: DoctorCreateInput[]) {
		return await db.insert(schema.doctor).values(data).returning();
	},

	async updateManyDoctors(ids: string[], data: DoctorUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.doctor).set(updateData).where(inArray(schema.doctor.id, ids)).returning();
	},

	async deleteDoctor(id: string, clinicId?: string) {
		const conditions = [eq(schema.doctor.id, id)];
		if (clinicId) {
			conditions.push(eq(schema.doctor.clinicId, clinicId));
		}

		const [result] = await db
			.delete(schema.doctor)
			.where(and(...conditions))
			.returning();
		return result;
	},

	async restoreDoctor(id: string) {
		const [result] = await db
			.update(schema.doctor)
			.set({ deletedAt: null })
			.where(eq(schema.doctor.id, id))
			.returning();
		return result;
	},

	async createManyWorkingDays(data: WorkingDayCreateInput[]) {
		return await db.insert(schema.workingDay).values(data).returning();
	},

	async updateManyWorkingDays(ids: string[], data: WorkingDayUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.workingDay).set(updateData).where(inArray(schema.workingDay.id, ids)).returning();
	}
};

export type DoctorRepo = typeof doctorRepo;
