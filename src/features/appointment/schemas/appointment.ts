import { z } from "zod";

import { appointmentStatusEnum } from "@/db/schema";

export const appointmentIdSchema = z.object({
	id: z.uuid(),
	clinicId: z.uuid()
});

export const createAppointmentSchema = z.object({
	patientId: z.uuid(),
	doctorId: z.uuid(),
	clinicId: z.uuid(),
	serviceId: z.uuid().optional(),
	appointmentDate: z.date(),
	time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
	durationMinutes: z.number().int().min(15).max(120).default(30),
	type: z.string(),
	reason: z.string().optional(),
	note: z.string().optional(),
	symptoms: z.string().optional(),
	appointmentPrice: z.number().int().min(0).optional()
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const bulkStatusUpdateSchema = z.object({
	appointmentIds: z.array(z.uuid()).min(1),
	status: z.enum(appointmentStatusEnum.enumValues),
	reason: z.string().optional()
});

export const cancelAppointmentSchema = z.object({
	appointmentId: z.uuid(),
	clinicId: z.uuid(),
	reason: z.string().optional()
});

export const rescheduleAppointmentSchema = z.object({
	appointmentId: z.uuid(),
	newDate: z.date(),
	newTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
	reason: z.string().optional()
});

export const getAppointmentsQuerySchema = z.object({
	clinicId: z.uuid(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	status: z.enum(appointmentStatusEnum.enumValues).optional(),
	fromDate: z.coerce.date().optional(),
	toDate: z.coerce.date().optional(),
	patientId: z.uuid().optional(),
	doctorId: z.uuid().optional(),
	type: z.string().optional(),
	search: z.string().optional()
});

export const dateRangeSchema = z.object({
	clinicId: z.uuid(),
	startDate: z.date(),
	endDate: z.date(),
	doctorId: z.uuid().optional()
});

export const checkAvailabilitySchema = z.object({
	doctorId: z.uuid(),
	appointmentDate: z.date(),
	durationMinutes: z.number().int().default(30),
	clinicId: z.uuid(),
	excludeAppointmentId: z.uuid().optional()
});

export const appointmentStatsSchema = z.object({
	clinicId: z.uuid(),
	startDate: z.date().optional(),
	endDate: z.date().optional()
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type GetAppointmentsQuery = z.infer<typeof getAppointmentsQuerySchema>;
export type DateRangeQuery = z.infer<typeof dateRangeSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
export const bookedSlotsSchema = z.object({
	doctorId: z.string(),
	date: z.date()
});
