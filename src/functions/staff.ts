// db/repositories/staff.repo.ts

import console from "node:console";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { staffRepo } from "@/db/queries/staff.repo";

// =======================
// Zod Validators
// =======================

const listStaffSchema = z.object({
	clinicId: z.string(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	role: z.enum(["admin", "doctor", "staff", "patient"]).optional(),
	status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).optional()
});

const staffIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const createStaffSchema = z.object({
	id: z.string().optional(),
	email: z.email().optional(),
	name: z.string().min(1),
	phone: z.string().optional(),
	userId: z.string().optional(),
	clinicId: z.string(),
	address: z.string(),
	department: z.string().optional(),
	img: z.string().optional(),
	licenseNumber: z.string().optional(),
	colorCode: z.string().optional(),
	hireDate: z.date().optional(),
	salary: z.number().optional(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).default("ACTIVE"),
	isActive: z.boolean().default(true)
});

const updateStaffSchema = createStaffSchema.partial();

const bulkStaffUpdateSchema = z.object({
	ids: z.array(z.string()),
	data: updateStaffSchema
});

// =======================
// Server Functions
// =======================

const listStaff = createServerFn({ method: "POST" })
	.validator(listStaffSchema)
	.handler(async ctx => {
		try {
			const { clinicId, page, limit, search, role, status } = ctx.data;
			return await staffRepo.listStaff({
				clinicId,
				page,
				limit,
				search,
				role,
				status
			});
		} catch (error) {
			console.error("Error listing staff:", error);
			throw new Error("Failed to list staff");
		}
	});

const getStaffById = createServerFn({ method: "GET" })
	.validator(staffIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			return await staffRepo.getStaffById(id, clinicId);
		} catch (error) {
			console.error("Error getting staff by ID:", error);
			throw new Error("Failed to get staff");
		}
	});

const createStaff = createServerFn({ method: "POST" })
	.validator(createStaffSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const now = new Date();

			const staffData = {
				id: data.id || crypto.randomUUID(),
				...data,
				createdAt: now,
				updatedAt: now
			};

			return await staffRepo.createStaff(staffData);
		} catch (error) {
			console.error("Error creating staff:", error);
			throw new Error("Failed to create staff");
		}
	});

const createManyStaff = createServerFn({ method: "POST" })
	.validator(z.object({ staffList: z.array(createStaffSchema) }))
	.handler(async ctx => {
		try {
			const { staffList } = ctx.data;
			const now = new Date();

			const staffWithIds = staffList.map(staff => ({
				...staff,
				id: staff.id || crypto.randomUUID(),
				createdAt: now,
				updatedAt: now
			}));

			return await staffRepo.createManyStaffs(staffWithIds);
		} catch (error) {
			console.error("Error creating multiple staff members:", error);
			throw new Error("Failed to create staff members");
		}
	});

const updateStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: updateStaffSchema }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const result = await staffRepo.updateStaff(id, data);

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error updating staff:", error);
			throw new Error("Failed to update staff");
		}
	});

const updateManyStaff = createServerFn({ method: "POST" })
	.validator(bulkStaffUpdateSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await staffRepo.updateManyStaffs(ids, data);
			return result;
		} catch (error) {
			console.error("Error updating multiple staff members:", error);
			throw new Error("Failed to update staff members");
		}
	});

const deleteStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await staffRepo.deleteStaff(id);

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error deleting staff:", error);
			throw new Error("Failed to delete staff");
		}
	});

const softDeleteStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await staffRepo.softDeleteStaff(id);

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error soft deleting staff:", error);
			throw new Error("Failed to soft delete staff");
		}
	});

const restoreStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await staffRepo.restoreStaff(id);

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error restoring staff:", error);
			throw new Error("Failed to restore staff");
		}
	});

// Additional utility functions

const getStaffByUserId = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const staff = await staffRepo.getByUserId(userId, clinicId);
			return staff;
		} catch (error) {
			console.error("Error getting staff by user ID:", error);
			throw new Error("Failed to get staff");
		}
	});

const getStaffByEmail = createServerFn({ method: "GET" })
	.validator(z.object({ email: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { email, clinicId } = ctx.data;
			const staff = await staffRepo.getByEmail(email, clinicId);
			return staff;
		} catch (error) {
			console.error("Error getting staff by email:", error);
			throw new Error("Failed to get staff");
		}
	});

const getActiveStaffByDepartment = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), department: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId, department } = ctx.data;
			const staff = await db.query.staff.findMany({
				where: { clinicId, department, isActive: true },
				orderBy: (staff, { asc }) => asc(staff.name)
			});
			return staff;
		} catch (error) {
			console.error("Error getting staff by department:", error);
			throw new Error("Failed to get staff");
		}
	});

const updateStaffStatus = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"])
		})
	)
	.handler(async ctx => {
		try {
			const { id, status } = ctx.data;

			const result = await staffRepo.updateStaff(id, {
				isActive: status === "ACTIVE"
			});

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error updating staff status:", error);
			throw new Error("Failed to update staff status");
		}
	});

const bulkUpdateStaffStatus = createServerFn({ method: "POST" })
	.validator(
		z.object({
			ids: z.array(z.string()),
			status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"])
		})
	)
	.handler(async ctx => {
		try {
			const { ids, status } = ctx.data;

			const result = await staffRepo.updateManyStaffs(ids, {
				isActive: status === "ACTIVE"
			});

			return result;
		} catch (error) {
			console.error("Error bulk updating staff status:", error);
			throw new Error("Failed to bulk update staff status");
		}
	});

const searchStaff = createServerFn({ method: "POST" })
	.validator(
		z.object({
			clinicId: z.string(),
			searchTerm: z.string().min(1),
			limit: z.number().default(20)
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, searchTerm, limit } = ctx.data;

			// Use listStaff with search
			const result = await staffRepo.listStaff({
				clinicId,
				page: 1,
				limit,
				search: searchTerm
			});

			return result.staff;
		} catch (error) {
			console.error("Error searching staff:", error);
			throw new Error("Failed to search staff");
		}
	});

const getStaffStatistics = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;

			const stats = await staffRepo.getStastistics(clinicId);
			return stats;
		} catch (error) {
			console.error("Error getting staff statistics:", error);
			throw new Error("Failed to get staff statistics");
		}
	});

const getStaffWithUpcomingBirthdays = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			// This would require a birthday field in staff table
			// Placeholder implementation using the repository
			const result = await staffRepo.listStaff({
				clinicId: ctx.data.clinicId,
				page: 1,
				limit: 10
			});

			return result.staff;
		} catch (error) {
			console.error("Error getting staff birthdays:", error);
			throw new Error("Failed to get staff birthdays");
		}
	});

const getStaffByRole = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			role: z.enum(["admin", "doctor", "staff", "patient"])
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, role } = ctx.data;

			const result = await staffRepo.listStaff({
				clinicId,
				page: 1,
				limit: 999, // Large limit to get all
				role
			});

			return result.staff;
		} catch (error) {
			console.error("Error getting staff by role:", error);
			throw new Error("Failed to get staff by role");
		}
	});

export {
	bulkUpdateStaffStatus,
	createManyStaff,
	createStaff,
	deleteStaff,
	getActiveStaffByDepartment,
	getStaffByEmail,
	getStaffById,
	getStaffByRole,
	getStaffByUserId,
	getStaffStatistics,
	getStaffWithUpcomingBirthdays,
	listStaff,
	restoreStaff,
	searchStaff,
	softDeleteStaff,
	updateManyStaff,
	updateStaff,
	updateStaffStatus
};
