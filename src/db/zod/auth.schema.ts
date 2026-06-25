import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";

import type * as schema from "../schema";
import { account, session, twoFactor, user, verification } from "../schema";

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8)
});
export type DbUser = InferSelectModel<typeof user>;
export const registerSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
	name: z.string().min(2)
});

export type LoginInput = z.infer<typeof loginSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;

export type User = InferSelectModel<typeof schema.user>;
// Auth Schemas
export const UserSchema = createSelectSchema(user);
export const UserCreateSchema = createInsertSchema(user);
export const UserUpdateSchema = createUpdateSchema(user);

export const SessionSchema = createSelectSchema(session);
export const SessionCreateSchema = createInsertSchema(session);
export const SessionUpdateSchema = createUpdateSchema(session);

export const AccountSchema = createSelectSchema(account);
export const AccountCreateSchema = createInsertSchema(account);
export const AccountUpdateSchema = createUpdateSchema(account);

export const VerificationSchema = createSelectSchema(verification);
export const VerificationCreateSchema = createInsertSchema(verification);
export const VerificationUpdateSchema = createUpdateSchema(verification);

export const TwoFactorSchema = createSelectSchema(twoFactor);
export const TwoFactorCreateSchema = createInsertSchema(twoFactor);
export const TwoFactorUpdateSchema = createUpdateSchema(twoFactor);

// Base Types
export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export type Session = z.infer<typeof SessionSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
export type TwoFactor = z.infer<typeof TwoFactorSchema>;
export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>;
export type AccountCreateInput = z.infer<typeof AccountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof AccountUpdateSchema>;
export type VerificationCreateInput = z.infer<typeof VerificationCreateSchema>;
export type VerificationUpdateInput = z.infer<typeof VerificationUpdateSchema>;
export type TwoFactorCreateInput = z.infer<typeof TwoFactorCreateSchema>;
export type TwoFactorUpdateInput = z.infer<typeof TwoFactorUpdateSchema>;

// export const UserAuthSchema = UserSchema.omit({ role: true }).extend({
// 	role: z.enum(["admin", "doctor", "patient", "staff"]),
// 	password: z.string().min(6),
// });

// export const PartialUser = createPartialUpdateSchema(UserSchema);
// export type UserUpdate = z.infer<typeof PartialUser>;

export const userIdSchema = z.object({ userId: z.string() });
export const emailSchema = z.object({ email: z.email() });
export const sessionTokenSchema = z.object({ token: z.string() });
export const sessionIdSchema = z.object({ id: z.string() });
export const accountProviderSchema = z.object({
	providerId: z.string(),
	accountId: z.string()
});
export const deleteUserSchema = z.object({ id: z.string() });
export const updateManyAccountsSchema = z.object({
	ids: z.array(z.string()),
	data: z.record(z.string(), z.any())
});
export const deleteAccountSchema = z.object({ id: z.string() });
export const updateVerificationSchema = z.object({
	id: z.string(),
	data: z.record(z.string(), z.any())
});
export const updateManyVerificationsSchema = z.object({
	ids: z.array(z.string()),
	data: z.record(z.string(), z.any())
});
export const updateTwoFactorSchema = z.object({
	id: z.string(),
	data: z.record(z.string(), z.any())
});
export const updateManyTwoFactorsSchema = z.object({
	ids: z.array(z.string()),
	data: z.record(z.string(), z.any())
});
export const deleteTwoFactorSchema = z.object({ id: z.string() });

export const createManyTwoFactorsSchema = z.array(TwoFactorCreateSchema);
