import type { DbAppointment, DbClinic, DbDoctor, DbPatient, DbService } from "@/db";

export interface Appointment extends DbAppointment {
	patient?: DbPatient;
	doctor?: DbDoctor;
	service?: DbService;
	clinic?: DbClinic;
	symptoms?: string;
}

export interface AppointmentFilters {
	clinicId: string;
	page?: number;
	limit?: number;
	status?: string;
	patientId?: string;
	doctorId?: string;
	type?: string;
	search?: string;
	fromDate?: string;
	toDate?: string;
}

export interface AppointmentsResponse {
	success: boolean;
	appointments: Appointment[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface AppointmentByIdResponse {
	success: boolean;
	message?: string;
	appointment: Appointment | null;
}

export interface AppointmentStatsResponse {
	counts: {
		PENDING: number;
		CONFIRMED: number;
		COMPLETED: number;
		CANCELLED: number;
		NO_SHOW: number;
	};
	totalAppointments: number;
	totalRevenue: number;
}

export interface AppointmentMutationPayload {
	patientId: string;
	doctorId: string;
	clinicId: string;
	serviceId?: string;
	appointmentDate: Date;
	time: string;
	durationMinutes?: number;
	type: string;
	reason?: string;
	note?: string;
	symptoms?: string;
	appointmentPrice?: number;
}

export interface AvailableTimeSlot {
	startTime: string;
	endTime: string;
	available: boolean;
}
