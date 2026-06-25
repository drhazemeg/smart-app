// db/repositories/auth.repo.ts

import { count, eq, inArray } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";
import type {
	AccountCreateInput,
	AccountUpdateInput,
	SessionCreateInput,
	SessionUpdateInput,
	TwoFactorCreateInput,
	TwoFactorUpdateInput,
	UserCreateInput,
	UserUpdateInput,
	VerificationCreateInput,
	VerificationUpdateInput
} from "../zod";

export const authRepo = {
	// User queries
	async getUserById(userId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.user.findFirst({
			where: { id: userId }
		});
	},

	async getUserByEmail(email: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.user.findFirst({
			where: { email }
		});
	},

	async getUserWithRole(userId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.user.findFirst({
			where: { id: userId },
			columns: { role: true, clinicId: true }
		});
	},

	async createUser(data: schema.NewUser, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.user).values(data).returning();
		return result;
	},

	async updateUser(id: string, data: Partial<schema.NewUser>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.user)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.user.id, id))
			.returning();
		return result;
	},

	async updateUserClinicId(userId: string, clinicId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.update(schema.user)
			.set({ clinicId, updatedAt: new Date() })
			.where(eq(schema.user.id, userId));
	},

	async getAdminCount(tx?: DBorTx) {
		const client = tx ?? db;
		const result = await client.select({ count: count() }).from(schema.user).where(eq(schema.user.role, "admin"));
		return result[0]?.count ?? 0;
	},

	// Session queries
	async createSession(data: schema.NewSession, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.session).values(data).returning();
		return result;
	},

	async getSessionByToken(token: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.session.findFirst({
			where: { token }
		});
	},

	async deleteSession(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.delete(schema.session).where(eq(schema.session.id, id)).returning();
		return result;
	},

	// Account queries
	async createAccount(data: schema.NewAccount, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.insert(schema.account).values(data).returning();
		return result;
	},

	async getAccountByProvider(providerId: string, accountId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.account.findFirst({
			where: { providerId, accountId }
		});
	},

	// Verification & 2FA

	async getVerificationByIdentifier(identifier: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.verification.findFirst({
			where: { identifier }
		});
	},

	async deleteVerification(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.delete(schema.verification).where(eq(schema.verification.id, id)).returning();
		return result;
	},

	async getTwoFactorByUserId(userId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.twoFactor.findFirst({
			where: { userId }
		});
	},

	// Invite queries
	async getInviteByCode(code: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.invite.findFirst({
			where: { code }
		});
	},

	async markInviteAsUsed(code: string, userId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.update(schema.invite)
			.set({ usedBy: userId, usedAt: new Date() })
			.where(eq(schema.invite.code, code));
	},

	async getUserWithAllRelations(userId: string) {
		return await db.query.user.findFirst({
			where: { id: userId },
			with: {
				folders: {
					where: { parentId: undefined } // Get root folders only
				},
				clinicMemberships: {
					where: {
						userId
					}
				},
				doctorProfile: true,
				staffProfile: true,
				patientProfile: {
					with: {
						appointments: {
							where: { isDeleted: false },
							orderBy: { appointmentDate: "desc" },
							limit: 5
						}
					}
				},
				notifications: {
					where: { status: "UNREAD" },
					orderBy: { createdAt: "desc" }
				}
			}
		});
	},

	async createManyUsers(data: UserCreateInput[]) {
		return await db.insert(schema.user).values(data).returning();
	},

	async updateManyUsers(ids: string[], data: UserUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.user).set(updateData).where(inArray(schema.user.id, ids)).returning();
	},

	async deleteUser(id: string) {
		const [result] = await db.delete(schema.user).where(eq(schema.user.id, id)).returning();
		return result;
	},

	async createManySessions(data: SessionCreateInput[]) {
		return await db.insert(schema.session).values(data).returning();
	},

	async updateSession(id: string, data: SessionUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.session).set(updateData).where(eq(schema.session.id, id)).returning();
		return result;
	},

	async updateManySessions(ids: string[], data: SessionUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.session).set(updateData).where(inArray(schema.session.id, ids)).returning();
	},

	async createManyAccounts(data: AccountCreateInput[]) {
		return await db.insert(schema.account).values(data).returning();
	},

	async updateAccount(id: string, data: AccountUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.account).set(updateData).where(eq(schema.account.id, id)).returning();
		return result;
	},

	async updateManyAccounts(ids: string[], data: AccountUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.account).set(updateData).where(inArray(schema.account.id, ids)).returning();
	},

	async deleteAccount(id: string) {
		const [result] = await db.delete(schema.account).where(eq(schema.account.id, id)).returning();
		return result;
	},

	async createVerification(data: VerificationCreateInput) {
		const [result] = await db.insert(schema.verification).values(data).returning();
		return result;
	},

	async createManyVerifications(data: VerificationCreateInput[]) {
		return await db.insert(schema.verification).values(data).returning();
	},

	async updateVerification(id: string, data: VerificationUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db
			.update(schema.verification)
			.set(updateData)
			.where(eq(schema.verification.id, id))
			.returning();
		return result;
	},

	async updateManyVerifications(ids: string[], data: VerificationUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db
			.update(schema.verification)
			.set(updateData)
			.where(inArray(schema.verification.id, ids))
			.returning();
	},
	async createTwoFactor(data: TwoFactorCreateInput) {
		const [result] = await db.insert(schema.twoFactor).values(data).returning();
		return result;
	},

	async createManyTwoFactors(data: TwoFactorCreateInput[]) {
		return await db.insert(schema.twoFactor).values(data).returning();
	},

	async updateTwoFactor(id: string, data: TwoFactorUpdateInput) {
		const updateData = { ...data };

		const [result] = await db
			.update(schema.twoFactor)
			.set(updateData)
			.where(eq(schema.twoFactor.id, id))
			.returning();
		return result;
	},

	async updateManyTwoFactors(ids: string[], data: TwoFactorUpdateInput) {
		const updateData = { ...data };

		return await db.update(schema.twoFactor).set(updateData).where(inArray(schema.twoFactor.id, ids)).returning();
	},

	async deleteTwoFactor(id: string) {
		const [result] = await db.delete(schema.twoFactor).where(eq(schema.twoFactor.id, id)).returning();
		return result;
	}
};

export type AuthRepo = typeof authRepo;
