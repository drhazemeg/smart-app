// db/repositories/calendar.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db/client";
import { calendarRepo } from "@/db/queries";
import type { getBookedSlotsForDoctor } from "./appointment";

// =======================
// Schema Validators
// =======================

const doctorWorkingHoursSchema = z.object({
	doctorId: z.string(),
	date: z.date()
});

const checkSlotAvailabilitySchema = z.object({
	doctorId: z.string(),
	start: z.date(),
	end: z.date(),
	clinicId: z.string(),
	excludeId: z.string().optional()
});

const createRemindersSchema = z.object({
	appointmentId: z.string(),
	appointmentDate: z.date(),
	reminderTimes: z.array(z.number()).optional()
});

const doctorWeeklyScheduleSchema = z.object({
	doctorId: z.string(),
	startDate: z.date()
});

// =======================
// Server Functions
// =======================

const getDoctorWorkingHours = createServerFn({ method: "GET" })
	.validator(doctorWorkingHoursSchema)
	.handler(async ctx => {
		try {
			const { doctorId, date } = ctx.data;
			const result = await calendarRepo.getDoctorWorkingHours(doctorId, date);

			if (!result) {
				return null;
			}

			return {
				start: result.startTime,
				end: result.endTime
			};
		} catch (error) {
			console.error("Error getting doctor working hours:", error);
			throw new Error("Failed to get doctor working hours");
		}
	});

const checkSlotAvailability = createServerFn({ method: "POST" })
	.validator(checkSlotAvailabilitySchema)
	.handler(async ctx => {
		try {
			const { doctorId, start, end, clinicId, excludeId } = ctx.data;

			const isAvailable = await calendarRepo.checkSlotAvailability(doctorId, start, end, clinicId, excludeId);

			return isAvailable;
		} catch (error) {
			console.error("Error checking slot availability:", error);
			throw new Error("Failed to check slot availability");
		}
	});

// // Get booked slots - using repository
// const getBookedSlotsForDoctor = createServerFn({ method: "GET" })
// 	.validator(bookedSlotsSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { doctorId, date } = ctx.data;
// 			const bookedSlots = await calendarRepo.getBookedSlotsForDoctor(doctorId, date);
// 			return bookedSlots;
// 		} catch (error) {
// 			console.error("Error getting booked slots:", error);
// 			throw new Error("Failed to get booked slots");
// 		}
// 	});

const createAppointmentReminders = createServerFn({ method: "POST" })
	.validator(createRemindersSchema)
	.handler(async ctx => {
		try {
			const { appointmentId, appointmentDate, reminderTimes = [24, 2] } = ctx.data;
			const reminders = await calendarRepo.createAppointmentReminders(
				appointmentId,
				appointmentDate,
				reminderTimes
			);
			return reminders;
		} catch (error) {
			console.error("Error creating appointment reminders:", error);
			throw new Error("Failed to create appointment reminders");
		}
	});

const getDoctorWeeklySchedule = createServerFn({ method: "GET" })
	.validator(doctorWeeklyScheduleSchema)
	.handler(async ctx => {
		try {
			const { doctorId, startDate } = ctx.data;
			const schedule = await calendarRepo.getDoctorWeeklySchedule(doctorId, startDate);
			return schedule;
		} catch (error) {
			console.error("Error getting doctor weekly schedule:", error);
			throw new Error("Failed to get doctor weekly schedule");
		}
	});

// =======================
// Additional Calendar Utility Functions
// =======================

const getAvailableTimeSlotsForDay = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			date: z.date(),
			clinicId: z.string(),
			durationMinutes: z.number().optional(),
			excludeAppointmentId: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			const { doctorId, date, clinicId, durationMinutes = 30, excludeAppointmentId } = ctx.data;

			// Get working hours
			const workingHours = await calendarRepo.getDoctorWorkingHours(doctorId, date);

			if (!workingHours) {
				return [];
			}

			// Parse working hours
			const [startHour, startMinute] = workingHours.startTime.split(":").map(Number);
			const [endHour, endMinute] = workingHours.endTime.split(":").map(Number);

			const startTime = new Date(date);
			startTime.setHours(startHour, startMinute, 0, 0);

			const endTime = new Date(date);
			endTime.setHours(endHour, endMinute, 0, 0);

			// Get booked slots using repository
			const bookedSlots = await calendarRepo.getBookedSlotsForDoctor(doctorId, date);

			// Generate available slots
			const slots: Array<{
				start: Date;
				end: Date;
				startTime: string;
				endTime: string;
				available: boolean;
			}> = [];
			const currentSlot = new Date(startTime);

			while (currentSlot < endTime) {
				const slotEnd = new Date(currentSlot);
				slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

				// Check if slot extends beyond working hours
				if (slotEnd > endTime) {
					break;
				}

				// Check for conflicts with booked slots
				const isBooked = bookedSlots.some(booked => {
					const bookedStart = booked.start;
					const bookedEnd = new Date(bookedStart);
					bookedEnd.setMinutes(bookedEnd.getMinutes() + booked.duration);

					return currentSlot < bookedEnd && slotEnd > bookedStart;
				});

				// Check availability using repository
				const isAvailable = await calendarRepo.checkSlotAvailability(
					doctorId,
					currentSlot,
					slotEnd,
					clinicId,
					excludeAppointmentId
				);

				if (!isBooked && isAvailable) {
					slots.push({
						start: currentSlot,
						end: slotEnd,
						startTime: currentSlot.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit"
						}),
						endTime: slotEnd.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit"
						}),
						available: true
					});
				}

				// Move to next slot
				currentSlot.setMinutes(currentSlot.getMinutes() + durationMinutes);
			}

			return slots;
		} catch (error) {
			console.error("Error getting available time slots for day:", error);
			throw new Error("Failed to get available time slots");
		}
	});

const bulkCreateAppointmentReminders = createServerFn({ method: "POST" })
	.validator(
		z.object({
			reminders: z.array(
				z.object({
					appointmentId: z.string(),
					appointmentDate: z.date(),
					reminderTimes: z.array(z.number()).optional()
				})
			)
		})
	)
	.handler(async ctx => {
		try {
			const { reminders } = ctx.data;
			const allReminders: Array<{
				id: string;
				appointmentId: string;
				method: string;
				sentAt: Date;
				status: string;
				createdAt: Date;
				updatedAt: Date;
			}> = [];

			for (const reminder of reminders) {
				const createdReminders = await calendarRepo.createAppointmentReminders(
					reminder.appointmentId,
					reminder.appointmentDate,
					reminder.reminderTimes
				);
				allReminders.push(...createdReminders);
			}

			return allReminders;
		} catch (error) {
			console.error("Error bulk creating appointment reminders:", error);
			throw new Error("Failed to create appointment reminders");
		}
	});

const getDoctorScheduleForMonth = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			year: z.number(),
			month: z.number() // 0-11
		})
	)
	.handler(async ctx => {
		try {
			const { doctorId, year, month } = ctx.data;

			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);
			endDate.setHours(23, 59, 59, 999);

			// Use repository for both working days and appointments
			const [workingDays, appointments] = await Promise.all([
				db.query.workingDay.findMany({
					where: {
						doctorId
					}
				}),
				db.query.appointment.findMany({
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
				})
			]);

			// Group appointments by date
			const appointmentsByDate = appointments.reduce(
				(acc, apt) => {
					const dateKey = apt.appointmentDate.toISOString().split("T")[0];
					if (!acc[dateKey]) {
						acc[dateKey] = [];
					}
					acc[dateKey].push(apt);
					return acc;
				},
				{} as Record<string, typeof appointments>
			);

			// Generate schedule for each day of the month
			const schedule: Array<{
				date: Date;
				isWorkingDay: boolean;
				workingHours: { start: string; end: string } | null;
				appointments: typeof appointments;
				appointmentCount: number;
			}> = [];
			for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
				const currentDate = new Date(d);
				const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

				const workingDay = workingDays.find(wd => wd.day === dayOfWeek);
				const dateKey = currentDate.toISOString().split("T")[0];
				const dayAppointments = appointmentsByDate[dateKey] || [];

				schedule.push({
					date: currentDate,
					isWorkingDay: !!workingDay,
					workingHours: workingDay
						? {
								start: workingDay.startTime,
								end: workingDay.endTime
							}
						: null,
					appointments: dayAppointments,
					appointmentCount: dayAppointments.length
				});
			}

			return schedule;
		} catch (error) {
			console.error("Error getting doctor schedule for month:", error);
			throw new Error("Failed to get doctor schedule");
		}
	});

const getConflictingAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			startDate: z.date(),
			endDate: z.date(),
			clinicId: z.string()
		})
	)
	.handler(async ctx => {
		try {
			const { doctorId, startDate, endDate, clinicId } = ctx.data;

			const appointments = await db.query.appointment.findMany({
				where: {
					doctorId,
					clinicId,
					isDeleted: false,
					appointmentDate: { gte: startDate, lte: endDate },
					status: { notIn: ["CANCELLED", "COMPLETED"] }
				},
				orderBy: { appointmentDate: "asc" }
			});

			// Find overlapping appointments
			const conflicts: Array<{
				appointment1: (typeof appointments)[0];
				appointment2: (typeof appointments)[0];
				overlapStart: Date;
				overlapEnd: Date;
			}> = [];
			for (let i = 0; i < appointments.length; i++) {
				const current = appointments[i];
				const currentStart = current.appointmentDate;
				const currentEnd = new Date(currentStart);
				currentEnd.setMinutes(currentEnd.getMinutes() + (current.durationMinutes || 30));

				for (let j = i + 1; j < appointments.length; j++) {
					const next = appointments[j];
					const nextStart = next.appointmentDate;
					const nextEnd = new Date(nextStart);
					nextEnd.setMinutes(nextEnd.getMinutes() + (next.durationMinutes || 30));

					if (currentStart < nextEnd && currentEnd > nextStart) {
						conflicts.push({
							appointment1: current,
							appointment2: next,
							overlapStart: new Date(Math.max(currentStart.getTime(), nextStart.getTime())),
							overlapEnd: new Date(Math.min(currentEnd.getTime(), nextEnd.getTime()))
						});
					}
				}
			}

			return conflicts;
		} catch (error) {
			console.error("Error finding conflicting appointments:", error);
			throw new Error("Failed to find conflicting appointments");
		}
	});

export {
	bulkCreateAppointmentReminders,
	checkSlotAvailability,
	createAppointmentReminders,
	getAvailableTimeSlotsForDay,
	type getBookedSlotsForDoctor,
	getConflictingAppointments,
	getDoctorScheduleForMonth,
	getDoctorWeeklySchedule,
	getDoctorWorkingHours
};
