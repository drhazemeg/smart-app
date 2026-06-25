import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
	getAppointmentById,
	getAppointmentStatistics,
	getAppointments,
	getAvailableTimeSlots,
	getTodaysAppointments,
	getUpcomingAppointments
} from "./service";
import type { AppointmentFilters } from "./types";

export const appointmentKeys = {
	all: ["appointments"] as const,
	list: (filters: AppointmentFilters) => [...appointmentKeys.all, "list", filters] as const,
	lists: (filters: AppointmentFilters) => appointmentKeys.list(filters),
	details: () => [...appointmentKeys.all, "detail"] as const,
	detail: (id: string, clinicId: string) => [...appointmentKeys.all, "detail", id, clinicId] as const,
	upcoming: (clinicId: string, patientId?: string, doctorId?: string) =>
		[...appointmentKeys.all, "upcoming", clinicId, patientId, doctorId] as const,
	today: (clinicId: string) => [...appointmentKeys.all, "today", clinicId] as const,
	stats: (clinicId: string) => [...appointmentKeys.all, "stats", clinicId] as const,
	availableTimeSlots: (doctorId: string, date: Date, durationMinutes?: number) =>
		[...appointmentKeys.all, "availableTimeSlots", doctorId, date, durationMinutes] as const
};

export const getAppointmentsQueryOptions = (filters: AppointmentFilters) =>
	queryOptions({
		queryKey: appointmentKeys.list(filters),
		queryFn: () => getAppointments(filters),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const appointmentByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: appointmentKeys.detail(id, clinicId),
		queryFn: () => getAppointmentById(id, clinicId),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!id && !!clinicId
	});

export const upcomingAppointmentsOptions = ({
	clinicId,
	patientId,
	doctorId,
	limit = 10
}: {
	clinicId: string;
	patientId?: string;
	doctorId?: string;
	limit?: number;
}) =>
	queryOptions({
		queryKey: appointmentKeys.upcoming(clinicId, patientId, doctorId),
		queryFn: () => getUpcomingAppointments({ clinicId, patientId, doctorId, limit }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const todaysAppointmentsOptions = ({ clinicId }: { clinicId: string }) =>
	queryOptions({
		queryKey: appointmentKeys.today(clinicId),
		queryFn: () => getTodaysAppointments({ clinicId }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const appointmentStatisticsOptions = ({ clinicId }: { clinicId: string }) =>
	queryOptions({
		queryKey: appointmentKeys.stats(clinicId),
		queryFn: () => getAppointmentStatistics({ clinicId }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 15 // 15 minutes
	});

export const getAvailableTimeSlotsQueryOptions = (params: {
	doctorId: string;
	date: Date;
	durationMinutes?: number;
	clinicId: string;
}) =>
	queryOptions({
		queryKey: appointmentKeys.availableTimeSlots(params.doctorId, params.date, params.durationMinutes),
		queryFn: () =>
			getAvailableTimeSlots({
				doctorId: params.doctorId,
				date: params.date,
				durationMinutes: params.durationMinutes,
				clinicId: params.clinicId
			}),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const infiniteAppointmentsOptions = (filters: Omit<AppointmentFilters, "page">) =>
	infiniteQueryOptions({
		queryKey: appointmentKeys.list({ ...filters, page: 1 }),
		queryFn: ({ pageParam = 1 }) => getAppointments({ ...filters, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage * (filters.limit || 10) <= lastPage.total ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});
