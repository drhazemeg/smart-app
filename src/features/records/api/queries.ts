import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getMedicalRecordById, getMedicalRecords } from "./service";
import type { MedicalRecordFilters } from "./types";

export const medicalRecordKeys = {
	all: ["medicalRecords"] as const,
	list: (filters: MedicalRecordFilters) => [...medicalRecordKeys.all, "list", filters] as const,
	detail: (id: string) => [...medicalRecordKeys.all, "detail", id] as const
};

export const getMedicalRecordsQueryOptions = (filters: MedicalRecordFilters) =>
	queryOptions({
		queryKey: medicalRecordKeys.list(filters),
		queryFn: () => getMedicalRecords(filters),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});

export const medicalRecordByIdOptions = (id: string) =>
	queryOptions({
		queryKey: medicalRecordKeys.detail(id),
		queryFn: () => getMedicalRecordById(id),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const infiniteMedicalRecordsOptions = (filters: Omit<MedicalRecordFilters, "offset">) =>
	infiniteQueryOptions({
		queryKey: medicalRecordKeys.list({ ...filters, offset: 0 }),
		queryFn: ({ pageParam = 0 }) => getMedicalRecords({ ...filters, offset: pageParam }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			const nextOffset = allPages.length * (filters.limit || 10);
			return nextOffset < lastPage.length ? nextOffset : undefined;
		},
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});
