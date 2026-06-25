// products/services/api/service.ts
// ============================================================
// Service Service — Data Access Layer
// ============================================================

import {
	batchUpdateServicePrices as batchUpdateServicePricesFn,
	canDeleteService as canDeleteServiceFn,
	cloneService as cloneServiceFn,
	createService as createServiceFn,
	deleteService as deleteServiceFn,
	getAvailableServices as getAvailableServicesFn,
	getClinicServices as getClinicServicesFn,
	getPopularServices as getPopularServicesFn,
	getServiceById as getServiceByIdFn,
	getServiceCategories as getServiceCategoriesFn,
	getServiceRevenueReport as getServiceRevenueReportFn,
	getServiceStatistics as getServiceStatisticsFn,
	getServicesByCategory as getServicesByCategoryFn,
	getServiceUsageTrends as getServiceUsageTrendsFn,
	listServices as listServicesFn,
	restoreService as restoreServiceFn,
	searchServices as searchServicesFn,
	softDeleteService as softDeleteServiceFn,
	updateService as updateServiceFn
} from "@/functions/clinic";
import { getClinicId } from "@/lib/clinic-utils";

import type {
	PopularServicesResponse,
	Service,
	ServiceByIdResponse,
	ServiceDeleteCheck,
	ServiceFilters,
	ServiceMutationPayload,
	ServiceStatisticsResponse,
	ServicesResponse,
	ServiceUsageTrendResponse
} from "./types";

export async function getServices(filters: ServiceFilters): Promise<ServicesResponse> {
	const clinicId = await getClinicId();

	const result = await listServicesFn({
		data: {
			clinicId,
			page: filters.page || 1,
			pageSize: filters.limit || 10,
			search: filters.search,
			category: filters.category
		}
	});

	return {
		success: true,
		time: new Date().toISOString(),
		message: "Services fetched successfully",
		total: result.total,
		offset: ((filters.page || 1) - 1) * (filters.limit || 10),
		limit: filters.limit || 10,
		services: result.services as Service[]
	};
}

export async function getServiceById(id: string): Promise<ServiceByIdResponse> {
	const clinicId = await getClinicId();

	const service = await getServiceByIdFn({
		data: { serviceId: id, clinicId }
	});

	if (!service) {
		throw new Error("Service not found");
	}

	return {
		success: true,
		time: new Date().toISOString(),
		message: "Service fetched successfully",
		service: service as Service
	};
}

export async function getClinicServices(includeDeleted = false): Promise<Service[]> {
	const clinicId = await getClinicId();

	const result = await getClinicServicesFn({
		data: { clinicId, includeDeleted }
	});

	return result as Service[];
}

export async function getAvailableServices(): Promise<Service[]> {
	const clinicId = await getClinicId();

	const result = await getAvailableServicesFn({
		data: { clinicId }
	});

	return result as Service[];
}

export async function getServicesByCategory(category: string): Promise<Service[]> {
	const clinicId = await getClinicId();

	const result = await getServicesByCategoryFn({
		data: { clinicId, category }
	});

	return result as Service[];
}

export async function getServiceCategories(): Promise<string[]> {
	const clinicId = await getClinicId();

	const result = await getServiceCategoriesFn({
		data: { clinicId }
	});

	return result as string[];
}

export async function searchServices(searchTerm: string): Promise<Service[]> {
	const clinicId = await getClinicId();

	const result = await searchServicesFn({
		data: { clinicId, searchTerm }
	});

	return result as Service[];
}

export async function createService(data: ServiceMutationPayload): Promise<Service> {
	const clinicId = await getClinicId();

	const result = await createServiceFn({
		data: {
			...data,
			clinicId,
			icon: data.icon ?? "",
			color: data.color ?? "",
			isAvailable: data.isAvailable ?? true,
			duration: data.duration || 30
		}
	});

	return result as Service;
}

export async function updateService(id: string, data: ServiceMutationPayload): Promise<Service> {
	const result = await updateServiceFn({
		data: {
			id,
			data: {
				...data,
				icon: data.icon ?? "",
				color: data.color ?? "",
				isAvailable: data.isAvailable ?? true
			}
		}
	});

	return result as Service;
}

export async function deleteService(id: string): Promise<void> {
	await deleteServiceFn({
		data: { serviceId: id }
	});
}

export async function softDeleteService(id: string): Promise<Service> {
	const result = await softDeleteServiceFn({
		data: { serviceId: id }
	});

	return result as Service;
}

export async function restoreService(id: string): Promise<Service> {
	const result = await restoreServiceFn({
		data: { serviceId: id }
	});

	return result as Service;
}

export async function canDeleteService(id: string): Promise<ServiceDeleteCheck> {
	const result = await canDeleteServiceFn({
		data: { serviceId: id }
	});

	return result as ServiceDeleteCheck;
}

export async function cloneService(id: string, newClinicId?: string): Promise<Service> {
	const clinicId = newClinicId || (await getClinicId());

	const result = await cloneServiceFn({
		data: { serviceId: id, newClinicId: clinicId }
	});

	return result as Service;
}

export async function batchUpdateServicePrices(updates: Array<{ id: string; price: number }>): Promise<Service[]> {
	const result = await batchUpdateServicePricesFn({
		data: { updates }
	});

	return result as Service[];
}

export async function getServiceStatistics(startDate?: Date, endDate?: Date): Promise<ServiceStatisticsResponse> {
	const clinicId = await getClinicId();

	const result = await getServiceStatisticsFn({
		data: { clinicId, startDate, endDate }
	});

	return result as unknown as ServiceStatisticsResponse;
}

export async function getPopularServices(
	limit = 10,
	startDate?: Date,
	endDate?: Date
): Promise<PopularServicesResponse> {
	const clinicId = await getClinicId();

	const result = await getPopularServicesFn({
		data: { clinicId, limit, startDate, endDate }
	});

	return result as unknown as PopularServicesResponse;
}

export async function getServiceRevenueReport(startDate: Date, endDate: Date): Promise<ServiceStatisticsResponse> {
	const clinicId = await getClinicId();

	const result = await getServiceRevenueReportFn({
		data: { clinicId, startDate, endDate }
	});

	return result as ServiceStatisticsResponse;
}

export async function getServiceUsageTrends(serviceId: string, months = 6): Promise<ServiceUsageTrendResponse> {
	const clinicId = await getClinicId();

	const result = await getServiceUsageTrendsFn({
		data: { clinicId, serviceId, months }
	});

	return result as ServiceUsageTrendResponse;
}
