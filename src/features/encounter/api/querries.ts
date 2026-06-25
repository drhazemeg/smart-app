// features/encounters/api/queries.ts
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getEncounterById, getEncounters, getPatientEncountersList } from "./service";
import type { EncounterFilters } from "./type";

export const encounterKeys = {
	all: ["encounters"] as const,
	list: (filters: EncounterFilters) => [...encounterKeys.all, "list", filters] as const,
	detail: (id: string, clinicId: string) => [...encounterKeys.all, "detail", id, clinicId] as const,
	patient: (patientId: string) => [...encounterKeys.all, "patient", patientId] as const,
	stats: (clinicId: string) => [...encounterKeys.all, "stats", clinicId] as const
};

export const getEncountersQueryOptions = (filters: EncounterFilters) =>
	queryOptions({
		queryKey: encounterKeys.list(filters),
		queryFn: () => getEncounters(filters),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const encounterByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: encounterKeys.detail(id, clinicId),
		queryFn: () => getEncounterById(id, clinicId),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!id && !!clinicId
	});

export const patientEncountersOptions = (patientId: string, clinicId: string) =>
	queryOptions({
		queryKey: encounterKeys.patient(patientId),
		queryFn: () => getPatientEncountersList(patientId, clinicId),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!patientId && !!clinicId
	});

export const infiniteEncountersOptions = (filters: Omit<EncounterFilters, "page">) =>
	infiniteQueryOptions({
		queryKey: encounterKeys.list({ ...filters, page: 1 }),
		queryFn: ({ pageParam = 1 }) => getEncounters({ ...filters, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage * (filters.limit || 10) <= lastPage.total ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});
