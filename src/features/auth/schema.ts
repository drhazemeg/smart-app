// src/features/auth/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	rememberMe: z.boolean().optional()
});

export const registerSchema = z
	.object({
		email: z.email("Invalid email format"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		address: z.string().optional(),
		phone: z.string().optional(),
		name: z.string().min(2, "Name must be at least 2 characters"),
		role: z.enum(["doctor", "staff", "patient", "admin"]).optional(),
		clinicId: z.string().optional()
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	});

export const forgotPasswordSchema = z.object({
	email: z.email("Invalid email format")
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Token is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string()
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	});

export const updateProfileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").optional(),
	email: z.email("Invalid email format").optional(),
	phone: z.string().optional(),
	address: z.string().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
