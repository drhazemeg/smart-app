// db/repositories/clinic.repo.ts

import { db } from "#/db/client.server";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";

import * as schema from "../schema";
import type { DbStaff, StaffCreateInput, StaffUpdateInput } from "../zod";

export const staffRepo = {
	// Clinic queries
	async listStaff(params: {
		clinicId: string;
		page: number;
		limit: number;
		search?: string;
		role?: "admin" | "doctor" | "staff" | "patient";
		status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
	}) {
		const { clinicId, page, limit, search, role, status } = params;

		const rqbWhere: Record<string, unknown> = {
			clinicId,
			isDeleted: false,
			...(role && { role }),
			...(status && { status }),
			...(search && {
				OR: [
					{ name: { ilike: `%${search}%` } },
					{ email: { ilike: `%${search}%` } },
					{ phone: { ilike: `%${search}%` } },
					{ department: { ilike: `%${search}%` } }
				]
			})
		};

		const [staffList, total] = await Promise.all([
			db.query.staff.findMany({
				where: rqbWhere,
				limit,
				offset: (page - 1) * limit,
				orderBy: { name: "asc" }
			}),
			db.$count(
				schema.staff,
				and(
					eq(schema.staff.clinicId, clinicId),
					eq(schema.staff.isActive, true),
					role ? eq(schema.staff.role, role) : undefined,
					search
						? or(
								ilike(schema.staff.name, `%${search}%`),
								ilike(schema.staff.email, `%${search}%`),
								ilike(schema.staff.phone, `%${search}%`),
								ilike(schema.staff.department, `%${search}%`)
							)
						: undefined
				)
			)
		]);

		return { staff: staffList, total, totalPages: Math.ceil(total / limit) };
	},

	async getStaffById(id: string, clinicId: string) {
		return await db.query.staff.findFirst({
			where: { id, clinicId, isActive: true }
		});
	},

	async createStaff(data: StaffCreateInput) {
		const [result] = await db
			.insert(schema.staff)
			.values(data as DbStaff)
			.returning();
		return result;
	},

	async createManyStaffs(data: StaffCreateInput[]) {
		return await db
			.insert(schema.staff)
			.values(data as DbStaff[])
			.returning();
	},

	async updateStaff(id: string, data: StaffUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.staff)
			.set(updateData as DbStaff)
			.where(eq(schema.staff.id, id))
			.returning();
		return result;
	},
	async getByEmail(email: string, clinicId: string) {
		return await db.query.staff.findFirst({
			where: { email, clinicId, isActive: true }
		});
	},
	async getByUserId(userId: string, clinicId: string) {
		return await db.query.staff.findFirst({
			where: { userId, clinicId, isActive: true }
		});
	},
	async updateManyStaffs(ids: string[], data: StaffUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.staff)
			.set(updateData as DbStaff)
			.where(inArray(schema.staff.id, ids))
			.returning();
	},

	async deleteStaff(id: string) {
		const [result] = await db.delete(schema.staff).where(eq(schema.staff.id, id)).returning();
		return result;
	},

	async softDeleteStaff(id: string) {
		const [result] = await db
			.update(schema.staff)
			.set({ deletedAt: new Date() })
			.where(eq(schema.staff.id, id))
			.returning();
		return result;
	},
	async getStastistics(clinicId: string) {
		const stats = await db
			.select({
				total: sql<number>`CAST(count(*) AS INTEGER)`,
				active: sql<number>`CAST(sum(CASE WHEN ${schema.staff.isActive} THEN 1 ELSE 0 END) AS INTEGER)`,
				inactive: sql<number>`CAST(sum(CASE WHEN NOT ${schema.staff.isActive} THEN 1 ELSE 0 END) AS INTEGER)`
			})
			.from(schema.staff)
			.where(eq(schema.staff.clinicId, clinicId));

		// Get role breakdown separately
		const roleBreakdown = await db
			.select({
				role: schema.staff.role,
				count: sql<number>`CAST(count(*) AS INTEGER)`
			})
			.from(schema.staff)
			.where(eq(schema.staff.clinicId, clinicId))
			.groupBy(schema.staff.role);

		return {
			total: stats[0]?.total ?? 0,
			active: stats[0]?.active ?? 0,
			inactive: stats[0]?.inactive ?? 0,
			roleBreakdown
		};
	},

	async restoreStaff(id: string) {
		const [result] = await db
			.update(schema.staff)
			.set({ deletedAt: null })
			.where(eq(schema.staff.id, id))
			.returning();
		return result;
	}
};

export type StaffRepo = typeof staffRepo;
