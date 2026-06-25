// products/patients/api/queries.ts
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
	getGrowthChartData,
	getLatestMeasurement,
	getMeasurementById,
	getMeasurementsByPatient,
	getPatientById,
	getPatientGrowthSummary,
	getPatients,
	getPatientUpcomingAppointments,
	getPatientWithDetails,
	listMeasurements
} from "./service";
import type { PatientFilters } from "./types";

export const patientKeys = {
	all: ["patients"] as const,
	list: (filters: PatientFilters) => [...patientKeys.all, "list", filters] as const,
	detail: (id: string) => [...patientKeys.all, "detail", id] as const,
	fullDetail: (id: string) => [...patientKeys.all, "fullDetail", id] as const,
	summary: (id: string) => [...patientKeys.all, "summary", id] as const,
	appointments: (id: string, limit?: number) => [...patientKeys.all, "appointments", id, limit] as const,
	measurements: (id: string) => [...patientKeys.all, "measurements", id] as const,
	measurement: (id: string) => [...patientKeys.all, "measurement", id] as const,
	latestMeasurement: (id: string) => [...patientKeys.all, "latestMeasurement", id] as const,
	measurementsList: (id: string, limit?: number, offset?: number) =>
		[...patientKeys.all, "measurementsList", id, limit, offset] as const,
	growthChart: (id: string, metric: string, referenceSource?: string) =>
		[...patientKeys.all, "growthChart", id, metric, referenceSource] as const
};

export const getPatientsQueryOptions = (filters: PatientFilters) =>
	queryOptions({
		queryKey: patientKeys.list(filters),
		queryFn: () => getPatients(filters),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5
	});

export const patientByIdOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.detail(id),
		queryFn: () => getPatientById(id),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const patientWithDetailsOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.fullDetail(id),
		queryFn: () => getPatientWithDetails(id),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!id
	});

export const patientGrowthSummaryOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.summary(id),
		queryFn: () => getPatientGrowthSummary(id),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const patientUpcomingAppointmentsOptions = (id: string, limit = 10) =>
	queryOptions({
		queryKey: patientKeys.appointments(id, limit),
		queryFn: () => getPatientUpcomingAppointments(id, limit),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5,
		enabled: !!id
	});

export const measurementsByPatientOptions = (patientId: string) =>
	queryOptions({
		queryKey: patientKeys.measurements(patientId),
		queryFn: () => getMeasurementsByPatient(patientId),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const measurementByIdOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.measurement(id),
		queryFn: () => getMeasurementById(id),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const latestMeasurementOptions = (patientId: string) =>
	queryOptions({
		queryKey: patientKeys.latestMeasurement(patientId),
		queryFn: () => getLatestMeasurement(patientId),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const measurementsListOptions = (patientId: string, limit = 20, offset = 0) =>
	queryOptions({
		queryKey: patientKeys.measurementsList(patientId, limit, offset),
		queryFn: () => listMeasurements(patientId, limit, offset),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const growthChartDataOptions = (
	patientId: string,
	metric: "weight" | "height" | "bmi" = "weight",
	referenceSource: "who2006" | "who2007" | "egypt2020" | "cdc2000" = "egypt2020"
) =>
	queryOptions({
		queryKey: patientKeys.growthChart(patientId, metric, referenceSource),
		queryFn: () => getGrowthChartData(patientId, metric, referenceSource),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 15,
		enabled: !!patientId
	});

export const infinitePatientsOptions = (filters: Omit<PatientFilters, "page">) =>
	infiniteQueryOptions({
		queryKey: patientKeys.list({ ...filters, page: 1 }),
		queryFn: ({ pageParam = 1 }) => getPatients({ ...filters, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage * (filters.limit || 10) <= lastPage.total ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5
	});
