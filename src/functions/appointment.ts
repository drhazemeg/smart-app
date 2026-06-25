import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { appointmentRepository } from "@/db/queries/appointment.repo";
import { AppointmentCreateSchema, AppointmentUpdateSchema } from "@/db/zod";
import { getSession } from "./get-user";

const appointmentIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const bulkStatusSchema = z.object({
	appointmentIds: z.array(z.string()),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
});

const dateRangeSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	doctorId: z.string().optional()
});

const statusFilterSchema = z.object({
	clinicId: z.string(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
});

const monthlyDataSchema = z.object({
	clinicId: z.string(),
	year: z.number()
});

const appointmentsFilterSchema = z.object({
	clinicId: z.string(),
	filters: z.object({
		status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
		startDate: z.date().optional(),
		endDate: z.date().optional(),
		doctorId: z.string().optional(),
		patientId: z.string().optional(),
		type: z.string().optional(),
		search: z.string().optional()
	}),
	pagination: z.object({
		limit: z.number(),
		offset: z.number()
	})
});

const checkAvailabilitySchema = z.object({
	doctorId: z.string(),
	appointmentDate: z.date(),
	durationMinutes: z.number(),
	clinicId: z.string(),
	excludeId: z.string().optional()
});

const cancelAppointmentSchema = z.object({
	appointmentId: z.string(),
	clinicId: z.string(),
	reason: z.string()
});

const paginationSchema = z.object({
	clinicId: z.string(),
	page: z.number(),
	limit: z.number(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
	doctorId: z.string().optional(),
	patientId: z.string().optional()
});

// const createWithReminderSchema = z.object({
//  data: createAppointmentSchema.shape.data,
//  reminderData: z
//    .object({
//      method: z.enum(["SMS", "EMAIL", "PUSH", "CALL"]),
//      sentAt: z.date()
//    })
//    .optional()
// });

const rescheduleSchema = z.object({
	appointmentId: z.string(),
	newDate: z.date(),
	newTime: z.string(),
	reason: z.string().optional()
});

const patientAppointmentsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	pagination: z.object({
		page: z.number(),
		limit: z.number()
	}),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
});

const doctorAppointmentsRangeSchema = z.object({
	doctorId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const updateWithNoteSchema = z.object({
	id: z.string(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
	note: z.string().optional()
});

const listAppointmentsSchema = z.object({
	clinicId: z.string(),
	page: z.number(),
	limit: z.number(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	search: z.string().optional()
});

const upcomingAppointmentsSchema = z.object({
	clinicId: z.string(),
	limit: z.number().optional(),
	patientIds: z.array(z.string()).optional(),
	doctorId: z.string().optional()
});

const appointmentStatsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const doctorAppointmentStatsSchema = z.object({
	doctorId: z.string(),
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const appointmentRemindersSchema = z.object({
	clinicId: z.string(),
	hoursBefore: z.number().optional()
});

const upcomingPatientAppointmentsSchema = z.object({
	patientId: z.string(),
	limit: z.number().optional()
});

// =======================
// Server Functions - Using appointmentRepository directly
// =======================
// Get upcoming appointments count for header badge
export const getAppointmentsCount = createServerFn({ method: "GET" }).handler(async () => {
	const session = await getSession();
	if (!session) {
		return { count: 0 };
	}

	const count = await appointmentRepository.getAppointmentCount(session.user.id, session.user.role);
	return { count };
});
const getAppointmentById = createServerFn({ method: "GET" })
	.validator(appointmentIdSchema)
	.handler(async ({ data }) => {
		try {
			const { id, clinicId } = data;
			return await appointmentRepository.getAppointmentById(id, clinicId);
		} catch (error) {
			console.error("Error getting appointment by ID:", error);
			throw new Error("Failed to get appointment");
		}
	});

const createAppointment = createServerFn({ method: "POST" })
	.validator(AppointmentCreateSchema)
	.handler(async ({ data }) => {
		try {
			return await appointmentRepository.createAppointment(data);
		} catch (error) {
			console.error("Error creating appointment:", error);
			throw new Error("Failed to create appointment");
		}
	});

const updateAppointment = createServerFn({ method: "POST" })
	.validator(AppointmentUpdateSchema)
	.handler(async ({ data }) => {
		try {
			const { id, ...updateData } = data;
			return await appointmentRepository.updateAppointment(id ?? "", updateData);
		} catch (error) {
			console.error("Error updating appointment:", error);
			throw new Error("Failed to update appointment");
		}
	});

const softDeleteAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;
			return await appointmentRepository.softDeleteAppointment(id);
		} catch (error) {
			console.error("Error soft deleting appointment:", error);
			throw new Error("Failed to delete appointment");
		}
	});

const bulkUpdateAppointmentStatus = createServerFn({ method: "POST" })
	.validator(bulkStatusSchema)
	.handler(async ({ data }) => {
		try {
			const { appointmentIds, status } = data;
			return await appointmentRepository.bulkUpdateAppointmentStatus(appointmentIds, status);
		} catch (error) {
			console.error("Error bulk updating appointment status:", error);
			throw new Error("Failed to bulk update appointment status");
		}
	});

const getAppointmentsInRange = createServerFn({ method: "GET" })
	.validator(dateRangeSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate, doctorId } = data;
			return await appointmentRepository.getAppointmentsInRange(clinicId, startDate, endDate, doctorId);
		} catch (error) {
			console.error("Error getting appointments in range:", error);
			throw new Error("Failed to get appointments in range");
		}
	});

const getAppointmentsByStatus = createServerFn({ method: "GET" })
	.validator(statusFilterSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, status } = data;
			return await appointmentRepository.getAppointmentsByStatus(clinicId, status);
		} catch (error) {
			console.error("Error getting appointments by status:", error);
			throw new Error("Failed to get appointments by status");
		}
	});

const getAppointmentsFallback = createServerFn({ method: "GET" })
	.validator(dateRangeSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate, doctorId } = data;
			return await appointmentRepository.getAppointmentsFallback(clinicId, startDate, endDate, doctorId);
		} catch (error) {
			console.error("Error in fallback appointment fetch:", error);
			throw new Error("Failed to fetch appointments");
		}
	});

// const getAppointmentCountsByStatus = createServerFn({ method: "GET" })
//  .validator(z.object({ clinicId: z.string() }))
//  .handler(async ({ data }) => {
//    try {
//      const { clinicId } = data;
//      return await appointmentRepository.getAppointmentCountsByStatus(clinicId);
//    } catch (error) {
//      console.error("Error getting appointment counts:", error);
//      throw new Error("Failed to get appointment counts");
//    }
//  });

// const getDoctorAvailability = createServerFn({ method: "GET" })
//  .validator(z.object({ doctorId: z.string(), date: z.date() }))
//  .handler(async ({ data }) => {
//    try {
//      const { doctorId, date } = data;
//      return await appointmentRepository.getDoctorAvailability(doctorId, date);
//    } catch (error) {
//      console.error("Error getting doctor availability:", error);
//      throw new Error("Failed to get doctor availability");
//    }
//  });

const getAvailableTimeSlots = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			date: z.date(),
			durationMinutes: z.number().optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { doctorId, date, durationMinutes = 30 } = data;
			return await appointmentRepository.getAvailableTimeSlots(doctorId, date, durationMinutes);
		} catch (error) {
			console.error("Error getting available time slots:", error);
			throw new Error("Failed to get available time slots");
		}
	});

const getMonthlyAppointmentData = createServerFn({ method: "GET" })
	.validator(monthlyDataSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, year } = data;
			return await appointmentRepository.getMonthlyAppointmentData(clinicId, year);
		} catch (error) {
			console.error("Error getting monthly appointment data:", error);
			throw new Error("Failed to get monthly appointment data");
		}
	});

const getAppointmentsWithFilters = createServerFn({ method: "POST" })
	.validator(appointmentsFilterSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, filters, pagination } = data;
			return await appointmentRepository.getAppointmentsWithFilters(clinicId, filters, pagination);
		} catch (error) {
			console.error("Error getting appointments with filters:", error);
			throw new Error("Failed to get appointments with filters");
		}
	});

const checkTimeSlotAvailability = createServerFn({ method: "POST" })
	.validator(checkAvailabilitySchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, appointmentDate, durationMinutes, clinicId, excludeId } = data;
			return await appointmentRepository.checkTimeSlotAvailability(
				doctorId,
				appointmentDate,
				durationMinutes,
				clinicId,
				excludeId
			);
		} catch (error) {
			console.error("Error checking time slot availability:", error);
			throw new Error("Failed to check time slot availability");
		}
	});

const validateAppointment = createServerFn({ method: "GET" })
	.validator(z.object({ appointmentId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { appointmentId } = data;
			return await appointmentRepository.validateAppointment(appointmentId);
		} catch (error) {
			console.error("Error validating appointment:", error);
			throw new Error("Failed to validate appointment");
		}
	});

const cancelAppointment = createServerFn({ method: "POST" })
	.validator(cancelAppointmentSchema)
	.handler(async ({ data }) => {
		try {
			const { appointmentId, clinicId, reason } = data;
			return await appointmentRepository.cancelAppointment(appointmentId, clinicId, reason);
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			throw new Error("Failed to cancel appointment");
		}
	});

const getAllAppointments = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await appointmentRepository.getAllAppointments(clinicId);
		} catch (error) {
			console.error("Error getting all appointments:", error);
			throw new Error("Failed to get appointments");
		}
	});

const getAppointmentsFallbackPaginated = createServerFn({ method: "GET" })
	.validator(paginationSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, page, limit, status, doctorId, patientId } = data;
			return await appointmentRepository.getAppointmentsFallbackPaginated(
				clinicId,
				page,
				limit,
				status,
				doctorId,
				patientId
			);
		} catch (error) {
			console.error("Error in fallback paginated appointments:", error);
			throw new Error("Failed to fetch paginated appointments");
		}
	});

const getAppointmentByIdFallback = createServerFn({ method: "GET" })
	.validator(appointmentIdSchema)
	.handler(async ({ data }) => {
		try {
			const { id, clinicId } = data;
			return await appointmentRepository.getAppointmentByIdFallback(id, clinicId);
		} catch (error) {
			console.error("Error in fallback appointment fetch:", error);
			throw new Error("Failed to fetch appointment");
		}
	});

const updateAppointmentStatus = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
		})
	)
	.handler(async ({ data }) => {
		try {
			const { id, status } = data;
			return await appointmentRepository.updateAppointmentStatus(id, status);
		} catch (error) {
			console.error("Error updating appointment status:", error);
			throw new Error("Failed to update appointment status");
		}
	});

const createManyAppointments = createServerFn({ method: "POST" })
	.validator(z.object({ data: z.array(AppointmentCreateSchema) }))
	.handler(async ({ data }) => {
		try {
			return await appointmentRepository.createManyAppointments(data.data);
		} catch (error) {
			console.error("Error creating many appointments:", error);
			throw new Error("Failed to create multiple appointments");
		}
	});

const updateManyAppointments = createServerFn({ method: "POST" })
	.validator(
		z.object({
			ids: z.array(z.string()),
			data: z.object({
				status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
				appointmentDate: z.date().optional(),
				time: z.string().optional(),
				durationMinutes: z.number().optional(),
				appointmentPrice: z.number().optional(),
				type: z.string().optional(),
				note: z.string().optional(),
				reason: z.string().optional()
			})
		})
	)
	.handler(async ({ data }) => {
		try {
			const { ids, data: updateData } = data;
			return await appointmentRepository.updateManyAppointments(ids, updateData);
		} catch (error) {
			console.error("Error updating many appointments:", error);
			throw new Error("Failed to update multiple appointments");
		}
	});

const deleteAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;
			return await appointmentRepository.deleteAppointment(id);
		} catch (error) {
			console.error("Error deleting appointment:", error);
			throw new Error("Failed to delete appointment");
		}
	});

const rescheduleAppointment = createServerFn({ method: "POST" })
	.validator(rescheduleSchema)
	.handler(async ({ data }) => {
		try {
			const { appointmentId, newDate, newTime, reason } = data;
			return await appointmentRepository.rescheduleAppointment(appointmentId, newDate, newTime, reason);
		} catch (error) {
			console.error("Error rescheduling appointment:", error);
			throw new Error("Failed to reschedule appointment");
		}
	});

const restoreAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;
			return await appointmentRepository.restoreAppointment(id);
		} catch (error) {
			console.error("Error restoring appointment:", error);
			throw new Error("Failed to restore appointment");
		}
	});

const getAppointmentsWithPagination = createServerFn({ method: "POST" })
	.validator(
		z.object({
			clinicId: z.string(),
			pagination: z.object({ page: z.number(), limit: z.number() }),
			filters: z
				.object({
					status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
					fromDate: z.date().optional(),
					toDate: z.date().optional(),
					patientId: z.string().optional(),
					doctorId: z.string().optional(),
					search: z.string().optional()
				})
				.optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, pagination, filters } = data;
			return await appointmentRepository.getAppointmentsWithPagination(clinicId, pagination, filters);
		} catch (error) {
			console.error("Error getting appointments with pagination:", error);
			throw new Error("Failed to get paginated appointments");
		}
	});

const getPatientAppointments = createServerFn({ method: "GET" })
	.validator(patientAppointmentsSchema)
	.handler(async ({ data }) => {
		try {
			const { patientId, clinicId, pagination, status } = data;
			return await appointmentRepository.getPatientAppointments(patientId, clinicId, pagination, status);
		} catch (error) {
			console.error("Error getting patient appointments:", error);
			throw new Error("Failed to get patient appointments");
		}
	});

const getDoctorAppointmentsInRange = createServerFn({ method: "GET" })
	.validator(doctorAppointmentsRangeSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, startDate, endDate } = data;
			return await appointmentRepository.getDoctorAppointmentsInRange(doctorId, startDate, endDate);
		} catch (error) {
			console.error("Error getting doctor appointments in range:", error);
			throw new Error("Failed to get doctor appointments");
		}
	});

const getBookedSlotsForDoctor = createServerFn({ method: "GET" })
	.validator(z.object({ doctorId: z.string(), date: z.date() }))
	.handler(async ({ data }) => {
		try {
			const { doctorId, date } = data;
			return await appointmentRepository.getBookedSlotsForDoctor(doctorId, date);
		} catch (error) {
			console.error("Error getting booked slots:", error);
			throw new Error("Failed to get booked slots");
		}
	});

const updateAppointmentWithNote = createServerFn({ method: "POST" })
	.validator(updateWithNoteSchema)
	.handler(async ({ data }) => {
		try {
			const { id, status, note } = data;
			return await appointmentRepository.updateAppointmentWithNote(id, status, note);
		} catch (error) {
			console.error("Error updating appointment with note:", error);
			throw new Error("Failed to update appointment");
		}
	});

const listAppointments = createServerFn({ method: "POST" })
	.validator(listAppointmentsSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, page, limit, status, patientId, doctorId, startDate, endDate, search } = data;
			return await appointmentRepository.listAppointments({
				clinicId,
				page,
				limit,
				status,
				patientId,
				doctorId,
				startDate,
				endDate,
				search
			});
		} catch (error) {
			console.error("Error listing appointments:", error);
			throw new Error("Failed to list appointments");
		}
	});

const getUpcomingAppointments = createServerFn({ method: "GET" })
	.validator(upcomingAppointmentsSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, limit, patientIds, doctorId } = data;
			return await appointmentRepository.getUpcomingAppointments({
				clinicId,
				limit,
				patientIds,
				doctorId
			});
		} catch (error) {
			console.error("Error getting upcoming appointments:", error);
			throw new Error("Failed to get upcoming appointments");
		}
	});

const getUpcomingAppointmentsCount = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			patientIds: z.array(z.string()).optional(),
			doctorId: z.string().optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, patientIds, doctorId } = data;
			return await appointmentRepository.getUpcomingAppointmentsCount({
				clinicId,
				patientIds,
				doctorId
			});
		} catch (error) {
			console.error("Error getting upcoming appointments count:", error);
			throw new Error("Failed to get upcoming appointments count");
		}
	});

const getDoctorAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			startDate: z.date().optional(),
			endDate: z.date().optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { doctorId, startDate, endDate } = data;
			return await appointmentRepository.getDoctorAppointments(doctorId, startDate, endDate);
		} catch (error) {
			console.error("Error getting doctor appointments:", error);
			throw new Error("Failed to get doctor appointments");
		}
	});

const isTimeSlotAvailable = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			date: z.date(),
			time: z.string()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { doctorId, date, time } = data;
			return await appointmentRepository.isTimeSlotAvailable({
				doctorId,
				date,
				time
			});
		} catch (error) {
			console.error("Error checking time slot availability:", error);
			throw new Error("Failed to check time slot availability");
		}
	});

const getUpcomingCount = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			patientIds: z.array(z.string()).optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, patientIds } = data;
			return await appointmentRepository.getUpcomingCount(clinicId, patientIds);
		} catch (error) {
			console.error("Error getting upcoming count:", error);
			throw new Error("Failed to get upcoming count");
		}
	});

const findManyByClinic = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			limit: z.number().optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, limit = 5 } = data;
			return await appointmentRepository.findManyByClinic(clinicId, limit);
		} catch (error) {
			console.error("Error finding appointments by clinic:", error);
			throw new Error("Failed to find appointments by clinic");
		}
	});

const getAppointmentsByDateRange = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			startDate: z.date(),
			endDate: z.date(),
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate, status } = data;
			return await appointmentRepository.getAppointmentsByDateRange({
				clinicId,
				startDate,
				endDate,
				status
			});
		} catch (error) {
			console.error("Error getting appointments by date range:", error);
			throw new Error("Failed to get appointments by date range");
		}
	});

const getAppointmentsByDate = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			date: z.date(),
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, date, status } = data;
			return await appointmentRepository.getAppointmentsByDate({
				clinicId,
				date,
				status
			});
		} catch (error) {
			console.error("Error getting appointments by date:", error);
			throw new Error("Failed to get appointments by date");
		}
	});

const getAppointmentStats = createServerFn({ method: "GET" })
	.validator(appointmentStatsSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			return await appointmentRepository.getAppointmentStats({
				clinicId,
				startDate,
				endDate
			});
		} catch (error) {
			console.error("Error getting appointment stats:", error);
			throw new Error("Failed to get appointment stats");
		}
	});

const getDoctorAppointmentStats = createServerFn({ method: "GET" })
	.validator(doctorAppointmentStatsSchema)
	.handler(async ({ data }) => {
		try {
			const { doctorId, clinicId, startDate, endDate } = data;
			return await appointmentRepository.getDoctorAppointmentStats({
				doctorId,
				clinicId,
				startDate,
				endDate
			});
		} catch (error) {
			console.error("Error getting doctor appointment stats:", error);
			throw new Error("Failed to get doctor appointment stats");
		}
	});

const getAppointmentsRequiringReminders = createServerFn({ method: "GET" })
	.validator(appointmentRemindersSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, hoursBefore } = data;
			return await appointmentRepository.getAppointmentsRequiringReminders({
				clinicId,
				hoursBefore
			});
		} catch (error) {
			console.error("Error getting appointments requiring reminders:", error);
			throw new Error("Failed to get appointments requiring reminders");
		}
	});

const getUpcomingPatientAppointments = createServerFn({ method: "GET" })
	.validator(upcomingPatientAppointmentsSchema)
	.handler(async ({ data }) => {
		try {
			const { patientId, limit } = data;
			return await appointmentRepository.getUpcomingPatientAppointments(patientId, limit);
		} catch (error) {
			console.error("Error getting upcoming patient appointments:", error);
			throw new Error("Failed to get upcoming patient appointments");
		}
	});

// Convenience functions that compose existing ones
const getAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			pagination: z.object({ page: z.number(), limit: z.number() }),
			filters: z
				.object({
					status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
					fromDate: z.date().optional(),
					toDate: z.date().optional(),
					patientId: z.string().optional(),
					doctorId: z.string().optional(),
					search: z.string().optional()
				})
				.optional()
		})
	)
	.handler(async ({ data }) => getAppointmentsWithPagination({ data }));

const getTodaysAppointments = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ({ data }) => {
		const { clinicId } = data;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return await getAppointmentsWithPagination({
			data: {
				clinicId,
				pagination: { page: 1, limit: 100 },
				filters: {
					fromDate: today,
					toDate: tomorrow
				}
			}
		});
	});
const getAppointmentCountsByStatus = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await appointmentRepository.getAppointmentCountsByStatus(clinicId);
		} catch (error) {
			console.error("Error getting appointment counts by status:", error);
			throw new Error("Failed to get appointment counts by status");
		}
	});
const getAppointmentStatistics = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ({ data }) => {
		const { clinicId } = data;
		const counts = await getAppointmentCountsByStatus({ data: { clinicId } });
		const appointments = await getAllAppointments({ data: { clinicId } });

		const totalRevenue = appointments?.reduce((sum, apt) => sum + (apt.appointmentPrice ?? 0), 0) || 0;

		return {
			counts: {
				PENDING: counts?.PENDING || 0,
				CONFIRMED: counts?.CONFIRMED || 0,
				COMPLETED: counts?.COMPLETED || 0,
				CANCELLED: counts?.CANCELLED || 0,
				NO_SHOW: counts?.NO_SHOW || 0
			},
			totalAppointments: appointments?.length || 0,
			totalRevenue
		};
	});

const completeAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), notes: z.string().optional() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;
			return await appointmentRepository.updateAppointmentStatus(id, "COMPLETED");
		} catch (error) {
			console.error("Error completing appointment:", error);
			throw new Error("Failed to complete appointment");
		}
	});

const createMedicalRecordWithEncounterSchema = z.object({
	patientId: z.string(),
	doctorId: z.string(),
	clinicId: z.string(),
	appointmentId: z.string(),
	diagnosis: z.string(),
	symptoms: z.string(),
	treatmentPlan: z.string(),
	vitalSign: z
		.object({
			bodyTemperature: z.number().optional(),
			systolic: z.number().optional(),
			diastolic: z.number().optional(),
			heartRate: z.number().optional(),
			weight: z.number().optional(),
			height: z.number().optional()
		})
		.optional(),
	prescriptions: z
		.array(
			z.object({
				medicationName: z.string(),
				dosageValue: z.number(),
				dosageUnit: z.string(),
				frequency: z.string(),
				duration: z.string()
			})
		)
		.optional()
});

const createMedicalRecordWithEncounter = createServerFn({ method: "POST" })
	.validator(createMedicalRecordWithEncounterSchema)
	.handler(async ({ data }) => {
		try {
			return await appointmentRepository.createMedicalRecordWithEncounter(data);
		} catch (error) {
			console.error("Error creating medical record with encounter:", error);
			throw new Error("Failed to create medical record with encounter");
		}
	});

export {
	bulkUpdateAppointmentStatus,
	cancelAppointment,
	checkTimeSlotAvailability,
	completeAppointment,
	createAppointment,
	createManyAppointments,
	createMedicalRecordWithEncounter,
	deleteAppointment,
	findManyByClinic,
	getAllAppointments,
	getAppointmentById,
	getAppointmentByIdFallback,
	getAppointmentCountsByStatus,
	getAppointmentStatistics,
	getAppointmentStats,
	getAppointments,
	getAppointmentsByDate,
	getAppointmentsByDateRange,
	getAppointmentsByStatus,
	getAppointmentsFallback,
	getAppointmentsFallbackPaginated,
	getAppointmentsInRange,
	getAppointmentsRequiringReminders,
	getAppointmentsWithFilters,
	getAppointmentsWithPagination,
	getAvailableTimeSlots,
	getBookedSlotsForDoctor,
	getDoctorAppointmentStats,
	getDoctorAppointments,
	getDoctorAppointmentsInRange,
	getMonthlyAppointmentData,
	getPatientAppointments,
	getTodaysAppointments,
	getUpcomingAppointments,
	getUpcomingAppointmentsCount,
	getUpcomingCount,
	getUpcomingPatientAppointments,
	isTimeSlotAvailable,
	listAppointments,
	rescheduleAppointment,
	restoreAppointment,
	softDeleteAppointment,
	updateAppointment,
	updateAppointmentStatus,
	updateAppointmentWithNote,
	updateManyAppointments,
	validateAppointment
};
