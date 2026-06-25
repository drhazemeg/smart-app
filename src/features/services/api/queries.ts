// products/services/api/queries.ts
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
	canDeleteService,
	getAvailableServices,
	getClinicServices,
	getPopularServices,
	getServiceById,
	getServiceCategories,
	getServiceRevenueReport,
	getServiceStatistics,
	getServices,
	getServicesByCategory,
	getServiceUsageTrends,
	searchServices
} from "./service";
import type { ServiceFilters } from "./types";

export const serviceKeys = {
	all: ["services"] as const,
	list: (filters: ServiceFilters) => [...serviceKeys.all, "list", filters] as const,
	detail: (id: string) => [...serviceKeys.all, "detail", id] as const,
	clinic: (includeDeleted?: boolean) => [...serviceKeys.all, "clinic", { includeDeleted }] as const,
	available: () => [...serviceKeys.all, "available"] as const,
	categories: () => [...serviceKeys.all, "categories"] as const,
	byCategory: (category: string) => [...serviceKeys.all, "category", category] as const,
	search: (term: string) => [...serviceKeys.all, "search", term] as const,
	statistics: (startDate?: Date, endDate?: Date) =>
		[...serviceKeys.all, "statistics", { startDate, endDate }] as const,
	popular: (limit?: number, startDate?: Date, endDate?: Date) =>
		[...serviceKeys.all, "popular", { limit, startDate, endDate }] as const,
	revenue: (startDate: Date, endDate: Date) => [...serviceKeys.all, "revenue", { startDate, endDate }] as const,
	usageTrends: (serviceId: string, months?: number) =>
		[...serviceKeys.all, "usageTrends", serviceId, months] as const,
	canDelete: (id: string) => [...serviceKeys.all, "canDelete", id] as const
};

export const getServicesQueryOptions = (filters: ServiceFilters) =>
	queryOptions({
		queryKey: serviceKeys.list(filters),
		queryFn: () => getServices(filters),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});

export const serviceByIdOptions = (id: string) =>
	queryOptions({
		queryKey: serviceKeys.detail(id),
		queryFn: () => getServiceById(id),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const clinicServicesOptions = (includeDeleted = false) =>
	queryOptions({
		queryKey: serviceKeys.clinic(includeDeleted),
		queryFn: () => getClinicServices(includeDeleted),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});

export const availableServicesOptions = () =>
	queryOptions({
		queryKey: serviceKeys.available(),
		queryFn: () => getAvailableServices(),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});

export const serviceCategoriesOptions = () =>
	queryOptions({
		queryKey: serviceKeys.categories(),
		queryFn: () => getServiceCategories(),
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60
	});

export const servicesByCategoryOptions = (category: string) =>
	queryOptions({
		queryKey: serviceKeys.byCategory(category),
		queryFn: () => getServicesByCategory(category),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!category
	});

export const searchServicesOptions = (term: string) =>
	queryOptions({
		queryKey: serviceKeys.search(term),
		queryFn: () => searchServices(term),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5,
		enabled: term.length >= 2
	});

export const serviceStatisticsOptions = (startDate?: Date, endDate?: Date) =>
	queryOptions({
		queryKey: serviceKeys.statistics(startDate, endDate),
		queryFn: () => getServiceStatistics(startDate, endDate),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 15
	});

export const popularServicesOptions = (limit = 10, startDate?: Date, endDate?: Date) =>
	queryOptions({
		queryKey: serviceKeys.popular(limit, startDate, endDate),
		queryFn: () => getPopularServices(limit, startDate, endDate),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 15
	});

export const serviceRevenueReportOptions = (startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: serviceKeys.revenue(startDate, endDate),
		queryFn: () => getServiceRevenueReport(startDate, endDate),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 15
	});

export const serviceUsageTrendsOptions = (serviceId: string, months = 6) =>
	queryOptions({
		queryKey: serviceKeys.usageTrends(serviceId, months),
		queryFn: () => getServiceUsageTrends(serviceId, months),
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60,
		enabled: !!serviceId
	});

export const canDeleteServiceOptions = (id: string) =>
	queryOptions({
		queryKey: serviceKeys.canDelete(id),
		queryFn: () => canDeleteService(id),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5,
		enabled: !!id
	});

export const infiniteServicesOptions = (filters: Omit<ServiceFilters, "page">) =>
	infiniteQueryOptions({
		queryKey: serviceKeys.list({ ...filters, page: 1 }),
		queryFn: ({ pageParam = 1 }) => getServices({ ...filters, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage * (filters.limit || 10) <= lastPage.total ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});
