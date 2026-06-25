// products/doctors/api/queries.ts
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getDoctorById, getDoctorPerformance, getDoctors, getDoctorWithSchedule, getWorkingDays } from "./service";
import type { DoctorFilters } from "./types";

export const doctorKeys = {
	all: ["doctors"] as const,
	list: (filters: DoctorFilters) => [...doctorKeys.all, "list", filters] as const,
	detail: (id: string) => [...doctorKeys.all, "detail", id] as const,
	schedule: (id: string) => [...doctorKeys.all, "schedule", id] as const,
	workingDays: (id: string) => [...doctorKeys.all, "workingDays", id] as const,
	performance: (id: string, startDate: Date, endDate: Date) =>
		[...doctorKeys.all, "performance", id, startDate, endDate] as const
};

export const getDoctorsQueryOptions = (filters: DoctorFilters) =>
	queryOptions({
		queryKey: doctorKeys.list(filters),
		queryFn: () => getDoctors(filters),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});

export const doctorByIdOptions = (id: string) =>
	queryOptions({
		queryKey: doctorKeys.detail(id),
		queryFn: () => getDoctorById(id),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const doctorWithScheduleOptions = (id: string) =>
	queryOptions({
		queryKey: doctorKeys.schedule(id),
		queryFn: () => getDoctorWithSchedule(id),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!id
	});

export const workingDaysOptions = (doctorId: string) =>
	queryOptions({
		queryKey: doctorKeys.workingDays(doctorId),
		queryFn: () => getWorkingDays(doctorId),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!doctorId
	});

export const doctorPerformanceOptions = (id: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: doctorKeys.performance(id, startDate, endDate),
		queryFn: () => getDoctorPerformance(id, startDate, endDate),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 15,
		enabled: !!id
	});

export const infiniteDoctorsOptions = (filters: Omit<DoctorFilters, "page">) =>
	infiniteQueryOptions({
		queryKey: doctorKeys.list({ ...filters, page: 1 }),
		queryFn: ({ pageParam = 1 }) => getDoctors({ ...filters, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage * (filters.limit || 10) <= lastPage.total ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});
