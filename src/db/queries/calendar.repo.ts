// db/querries/calendar.repo.ts

import { type DBorTx, db } from "#/db/client.server";
import { and, eq, ne, sql } from "drizzle-orm";
import * as schema from "../schema";
import type { Weekday } from "../zod";

export const calendarRepo = {
	/**
	 * Get doctor's working hours for a specific date
	 */
	async getDoctorWorkingHours(doctorId: string, date: Date, tx?: DBorTx) {
		const client = tx ?? db;

		// Keep the date parsing logic safely encapsulated inside the repository
		const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as Weekday;

		const result = await client.query.workingDay.findFirst({
			where: { doctorId, day: dayOfWeek, isActive: true }
		});

		if (!result) {
			return null;
		}

		return {
			startTime: result.startTime,
			endTime: result.endTime
		};
	},
	/**
	 * Check if a time slot is available for a doctor
	 */
	async checkSlotAvailability(
		doctorId: string,
		start: Date,
		end: Date,
		clinicId: string,
		excludeId?: string,
		tx?: DBorTx
	): Promise<boolean> {
		const client = tx ?? db;
		const conditions = [
			eq(schema.appointment.doctorId, doctorId),
			eq(schema.appointment.clinicId, clinicId),
			eq(schema.appointment.isDeleted, false),
			sql`${schema.appointment.appointmentDate} < ${end}`,
			sql`${schema.appointment.appointmentDate} + (${schema.appointment.durationMinutes} || ' minutes')::interval > ${start}`
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

	/**
	 * Get booked slots for a doctor on a specific date
	 */
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

	/**
	 * Create appointment reminders
	 */
	async createAppointmentReminders(
		appointmentId: string,
		appointmentDate: Date,
		reminderTimes: number[] = [24, 2],
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const reminders: Array<{
			id: string;
			appointmentId: string;
			method: string;
			sentAt: Date;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		}> = [];

		for (const hoursBefore of reminderTimes) {
			const reminderTime = new Date(appointmentDate);
			reminderTime.setHours(reminderTime.getHours() - hoursBefore);

			const [reminder] = await client
				.insert(schema.reminder)
				.values({
					id: crypto.randomUUID(),
					appointmentId,
					method: "EMAIL",
					status: "PENDING",
					sentAt: reminderTime
				})
				.returning();

			reminders.push(reminder);
		}

		return reminders;
	},

	/**
	 * Get doctor's working days for a week
	 */
	async getDoctorWeeklySchedule(doctorId: string, startDate: Date, tx?: DBorTx) {
		const client = tx ?? db;
		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 6);

		const workingDays = await client.query.workingDay.findMany({
			where: {
				doctorId,
				isActive: true
			}
		});

		const appointments = await client.query.appointment.findMany({
			where: {
				doctorId,
				isDeleted: false,
				appointmentDate: { gte: startDate, lte: endDate },
				status: { notIn: ["CANCELLED", "COMPLETED"] }
			},
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true }
				}
			},
			orderBy: { appointmentDate: "asc" }
		});

		return { workingDays, appointments };
	}
};

export type CalendarRepo = typeof calendarRepo;
// In your calendar.repo.ts (or wherever the repo is)
export type DoctorSchedule = Awaited<ReturnType<typeof calendarRepo.getDoctorWeeklySchedule>>;
