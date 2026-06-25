// products/services/schemas/service.ts
import * as z from "zod";
import { ServiceSchema } from "../../../db/zod";

export const serviceCategoryEnum = z.enum([
	"CONSULTATION",
	"LAB_TEST",
	"VACCINATION",
	"PROCEDURE",
	"PHARMACY",
	"DIAGNOSIS",
	"THERAPY",
	"OTHER"
]);

export const serviceStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

// export const serviceSchema = z.object({
// 	id: z.string().optional(),
// 	clinicId: z.string().min(1, "Clinic ID is required"),
// 	serviceName: z.string().min(1, "Service name is required"),
// 	description: z.string().min(1, "Description is required"),
// 	price: z.number().min(0, "Price must be non-negative"),
// 	category: serviceCategoryEnum.default("CONSULTATION"),
// 	duration: z.number().min(5, "Duration must be at least 5 minutes").default(30),
// 	isAvailable: z.boolean().default(true),
// 	icon: z.string().nullable().optional(),
// 	color: z
// 		.string()
// 		.regex(/^#[0-9A-F]{6}$/i, "Invalid color code")
// 		.nullable()
// 		.optional(),
// 	isDeleted: z.boolean().default(false)
// });

export const createServiceSchema = ServiceSchema.omit({
	id: true,
	isDeleted: true
});

export const updateServiceSchema = ServiceSchema.partial().extend({
	id: z.string().min(1, "ID is required for updates")
});

export const serviceListFilterSchema = z.object({
	clinicId: z.string(),
	search: z.string().optional(),
	category: serviceCategoryEnum.optional(),
	isAvailable: z.boolean().optional(),
	minPrice: z.number().min(0).optional(),
	maxPrice: z.number().min(0).optional(),
	page: z.number().default(1),
	limit: z.number().default(10)
});

export const serviceStatsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional()
});

export const serviceUsageTrendSchema = z.object({
	clinicId: z.string(),
	serviceId: z.string(),
	months: z.number().min(1).max(24).default(6)
});

export type Service = z.infer<typeof ServiceSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListFilters = z.infer<typeof serviceListFilterSchema>;
export type ServiceStats = z.infer<typeof serviceStatsSchema>;
export type ServiceUsageTrend = z.infer<typeof serviceUsageTrendSchema>;
export type ServiceCategory = z.infer<typeof serviceCategoryEnum>;
