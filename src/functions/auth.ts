// db/repositories/auth.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authRepo } from "@/db/queries/auth.repo";
import {
	AccountCreateSchema,
	AccountUpdateSchema,
	accountProviderSchema,
	ClinicMemberUpdateSchema,
	createManyTwoFactorsSchema,
	deleteAccountSchema,
	deleteTwoFactorSchema,
	deleteUserSchema,
	emailSchema,
	SessionCreateSchema,
	SessionUpdateSchema,
	sessionIdSchema,
	sessionTokenSchema,
	TwoFactorCreateSchema,
	UserCreateSchema,
	UserSchema,
	UserUpdateSchema,
	updateManyAccountsSchema,
	updateManyTwoFactorsSchema,
	updateManyVerificationsSchema,
	updateTwoFactorSchema,
	updateVerificationSchema,
	userIdSchema,
	VerificationCreateSchema
} from "@/db/zod";

// =======================
// Schema Validators
// =======================

// =======================
// User Server Functions
// =======================

const getUserById = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await authRepo.getUserById(userId);
		} catch (error) {
			console.error("Error getting user by ID:", error);
			throw new Error("Failed to get user");
		}
	});

const getUserByEmail = createServerFn({ method: "GET" })
	.validator(emailSchema)
	.handler(async ctx => {
		try {
			const { email } = ctx.data;
			return await authRepo.getUserByEmail(email);
		} catch (error) {
			console.error("Error getting user by email:", error);
			throw new Error("Failed to get user");
		}
	});

const getUserWithRole = createServerFn({ method: "GET" })
	.validator(UserSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await authRepo.getUserWithRole(id);
		} catch (error) {
			console.error("Error getting user with role:", error);
			throw new Error("Failed to get user role");
		}
	});

const createUser = createServerFn({ method: "POST" })
	.validator(UserCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await authRepo.createUser(data);
			return result;
		} catch (error) {
			console.error("Error creating user:", error);
			throw new Error("Failed to create user");
		}
	});

const updateUser = createServerFn({ method: "POST" })
	.validator(UserUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			if (!id) {
				throw new Error("User ID is required for update");
			}
			const result = await authRepo.updateUser(id as string, data);
			return result;
		} catch (error) {
			console.error("Error updating user:", error);
			throw new Error("Failed to update user");
		}
	});

const updateUserClinicId = createServerFn({ method: "POST" })
	.validator(ClinicMemberUpdateSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const result = await authRepo.updateUserClinicId(userId as string, clinicId as string);
			return result;
		} catch (error) {
			console.error("Error updating user clinic ID:", error);
			throw new Error("Failed to update user clinic");
		}
	});

const getAdminCount = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await authRepo.getAdminCount();
	} catch (error) {
		console.error("Error getting admin count:", error);
		throw new Error("Failed to get admin count");
	}
});

// =======================
// Session Server Functions
// =======================

const createSession = createServerFn({ method: "POST" })
	.validator(z.object({ data: SessionCreateSchema }))
	.handler(async ctx => {
		try {
			const result = await authRepo.createSession(ctx.data.data);
			return result;
		} catch (error) {
			console.error("Error creating session:", error);
			throw new Error("Failed to create session");
		}
	});

const getSessionByToken = createServerFn({ method: "GET" })
	.validator(sessionTokenSchema)
	.handler(async ctx => {
		try {
			const { token } = ctx.data;
			return await authRepo.getSessionByToken(token);
		} catch (error) {
			console.error("Error getting session by token:", error);
			throw new Error("Failed to get session");
		}
	});

const deleteSession = createServerFn({ method: "POST" })
	.validator(sessionIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await authRepo.deleteSession(id);
			return result;
		} catch (error) {
			console.error("Error deleting session:", error);
			throw new Error("Failed to delete session");
		}
	});

// =======================
// Account Server Functions
// =======================

const createAccount = createServerFn({ method: "POST" })
	.validator(z.object({ data: AccountCreateSchema }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const result = await authRepo.createAccount(data);
			return result;
		} catch (error) {
			console.error("Error creating account:", error);
			throw new Error("Failed to create account");
		}
	});

const getAccountByProvider = createServerFn({ method: "GET" })
	.validator(accountProviderSchema)
	.handler(async ctx => {
		try {
			const { providerId, accountId } = ctx.data;
			return await authRepo.getAccountByProvider(providerId, accountId);
		} catch (error) {
			console.error("Error getting account by provider:", error);
			throw new Error("Failed to get account");
		}
	});
const verificationIdentifierSchema = z.object({ identifier: z.string() });
const verificationIdSchema = z.object({ id: z.string() });
const twoFactorUserIdSchema = z.object({ userId: z.string() });

// =======================
// Verification & 2FA Server Functions
// =======================

const getVerificationByIdentifier = createServerFn({ method: "GET" })
	.validator(verificationIdentifierSchema)
	.handler(async ctx => {
		try {
			const { identifier } = ctx.data;
			return await authRepo.getVerificationByIdentifier(identifier);
		} catch (error) {
			console.error("Error getting verification:", error);
			throw new Error("Failed to get verification");
		}
	});

const deleteVerification = createServerFn({ method: "POST" })
	.validator(verificationIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await authRepo.deleteVerification(id);
			return result;
		} catch (error) {
			console.error("Error deleting verification:", error);
			throw new Error("Failed to delete verification");
		}
	});

const getTwoFactorByUserId = createServerFn({ method: "GET" })
	.validator(twoFactorUserIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await authRepo.getTwoFactorByUserId(userId);
		} catch (error) {
			console.error("Error getting two factor:", error);
			throw new Error("Failed to get two factor");
		}
	});

// =======================
// User Quota Server Functions
// =======================

const getUserWithAllRelations = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			const user = await authRepo.getUserWithAllRelations(userId);
			return JSON.parse(JSON.stringify(user));
		} catch (error) {
			console.error("Error getting user with relations:", error);
			throw new Error("Failed to get user details");
		}
	});

// =======================
// Bulk Operations Server Functions
// =======================

const createManyUsers = createServerFn({ method: "POST" })
	.validator(z.object({ data: UserCreateSchema.array() }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			return await authRepo.createManyUsers(data);
		} catch (error) {
			console.error("Error creating many users:", error);
			throw new Error("Failed to create multiple users");
		}
	});

const updateManyUsers = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: UserUpdateSchema }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await authRepo.updateManyUsers(ids, data);
		} catch (error) {
			console.error("Error updating many users:", error);
			throw new Error("Failed to update multiple users");
		}
	});

const deleteUser = createServerFn({ method: "POST" })
	.validator(deleteUserSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await authRepo.deleteUser(id);
			return result;
		} catch (error) {
			console.error("Error deleting user:", error);
			throw new Error("Failed to delete user");
		}
	});

const createManySessions = createServerFn({ method: "POST" })
	.validator(SessionCreateSchema.array())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await authRepo.createManySessions(data);
		} catch (error) {
			console.error("Error creating many sessions:", error);
			throw new Error("Failed to create multiple sessions");
		}
	});

const updateSession = createServerFn({ method: "POST" })
	.validator(SessionUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			const result = await authRepo.updateSession(id ?? "", data);
			return result;
		} catch (error) {
			console.error("Error updating session:", error);
			throw new Error("Failed to update session");
		}
	});

const updateManySessions = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: SessionUpdateSchema }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await authRepo.updateManySessions(ids, data);
		} catch (error) {
			console.error("Error updating many sessions:", error);
			throw new Error("Failed to update multiple sessions");
		}
	});

const createManyAccounts = createServerFn({ method: "POST" })
	.validator(AccountCreateSchema.array())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await authRepo.createManyAccounts(data);
		} catch (error) {
			console.error("Error creating many accounts:", error);
			throw new Error("Failed to create multiple accounts");
		}
	});

const updateAccount = createServerFn({ method: "POST" })
	.validator(AccountUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			const result = await authRepo.updateAccount(id ?? "", data);
			return result;
		} catch (error) {
			console.error("Error updating account:", error);
			throw new Error("Failed to update account");
		}
	});

const updateManyAccounts = createServerFn({ method: "POST" })
	.validator(updateManyAccountsSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await authRepo.updateManyAccounts(ids, data);
		} catch (error) {
			console.error("Error updating many accounts:", error);
			throw new Error("Failed to update multiple accounts");
		}
	});

const deleteAccount = createServerFn({ method: "POST" })
	.validator(deleteAccountSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await authRepo.deleteAccount(id);
			return result;
		} catch (error) {
			console.error("Error deleting account:", error);
			throw new Error("Failed to delete account");
		}
	});

const createVerification = createServerFn({ method: "POST" })
	.validator(VerificationCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await authRepo.createVerification(data);
			return result;
		} catch (error) {
			console.error("Error creating verification:", error);
			throw new Error("Failed to create verification");
		}
	});

const createManyVerifications = createServerFn({ method: "POST" })
	.validator(z.object({ data: VerificationCreateSchema.array() }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			return await authRepo.createManyVerifications(data);
		} catch (error) {
			console.error("Error creating many verifications:", error);
			throw new Error("Failed to create multiple verifications");
		}
	});

const updateVerification = createServerFn({ method: "POST" })
	.validator(updateVerificationSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const result = await authRepo.updateVerification(id, data);
			return result;
		} catch (error) {
			console.error("Error updating verification:", error);
			throw new Error("Failed to update verification");
		}
	});

const updateManyVerifications = createServerFn({ method: "POST" })
	.validator(updateManyVerificationsSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await authRepo.updateManyVerifications(ids, data);
		} catch (error) {
			console.error("Error updating many verifications:", error);
			throw new Error("Failed to update multiple verifications");
		}
	});

const createTwoFactor = createServerFn({ method: "POST" })
	.validator(TwoFactorCreateSchema)
	.handler(async ctx => {
		try {
			const { ...data } = ctx.data;
			const result = await authRepo.createTwoFactor(data);
			return result;
		} catch (error) {
			console.error("Error creating two factor:", error);
			throw new Error("Failed to create two factor");
		}
	});

const createManyTwoFactors = createServerFn({ method: "POST" })
	.validator(createManyTwoFactorsSchema)
	.handler(async ctx => {
		try {
			const { ...data } = ctx.data;
			return await authRepo.createManyTwoFactors(data);
		} catch (error) {
			console.error("Error creating many two factors:", error);
			throw new Error("Failed to create multiple two factors");
		}
	});

const updateTwoFactor = createServerFn({ method: "POST" })
	.validator(updateTwoFactorSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const result = await authRepo.updateTwoFactor(id, data);
			return result;
		} catch (error) {
			console.error("Error updating two factor:", error);
			throw new Error("Failed to update two factor");
		}
	});

const updateManyTwoFactors = createServerFn({ method: "POST" })
	.validator(updateManyTwoFactorsSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await authRepo.updateManyTwoFactors(ids, data);
		} catch (error) {
			console.error("Error updating many two factors:", error);
			throw new Error("Failed to update multiple two factors");
		}
	});

const deleteTwoFactor = createServerFn({ method: "POST" })
	.validator(deleteTwoFactorSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await authRepo.deleteTwoFactor(id);
			return result;
		} catch (error) {
			console.error("Error deleting two factor:", error);
			throw new Error("Failed to delete two factor");
		}
	});

export {
	createAccount,
	createManyAccounts,
	createManySessions,
	createManyTwoFactors,
	createManyUsers,
	createManyVerifications,
	createSession,
	createTwoFactor,
	createUser,
	createVerification,
	deleteAccount,
	deleteSession,
	deleteTwoFactor,
	deleteUser,
	deleteVerification,
	getAccountByProvider,
	getAdminCount,
	getSessionByToken,
	getTwoFactorByUserId,
	getUserByEmail,
	getUserById,
	getUserWithAllRelations,
	getUserWithRole,
	getVerificationByIdentifier,
	updateAccount,
	updateManyAccounts,
	updateManySessions,
	updateManyTwoFactors,
	updateManyUsers,
	updateManyVerifications,
	updateSession,
	updateTwoFactor,
	updateUser,
	updateUserClinicId,
	updateVerification
};
