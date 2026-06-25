// products/services/api/types.ts
import type { Service, ServiceCategory, ServiceListFilters, ServiceStats, ServiceUsageTrend } from "../schemas/service";

export type { Service, ServiceCategory, ServiceListFilters, ServiceStats, ServiceUsageTrend };

export type ServiceFilters = {
	page?: number;
	clinicId: string;
	limit?: number;
	search?: string;
	category?: ServiceCategory;
	isAvailable?: boolean;
	minPrice?: number;
	maxPrice?: number;
};

export type ServiceMutationPayload = {
	serviceName: string;
	description: string;
	price: number;
	category: ServiceCategory;
	duration?: number;
	isAvailable?: boolean;
	icon?: string | null;
	color?: string | null;
};

export type ServicesResponse = {
	success: boolean;
	time: string;
	message: string;
	total: number;
	offset: number;
	limit: number;
	services: Service[];
};

export type ServiceByIdResponse = {
	success: boolean;
	time: string;
	message: string;
	service: Service;
};

export type ServiceStatisticsResponse = {
	period: { startDate: Date; endDate: Date };
	totalRevenue: number;
	services: Array<{
		id: string;
		name: string;
		category: string | null;
		appointmentCount: number;
		revenue: number;
		averagePrice: number;
	}>;
};

export type ServiceUsageTrendResponse = Array<{
	month: string;
	appointmentCount: number;
	revenue: number;
}>;

export type PopularServicesResponse = Array<{
	id: string;
	name: string;
	category: string | null;
	price: number | null;
	appointmentCount: number;
	revenue: number;
	totalUsage: number;
}>;

export type ServiceDeleteCheck = {
	canDelete: boolean;
	reason?: string;
};
