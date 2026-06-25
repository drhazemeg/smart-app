// ============================================================
// Appointment Service — Data Access Layer
// ============================================================

import {
	bulkUpdateAppointmentStatus as bulkUpdateAppointmentStatusFn,
	cancelAppointment as cancelAppointmentFn,
	checkTimeSlotAvailability as checkTimeSlotAvailabilityFn,
	createAppointment as createAppointmentFn,
	getAllAppointments,
	getAppointmentById as getAppointmentByIdFn,
	getAppointmentCountsByStatus as getAppointmentCountsByStatusFn,
	getAppointmentsWithPagination,
	rescheduleAppointment as rescheduleAppointmentFn,
	restoreAppointment as restoreAppointmentFn,
	softDeleteAppointment as softDeleteAppointmentFn,
	updateAppointment as updateAppointmentFn,
	updateAppointmentStatus as updateAppointmentStatusFn
} from "@/functions/appointment";
import type { AppointmentStatus } from "../../../db";
import type { AppointmentCreateInput } from "../../../db/zod";
import type {
	Appointment,
	AppointmentByIdResponse,
	AppointmentFilters,
	AppointmentMutationPayload,
	AppointmentStatsResponse,
	AppointmentsResponse,
	AvailableTimeSlot
} from "./types";

// Helper to convert null to undefined
function nullToUndefined<T>(obj: T): T {
	if (obj === null || obj === undefined) return undefined as unknown as T;
	if (Array.isArray(obj)) return obj.map(item => nullToUndefined(item)) as unknown as T;
	if (typeof obj === "object") {
		const result = {} as Record<string, unknown>;
		for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
			if (value === null) {
				result[key] = undefined;
			} else if (typeof value === "object") {
				result[key] = nullToUndefined(value);
			} else {
				result[key] = value;
			}
		}
		return result as T;
	}
	return obj;
}

export async function getAppointments(filters: AppointmentFilters): Promise<AppointmentsResponse> {
	const { page = 1, limit = 10, clinicId, status, patientId, doctorId, search, fromDate, toDate } = filters;

	const result = await getAppointmentsWithPagination({
		data: {
			clinicId,
			pagination: { page, limit },
			filters: {
				status: status as AppointmentStatus,
				fromDate: fromDate ? new Date(fromDate) : undefined,
				toDate: toDate ? new Date(toDate) : undefined,
				patientId,
				doctorId,
				search
			}
		}
	});

	return {
		success: true,
		appointments: result.appointments?.map(nullToUndefined) as Appointment[],
		total: result.total,
		page: result.page,
		limit: result.limit,
		totalPages: result.totalPages
	};
}

export async function getAppointmentById(id: string, clinicId: string): Promise<AppointmentByIdResponse> {
	const result = await getAppointmentByIdFn({ data: { id, clinicId } });
	if (!result) return { success: false, message: "Appointment not found", appointment: null };
	return { success: true, appointment: nullToUndefined(result) as Appointment };
}

export async function getUpcomingAppointments({
	clinicId,
	patientId,
	doctorId,
	limit = 10
}: {
	clinicId: string;
	patientId?: string;
	doctorId?: string;
	limit?: number;
}): Promise<Appointment[]> {
	const result = await getAppointmentsWithPagination({
		data: {
			clinicId,
			pagination: { page: 1, limit },
			filters: {
				status: "CONFIRMED",
				patientId,
				doctorId,
				fromDate: new Date()
			}
		}
	});
	return (result.appointments?.map(nullToUndefined) as Appointment[]) || [];
}

export async function getTodaysAppointments({ clinicId }: { clinicId: string }): Promise<Appointment[]> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const result = await getAppointmentsWithPagination({
		data: {
			clinicId,
			pagination: { page: 1, limit: 100 },
			filters: {
				fromDate: today,
				toDate: tomorrow
			}
		}
	});
	return (result.appointments?.map(nullToUndefined) as Appointment[]) || [];
}

export async function getAppointmentStatistics({ clinicId }: { clinicId: string }): Promise<AppointmentStatsResponse> {
	const counts = await getAppointmentCountsByStatusFn({ data: { clinicId } });
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
}
export async function createAppointment(data: AppointmentCreateInput) {
	// Forward payload directly to the underlying function to match its expected shape
	const result = await createAppointmentFn({ data });
	return nullToUndefined(result);
}

export async function updateAppointment(id: string, data: Partial<AppointmentMutationPayload>) {
	const result = await updateAppointmentFn({
		data: {
			id,
			...data
		}
	});
	return nullToUndefined(result);
}

export async function updateAppointmentStatus(id: string, status: string) {
	const result = await updateAppointmentStatusFn({
		data: {
			id,
			status: status as AppointmentStatus
		}
	});
	return nullToUndefined(result);
}

export async function cancelAppointment(appointmentId: string, clinicId: string, reason?: string) {
	const result = await cancelAppointmentFn({
		data: {
			appointmentId,
			clinicId,
			reason: reason || ""
		}
	});
	return nullToUndefined(result);
}

export async function rescheduleAppointment(data: {
	appointmentId: string;
	newDate: Date;
	newTime: string;
	reason?: string;
}) {
	const result = await rescheduleAppointmentFn({ data });
	return nullToUndefined(result);
}

export async function completeAppointment(id: string, notes?: string) {
	const result = await updateAppointmentStatusFn({
		data: {
			id,
			status: "COMPLETED"
		}
	});
	if (notes) {
		await updateAppointmentFn({
			data: {
				id,
				note: notes
			}
		});
	}
	return nullToUndefined(result);
}

export async function softDeleteAppointment(id: string) {
	const result = await softDeleteAppointmentFn({
		data: { id }
	});
	return nullToUndefined(result);
}

export async function restoreAppointment(id: string) {
	const result = await restoreAppointmentFn({
		data: { id }
	});
	return nullToUndefined(result);
}
export async function bulkUpdateAppointmentStatus(appointmentIds: string[], status: string) {
	const result = await bulkUpdateAppointmentStatusFn({
		data: { appointmentIds, status: status as AppointmentStatus }
	});
	return result?.map(nullToUndefined) || [];
}

export async function getAvailableTimeSlots({
	doctorId,
	date,
	durationMinutes = 30,
	clinicId
}: {
	doctorId: string;
	date: Date;
	durationMinutes?: number;
	clinicId: string;
}): Promise<AvailableTimeSlot[]> {
	const workingHours = await getDoctorWorkingHours({ data: { doctorId, date } });
	if (!workingHours) return [];

	const bookedSlots = await getBookedSlotsForDoctor({ data: { doctorId, date } }); // This line is not the source of the error.

	const slots: AvailableTimeSlot[] = [];
	const [startHour, startMinute] = workingHours.start.split(":").map(Number);
	const [endHour, endMinute] = workingHours.end.split(":").map(Number);

	const currentTime = new Date(date);
	currentTime.setHours(startHour, startMinute, 0, 0);
	const endTime = new Date(date);
	endTime.setHours(endHour, endMinute, 0, 0);

	while (currentTime < endTime) {
		const slotEnd = new Date(currentTime);
		slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

		const isBooked = bookedSlots.some((booked: { start: Date; duration: number }) => {
			const bookedStart = booked.start;
			const bookedEnd = new Date(bookedStart);
			bookedEnd.setMinutes(bookedEnd.getMinutes() + booked.duration);
			return currentTime < bookedEnd && slotEnd > bookedStart;
		});

		if (!isBooked) {
			const isAvailable = await checkTimeSlotAvailabilityFn({
				data: {
					doctorId,
					appointmentDate: currentTime,
					durationMinutes,
					clinicId
				}
			});
			if (isAvailable) {
				slots.push({
					startTime: currentTime.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false
					}),
					endTime: slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
					available: true
				});
			}
		}
		currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
	}

	return slots;
}

// Helper functions needed for available slots
async function getDoctorWorkingHours({ data }: { data: { doctorId: string; date: Date } }) {
	const { getDoctorWorkingHours: getDoctorWorkingHoursFn } = await import("@/functions/calendar");
	return getDoctorWorkingHoursFn({ data });
}

async function getBookedSlotsForDoctor({ data }: { data: { doctorId: string; date: Date } }) {
	const { getBookedSlotsForDoctor } = await import("@/functions/appointment");
	return getBookedSlotsForDoctor({ data });
}
