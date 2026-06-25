// db/repo/clinic.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { clinicRepo } from "@/db/queries/clinic.repo";

// =======================
// Schema Validators
// =======================

const clinicIdSchema = z.object({ clinicId: z.string().min(1) });
// const clinicNameSchema = z.object({ name: z.string().min(1) });
const clinicMemberSchema = z.object({
	userId: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"])
});
const serviceListSchema = z.object({
	clinicId: z.string(),
	search: z.string().optional(),
	category: z.string().optional(),
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(10)
});
const serviceIdSchema = z.object({ serviceId: z.string() });
const serviceCategorySchema = z.object({
	clinicId: z.string(),
	category: z.string()
});
const searchTermSchema = z.object({
	clinicId: z.string(),
	searchTerm: z.string()
});
const serviceStatsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional()
});
const serviceUsageSchema = z.object({
	clinicId: z.string(),
	serviceId: z.string(),
	months: z.number().min(1).max(24).default(6)
});
const doctorPerformanceSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});
const batchPriceSchema = z.object({
	updates: z.array(z.object({ id: z.string(), price: z.number() }))
});
const clinicNameSchema = z.object({ name: z.string() });
const clinicUpdateSchema = z.object({
	id: z.string(),
	data: z.object({
		name: z.string().optional(),
		email: z.email().optional(),
		timezone: z.string().optional(),
		address: z.string().optional(),
		phone: z.string().optional(),
		isDefault: z.boolean().optional()
	})
});
const clinicCreateSchema = z.object({
	name: z.string(),
	email: z.email().optional(),
	timezone: z.string().default("UTC"),
	address: z.string().optional(),
	phone: z.string().optional(),
	isDefault: z.boolean().default(false)
});
const clinicSettingSchema = z.object({
	clinicId: z.string(),
	openingTime: z.string(),
	closingTime: z.string(),
	workingDays: z.string(),
	defaultAppointmentDuration: z.number().default(30),
	requireEmergencyContact: z.boolean().default(true)
});
const serviceCreateSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string(),
	serviceName: z.string(),
	description: z.string(),
	price: z.number(),
	category: z.string().optional(),
	duration: z.number().optional(),
	isAvailable: z.boolean().default(true),
	icon: z.string().optional(),
	color: z.string().optional()
});
const serviceUpdateSchema = z.object({
	id: z.string(),
	data: z.object({
		serviceName: z.string().optional(),
		description: z.string().optional(),
		price: z.number().optional(),
		category: z.string().optional(),
		duration: z.number().optional(),
		isAvailable: z.boolean().optional(),
		icon: z.string().optional(),
		color: z.string().optional()
	})
});
const cloneServiceSchema = z.object({
	serviceId: z.string(),
	newClinicId: z.string().optional()
});

// =======================
// Clinic Queries - Using clinicRepo directly
// =======================

export const getClinicById = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getClinicById(clinicId);
		} catch (error) {
			console.error("Error getting clinic by ID:", error);
			throw new Error("Failed to get clinic");
		}
	});

export const getClinicByName = createServerFn({ method: "GET" })
	.validator(clinicNameSchema)
	.handler(async ({ data }) => {
		try {
			const { name } = data;
			return await clinicRepo.getClinicByName(name);
		} catch (error) {
			console.error("Error getting clinic by name:", error);
			throw new Error("Failed to get clinic");
		}
	});

export const createClinic = createServerFn({ method: "POST" })
	.validator(clinicCreateSchema)
	.handler(async ({ data }) => {
		try {
			return await clinicRepo.createClinic({
				...data,
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			});
		} catch (error) {
			console.error("Error creating clinic:", error);
			throw new Error("Failed to create clinic");
		}
	});

export const updateClinic = createServerFn({ method: "POST" })
	.validator(clinicUpdateSchema)
	.handler(async ({ data }) => {
		try {
			const { id, data: updateData } = data;
			return await clinicRepo.updateClinic(id, updateData);
		} catch (error) {
			console.error("Error updating clinic:", error);
			throw new Error("Failed to update clinic");
		}
	});

export const softDeleteClinic = createServerFn({ method: "POST" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.softDeleteClinic(clinicId);
		} catch (error) {
			console.error("Error deleting clinic:", error);
			throw new Error("Failed to delete clinic");
		}
	});

export const getDefaultClinic = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await clinicRepo.getDefaultClinic();
	} catch (error) {
		console.error("Error getting default clinic:", error);
		throw new Error("Failed to get default clinic");
	}
});

// =======================
// Clinic Member Queries
// =======================

export const addUserToClinic = createServerFn({ method: "POST" })
	.validator(clinicMemberSchema)
	.handler(async ({ data }) => {
		try {
			const { userId, clinicId, role } = data;
			return await clinicRepo.addUserToClinic(userId, clinicId, role);
		} catch (error) {
			console.error("Error adding user to clinic:", error);
			throw new Error("Failed to add user to clinic");
		}
	});

export const upsertClinicMember = createServerFn({ method: "POST" })
	.validator(clinicMemberSchema)
	.handler(async ({ data }) => {
		try {
			const { userId, clinicId, role } = data;
			return await clinicRepo.upsertClinicMember(userId, clinicId, role);
		} catch (error) {
			console.error("Error upserting clinic member:", error);
			throw new Error("Failed to upsert clinic member");
		}
	});

export const getUserClinics = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { userId } = data;
			return await clinicRepo.getUserClinics(userId);
		} catch (error) {
			console.error("Error getting user clinics:", error);
			throw new Error("Failed to get user clinics");
		}
	});

export const removeUserFromClinic = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string(), clinicId: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { userId, clinicId } = data;
			return await clinicRepo.removeUserFromClinic(userId, clinicId);
		} catch (error) {
			console.error("Error removing user from clinic:", error);
			throw new Error("Failed to remove user from clinic");
		}
	});

// =======================
// Clinic Statistics
// =======================

export const getClinicStatistics = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getClinicStatistics(clinicId);
		} catch (error) {
			console.error("Error getting clinic statistics:", error);
			throw new Error("Failed to get clinic statistics");
		}
	});

// =======================
// Clinic Settings
// =======================

export const getClinicSetting = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getClinicSetting(clinicId);
		} catch (error) {
			console.error("Error getting clinic setting:", error);
			throw new Error("Failed to get clinic setting");
		}
	});

export const upsertClinicSetting = createServerFn({ method: "POST" })
	.validator(clinicSettingSchema)
	.handler(async ({ data }) => {
		try {
			return await clinicRepo.upsertClinicSetting({
				...data,
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} catch (error) {
			console.error("Error upserting clinic setting:", error);
			throw new Error("Failed to upsert clinic setting");
		}
	});

// =======================
// Clinic Dashboard
// =======================

export const getClinicDashboard = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getClinicDashboard(clinicId);
		} catch (error) {
			console.error("Error getting clinic dashboard:", error);
			throw new Error("Failed to get clinic dashboard");
		}
	});

// =======================
// Service Management
// =======================

export const listServices = createServerFn({ method: "GET" })
	.validator(serviceListSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, search, category, page, pageSize } = data;
			return await clinicRepo.listServices({
				clinicId,
				search,
				category,
				page,
				pageSize
			});
		} catch (error) {
			console.error("Error listing services:", error);
			throw new Error("Failed to list services");
		}
	});

export const getClinicServices = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			includeDeleted: z.boolean().default(false)
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, includeDeleted } = data;
			return await clinicRepo.getClinicServices(clinicId, includeDeleted);
		} catch (error) {
			console.error("Error getting clinic services:", error);
			throw new Error("Failed to get clinic services");
		}
	});

export const getAvailableServices = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getAvailableServices(clinicId);
		} catch (error) {
			console.error("Error getting available services:", error);
			throw new Error("Failed to get available services");
		}
	});

export const getServiceById = createServerFn({ method: "GET" })
	.validator(z.object({ serviceId: z.string(), clinicId: z.string().optional() }))
	.handler(async ({ data }) => {
		try {
			const { serviceId, clinicId } = data;
			return await clinicRepo.getServiceById(serviceId, clinicId);
		} catch (error) {
			console.error("Error getting service by ID:", error);
			throw new Error("Failed to get service");
		}
	});

export const getServicesByCategory = createServerFn({ method: "GET" })
	.validator(serviceCategorySchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, category } = data;
			return await clinicRepo.getServicesByCategory(clinicId, category);
		} catch (error) {
			console.error("Error getting services by category:", error);
			throw new Error("Failed to get services by category");
		}
	});

export const getServiceCategories = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getServiceCategories(clinicId);
		} catch (error) {
			console.error("Error getting service categories:", error);
			throw new Error("Failed to get service categories");
		}
	});

export const searchServices = createServerFn({ method: "GET" })
	.validator(searchTermSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, searchTerm } = data;
			return await clinicRepo.searchServices(clinicId, searchTerm);
		} catch (error) {
			console.error("Error searching services:", error);
			throw new Error("Failed to search services");
		}
	});

export const getServiceStatistics = createServerFn({ method: "GET" })
	.validator(serviceStatsSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			return await clinicRepo.getServiceStatistics(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting service statistics:", error);
			throw new Error("Failed to get service statistics");
		}
	});

export const getPopularServices = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			limit: z.number().default(10),
			startDate: z.date().optional(),
			endDate: z.date().optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, limit, startDate, endDate } = data;
			return await clinicRepo.getPopularServices(clinicId, limit, startDate, endDate);
		} catch (error) {
			console.error("Error getting popular services:", error);
			throw new Error("Failed to get popular services");
		}
	});

export const getLowUsageServices = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			threshold: z.number().default(5),
			days: z.number().default(30)
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, threshold, days } = data;
			return await clinicRepo.getLowUsageServices(clinicId, threshold, days);
		} catch (error) {
			console.error("Error getting low usage services:", error);
			throw new Error("Failed to get low usage services");
		}
	});

export const getServiceRevenueReport = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), startDate: z.date(), endDate: z.date() }))
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			return await clinicRepo.getServiceRevenueReport(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting service revenue report:", error);
			throw new Error("Failed to get service revenue report");
		}
	});

export const canDeleteService = createServerFn({ method: "GET" })
	.validator(serviceIdSchema)
	.handler(async ({ data }) => {
		try {
			const { serviceId } = data;
			return await clinicRepo.canDeleteService(serviceId);
		} catch (error) {
			console.error("Error checking if service can be deleted:", error);
			throw new Error("Failed to check service deletion eligibility");
		}
	});

export const getServiceUsageTrends = createServerFn({ method: "GET" })
	.validator(serviceUsageSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, serviceId, months } = data;
			return await clinicRepo.getServiceUsageTrends(clinicId, serviceId, months);
		} catch (error) {
			console.error("Error getting service usage trends:", error);
			throw new Error("Failed to get service usage trends");
		}
	});

// =======================
// Doctor Performance
// =======================

export const getDoctorPerformanceReport = createServerFn({ method: "GET" })
	.validator(doctorPerformanceSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId, startDate, endDate } = data;
			return await clinicRepo.getDoctorPerformanceReport(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting doctor performance report:", error);
			throw new Error("Failed to get doctor performance report");
		}
	});

// =======================
// Service CRUD Operations
// =======================

export const createService = createServerFn({ method: "POST" })
	.validator(serviceCreateSchema)
	.handler(async ({ data }) => {
		try {
			return await clinicRepo.createService({
				...data,
				id: data.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			});
		} catch (error) {
			console.error("Error creating service:", error);
			throw new Error("Failed to create service");
		}
	});

export const updateService = createServerFn({ method: "POST" })
	.validator(serviceUpdateSchema)
	.handler(async ({ data }) => {
		try {
			const { id, data: updateData } = data;
			return await clinicRepo.updateService(id, updateData);
		} catch (error) {
			console.error("Error updating service:", error);
			throw new Error("Failed to update service");
		}
	});

export const deleteService = createServerFn({ method: "POST" })
	.validator(serviceIdSchema)
	.handler(async ({ data }) => {
		try {
			const { serviceId } = data;
			return await clinicRepo.deleteService(serviceId);
		} catch (error) {
			console.error("Error deleting service:", error);
			throw new Error("Failed to delete service");
		}
	});

export const softDeleteService = createServerFn({ method: "POST" })
	.validator(serviceIdSchema)
	.handler(async ({ data }) => {
		try {
			const { serviceId } = data;
			return await clinicRepo.softDeleteService(serviceId);
		} catch (error) {
			console.error("Error soft deleting service:", error);
			throw new Error("Failed to soft delete service");
		}
	});

export const restoreService = createServerFn({ method: "POST" })
	.validator(serviceIdSchema)
	.handler(async ({ data }) => {
		try {
			const { serviceId } = data;
			return await clinicRepo.restoreService(serviceId);
		} catch (error) {
			console.error("Error restoring service:", error);
			throw new Error("Failed to restore service");
		}
	});

export const createServiceWithCategory = createServerFn({ method: "POST" })
	.validator(z.object({ data: serviceCreateSchema, categoryId: z.string().optional() }))
	.handler(async ({ data }) => {
		try {
			const { data: serviceData, categoryId } = data;
			return await clinicRepo.createServiceWithCategory(serviceData, categoryId);
		} catch (error) {
			console.error("Error creating service with category:", error);
			throw new Error("Failed to create service with category");
		}
	});

export const cloneService = createServerFn({ method: "POST" })
	.validator(cloneServiceSchema)
	.handler(async ({ data }) => {
		try {
			const { serviceId, newClinicId } = data;
			return await clinicRepo.cloneService(serviceId, newClinicId);
		} catch (error) {
			console.error("Error cloning service:", error);
			throw new Error("Failed to clone service");
		}
	});

export const batchUpdateServicePrices = createServerFn({ method: "POST" })
	.validator(batchPriceSchema)
	.handler(async ({ data }) => {
		try {
			const { updates } = data;
			return await clinicRepo.batchUpdateServicePrices(updates);
		} catch (error) {
			console.error("Error batch updating service prices:", error);
			throw new Error("Failed to batch update service prices");
		}
	});

// =======================
// Additional Utility Functions
// =======================

// export const getConfigValue = createServerFn({ method: "GET" })
// 	.validator(z.object({ key: z.string() }))
// 	.handler(async ({ data }) => {
// 		try {
// 			const { key } = data;
// 			return await clinicRepo.getConfigValue(key);
// 		} catch (error) {
// 			console.error("Error getting config value:", error);
// 			throw new Error("Failed to get config value");
// 		}
// 	});

export const setConfigValue = createServerFn({ method: "POST" })
	.validator(z.object({ key: z.string(), value: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { key, value } = data;
			return await clinicRepo.setConfigValue(key, value);
		} catch (error) {
			console.error("Error setting config value:", error);
			throw new Error("Failed to set config value");
		}
	});

export const getFullClinic = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			const { clinicId } = data;
			return await clinicRepo.getFullClinic(clinicId);
		} catch (error) {
			console.error("Error getting full clinic:", error);
			throw new Error("Failed to get full clinic");
		}
	});

// =======================
// Bulk Operations
// =======================

export const createManyClinics = createServerFn({ method: "POST" })
	.validator(z.object({ data: z.array(clinicCreateSchema) }))
	.handler(async ({ data }) => {
		try {
			const clinicsWithDefaults = data.data.map(clinic => ({
				...clinic,
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			}));
			return await clinicRepo.createManyClinicss(clinicsWithDefaults);
		} catch (error) {
			console.error("Error creating many clinics:", error);
			throw new Error("Failed to create multiple clinics");
		}
	});

export const updateManyClinics = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: clinicUpdateSchema.shape.data }))
	.handler(async ({ data }) => {
		try {
			const { ids, data: updateData } = data;
			return await clinicRepo.updateManyClinicss(ids, updateData);
		} catch (error) {
			console.error("Error updating many clinics:", error);
			throw new Error("Failed to update multiple clinics");
		}
	});

export const createManyServices = createServerFn({ method: "POST" })
	.validator(z.object({ data: z.array(serviceCreateSchema) }))
	.handler(async ({ data }) => {
		try {
			const servicesWithDefaults = data.data.map(service => ({
				...service,
				id: service.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			}));
			return await clinicRepo.createManyServices(servicesWithDefaults);
		} catch (error) {
			console.error("Error creating many services:", error);
			throw new Error("Failed to create multiple services");
		}
	});

export const updateManyServices = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: serviceUpdateSchema.shape.data }))
	.handler(async ({ data }) => {
		try {
			const { ids, data: updateData } = data;
			return await clinicRepo.updateManyServices(ids, updateData);
		} catch (error) {
			console.error("Error updating many services:", error);
			throw new Error("Failed to update multiple services");
		}
	});
