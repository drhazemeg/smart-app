// db/repo/doctor.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { appointmentRepository } from "@/db/queries/appointment.repo";
import { doctorRepo } from "@/db/queries/doctor.repo";
import { DoctorCreateSchema, DoctorUpdateSchema, WorkingDaySchema } from "@/db/zod";

// =======================
// Schema Validators
// =======================

const doctorIdSchema = z.object({
	doctorId: z.string().min(1),
	clinicId: z.string().optional()
});

const doctorUserIdSchema = z.object({
	userId: z.string().min(1),
	clinicId: z.string().optional()
});

const listDoctorsSchema = z.object({
	clinicId: z.string(),
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0),
	search: z.string().optional(),
	specialty: z.string().optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
		.optional(),
	availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).optional()
});

const workingDayIdSchema = z.object({
	id: z.string(),
	clinicId: z.string().optional()
});

const doctorPerformanceSchema = z.object({
	doctorId: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	clinicId: z.string().optional()
});

const doctorScheduleSchema = z.object({
	doctorId: z.string(),
	clinicId: z.string().optional()
});

export const timeSlotsSchema = z.object({
	doctorId: z.string(),
	date: z.date(),
	durationMinutes: z.number().default(30)
});

const updateScheduleSchema = z.object({
	doctorId: z.string(),
	workingDays: z.array(WorkingDaySchema)
});

const bulkOperationSchema = z.object({
	ids: z.array(z.string()),
	data: DoctorCreateSchema.partial()
});

const workingDayBulkSchema = z.object({
	ids: z.array(z.string()),
	data: WorkingDaySchema.partial()
});

// =======================
// Doctor Queries - Using doctorRepo directly
// =======================

export const getDoctorById = createServerFn({ method: "GET" })
	.validator(doctorIdSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId } = data;
			return await doctorRepo.getDoctorById(doctorId, clinicId);
		} catch (error) {
			console.error("Error getting doctor by ID:", error);
			throw new Error("Failed to get doctor");
		}
	});

export const getDoctorByUserId = createServerFn({ method: "GET" })
	.validator(doctorUserIdSchema)
	.handler(async ({ data }) => {
		try {
			const { userId, clinicId } = data;
			return await doctorRepo.getDoctorByUserId(userId, clinicId);
		} catch (error) {
			console.error("Error getting doctor by user ID:", error);
			throw new Error("Failed to get doctor");
		}
	});
export const getDoctorAvailability = createServerFn({ method: "GET" })
	.validator(z.object({ doctorId: z.string(), date: z.date() }))
	.handler(async ({ data }) => {
		try {
			const { doctorId, date } = data;
			return await doctorRepo.getDoctorAvailability(doctorId, date);
		} catch (error) {
			console.error("Error getting doctor availability:", error);
			throw new Error("Failed to get doctor availability");
		}
	});
// export const getAvailableTimeSlots = createServerFn({ method: "GET" })
// 	.validator(
// 		z.object({
// 			doctorId: z.string(),
// 			date: z.date(),
// 			durationMinutes: z.number().default(30)
// 		})
// 	)
// 	.handler(async ({ data }) => {
// 		try {
// 			const { doctorId, date, durationMinutes } = data;
// 			return await doctorRepo.getAvailableTimeSlots(doctorId, date, durationMinutes);
// 		} catch (error) {
// 			console.error("Error getting available time slots:", error);
// 			throw new Error("Failed to get available time slots");
// 		}
// 	});

export const listDoctors = createServerFn({ method: "GET" })
	.validator(listDoctorsSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, limit, offset, search, specialty, status, availabilityStatus } = data;
			return await doctorRepo.listDoctors({
				clinicId,
				limit,
				offset,
				search,
				specialty,
				status,
				availabilityStatus
			});
		} catch (error) {
			console.error("Error listing doctors:", error);
			throw new Error("Failed to list doctors");
		}
	});

// =======================
// Doctor CRUD Operations
// =======================

export const createDoctor = createServerFn({ method: "POST" })
	.validator(DoctorCreateSchema)
	.handler(async ({ data }) => {
		try {
			return await doctorRepo.createDoctor({
				...data,
				id: data.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			});
		} catch (error) {
			console.error("Error creating doctor:", error);
			throw new Error("Failed to create doctor");
		}
	});

export const updateDoctor = createServerFn({ method: "POST" })
	.validator(DoctorUpdateSchema)
	.handler(async ({ data }) => {
		try {
			const { id, ...updateData } = data;
			return await doctorRepo.updateDoctor(id ?? "", updateData);
		} catch (error) {
			console.error("Error updating doctor:", error);
			throw new Error("Failed to update doctor");
		}
	});

export const upsertDoctor = createServerFn({ method: "POST" })
	.validator(DoctorCreateSchema)
	.handler(async ({ data }) => {
		try {
			return await doctorRepo.upsertDoctor(data);
		} catch (error) {
			console.error("Error upserting doctor:", error);
			throw new Error("Failed to upsert doctor");
		}
	});

export const softDeleteDoctor = createServerFn({ method: "POST" })
	.validator(doctorIdSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId } = data;
			return await doctorRepo.softDeleteDoctor(doctorId, clinicId);
		} catch (error) {
			console.error("Error soft deleting doctor:", error);
			throw new Error("Failed to delete doctor");
		}
	});

export const deleteDoctor = createServerFn({ method: "POST" })
	.validator(doctorIdSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId } = data;
			return await doctorRepo.deleteDoctor(doctorId, clinicId);
		} catch (error) {
			console.error("Error deleting doctor:", error);
			throw new Error("Failed to delete doctor");
		}
	});

export const restoreDoctor = createServerFn({ method: "POST" })
	.validator(z.object({ doctorId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { doctorId } = data;
			return await doctorRepo.restoreDoctor(doctorId);
		} catch (error) {
			console.error("Error restoring doctor:", error);
			throw new Error("Failed to restore doctor");
		}
	});

export const createManyDoctors = createServerFn({ method: "POST" })
	.validator(z.object({ doctors: z.array(DoctorCreateSchema) }))
	.handler(async ({ data }) => {
		try {
			const { doctors } = data;
			const doctorsWithIds = doctors.map(doctor => ({
				...doctor,
				id: doctor.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			}));
			return await doctorRepo.createManyDoctors(doctorsWithIds);
		} catch (error) {
			console.error("Error creating many doctors:", error);
			throw new Error("Failed to create doctors");
		}
	});

export const updateManyDoctors = createServerFn({ method: "POST" })
	.validator(bulkOperationSchema)
	.handler(async ({ data }) => {
		try {
			const { ids, data: updateData } = data;
			return await doctorRepo.updateManyDoctors(ids, updateData);
		} catch (error) {
			console.error("Error updating many doctors:", error);
			throw new Error("Failed to update doctors");
		}
	});

// =======================
// Working Days Operations
// =======================

export const getWorkingDays = createServerFn({ method: "GET" })
	.validator(z.object({ doctorId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { doctorId } = data;
			return await doctorRepo.getWorkingDays(doctorId);
		} catch (error) {
			console.error("Error getting working days:", error);
			throw new Error("Failed to get working days");
		}
	});

export const createWorkingDay = createServerFn({ method: "POST" })
	.validator(WorkingDaySchema)
	.handler(async ({ data }) => {
		try {
			return await doctorRepo.createWorkingDay({
				...data,
				id: data.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} catch (error) {
			console.error("Error creating working day:", error);
			throw new Error("Failed to create working day");
		}
	});

export const updateWorkingDay = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: WorkingDaySchema.partial() }))
	.handler(async ({ data }) => {
		try {
			const { id, data: updateData } = data;
			return await doctorRepo.updateWorkingDay(id, updateData);
		} catch (error) {
			console.error("Error updating working day:", error);
			throw new Error("Failed to update working day");
		}
	});

export const deleteWorkingDay = createServerFn({ method: "POST" })
	.validator(workingDayIdSchema)
	.handler(async ({ data }) => {
		try {
			const { id, clinicId } = data;
			return await doctorRepo.deleteWorkingDay(id, clinicId);
		} catch (error) {
			console.error("Error deleting working day:", error);
			throw new Error("Failed to delete working day");
		}
	});

export const replaceWorkingDays = createServerFn({ method: "POST" })
	.validator(z.object({ doctorId: z.string(), workingDays: z.array(WorkingDaySchema) }))
	.handler(async ({ data }) => {
		try {
			const { doctorId, workingDays } = data;
			return await doctorRepo.replaceWorkingDays(doctorId, workingDays);
		} catch (error) {
			console.error("Error replacing working days:", error);
			throw new Error("Failed to replace working days");
		}
	});

export const createManyWorkingDays = createServerFn({ method: "POST" })
	.validator(z.object({ workingDays: z.array(WorkingDaySchema) }))
	.handler(async ({ data }) => {
		try {
			const { workingDays } = data;
			const workingDaysWithIds = workingDays.map(day => ({
				...day,
				id: day.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await doctorRepo.createManyWorkingDays(workingDaysWithIds);
		} catch (error) {
			console.error("Error creating many working days:", error);
			throw new Error("Failed to create working days");
		}
	});

export const updateManyWorkingDays = createServerFn({ method: "POST" })
	.validator(workingDayBulkSchema)
	.handler(async ({ data }) => {
		try {
			const { ids, data: updateData } = data;
			return await doctorRepo.updateManyWorkingDays(ids, updateData);
		} catch (error) {
			console.error("Error updating many working days:", error);
			throw new Error("Failed to update working days");
		}
	});

// =======================
// Doctor Performance
// =======================

export const getDoctorPerformance = createServerFn({ method: "GET" })
	.validator(doctorPerformanceSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, startDate, endDate, clinicId } = data;
			return await doctorRepo.getDoctorPerformance(doctorId, startDate, endDate, clinicId);
		} catch (error) {
			console.error("Error getting doctor performance:", error);
			throw new Error("Failed to get doctor performance");
		}
	});

// =======================
// Doctor Availability & Schedule
// =======================

// export const getDoctorAvailability = createServerFn({ method: "GET" })
// 	.validator(doctorAvailabilitySchema)
// 	.handler(async ({ data }) => {
// 		try {
// 			const { doctorId, date } = data;
// 			return await doctorRepo.getDoctorAvailability(doctorId, date);
// 		} catch (error) {
// 			console.error("Error getting doctor availability:", error);
// 			throw new Error("Failed to get doctor availability");
// 		}
// 	});

export const getDoctorWithSchedule = createServerFn({ method: "GET" })
	.validator(doctorScheduleSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId } = data;
			return await doctorRepo.getDoctorWithSchedule(doctorId, clinicId);
		} catch (error) {
			console.error("Error getting doctor with schedule:", error);
			throw new Error("Failed to get doctor schedule");
		}
	});

// export const getAvailableTimeSlots = createServerFn({ method: "GET" })
// 	.validator(timeSlotsSchema)
// 	.handler(async ({ data }) => {
// 		try {
// 			const { doctorId, date, durationMinutes } = data;
// 			return await doctorRepo.getAvailableTimeSlots(doctorId, date, durationMinutes);
// 		} catch (error) {
// 			console.error("Error getting available time slots:", error);
// 			throw new Error("Failed to get available time slots");
// 		}
// 	});

export const updateDoctorSchedule = createServerFn({ method: "POST" })
	.validator(updateScheduleSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, workingDays } = data;
			return await doctorRepo.updateDoctorSchedule(doctorId, workingDays);
		} catch (error) {
			console.error("Error updating doctor schedule:", error);
			throw new Error("Failed to update doctor schedule");
		}
	});

// =======================
// Additional Utility Functions
// =======================

export const getDoctorWithFullDetails = createServerFn({ method: "GET" })
	.validator(doctorIdSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId } = data;
			const doctor = await doctorRepo.getDoctorById(doctorId, clinicId);
			if (!doctor) {
				return null;
			}

			const workingDays = await doctorRepo.getWorkingDays(doctorId);
			const availability = await doctorRepo.getDoctorAvailability(doctorId, new Date());

			return {
				...doctor,
				workingDays,
				availability
			};
		} catch (error) {
			console.error("Error getting doctor with full details:", error);
			throw new Error("Failed to get doctor details");
		}
	});

export const getDoctorStatistics = createServerFn({ method: "GET" })
	.validator(z.object({ doctorId: z.string(), clinicId: z.string().optional() }))
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId } = data;
			const doctor = await doctorRepo.getDoctorById(doctorId, clinicId);
			if (!doctor) {
				return null;
			}

			const workingDays = await doctorRepo.getWorkingDays(doctorId);

			// Get appointment stats
			const today = new Date();
			const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
			const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

			const performance = await doctorRepo.getDoctorPerformance(doctorId, startOfMonth, endOfMonth, clinicId);

			return {
				doctor,
				workingDays,
				performance,
				totalWorkingDays: workingDays.length,
				isAvailable: workingDays.some(day => day.isActive)
			};
		} catch (error) {
			console.error("Error getting doctor statistics:", error);
			throw new Error("Failed to get doctor statistics");
		}
	});

export const getDoctorsBySpecialty = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), specialty: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { clinicId, specialty } = data;
			const result = await doctorRepo.listDoctors({
				clinicId,
				specialty,
				limit: 100,
				offset: 0
			});
			return result.doctors;
		} catch (error) {
			console.error("Error getting doctors by specialty:", error);
			throw new Error("Failed to get doctors by specialty");
		}
	});

export const getAvailableDoctors = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), date: z.date().optional() }))
	.handler(async ({ data }) => {
		try {
			const { clinicId, date = new Date() } = data;
			const result = await doctorRepo.listDoctors({
				clinicId,
				availabilityStatus: "AVAILABLE",
				limit: 100,
				offset: 0
			});

			// Filter doctors who are working on the given date
			const availableDoctors = [] as Array<
				(typeof result.doctors)[number] & {
					workingDay?: Awaited<ReturnType<typeof doctorRepo.getWorkingDays>>[number];
				}
			>;
			for (const doctor of result.doctors) {
				const workingDays = await doctorRepo.getWorkingDays(doctor.id);
				const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
				const isWorking = workingDays.some(day => day.day === dayOfWeek && day.isActive);
				if (isWorking) {
					availableDoctors.push({
						...doctor,
						workingDay: workingDays.find(day => day.day === dayOfWeek)
					});
				}
			}

			return availableDoctors;
		} catch (error) {
			console.error("Error getting available doctors:", error);
			throw new Error("Failed to get available doctors");
		}
	});

export const getDoctorUpcomingAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			startDate: z.date(),
			endDate: z.date().optional(),
			limit: z.number().default(10),
			offset: z.number().default(0)
		})
	)
	.handler(async ({ data }) => {
		try {
			const { doctorId, startDate, endDate } = data;
			return await appointmentRepository.getDoctorAppointments(doctorId, startDate, endDate);
		} catch (error) {
			console.error("Error getting doctor upcoming appointments:", error);
			throw new Error("Failed to get upcoming appointments");
		}
	});
