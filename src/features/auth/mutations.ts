// src/features/auth/api/mutations.ts
import { mutationOptions } from "@tanstack/react-query";
import { authClient } from "./client";
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "./schema";
export const authMutations = {
	signIn: mutationOptions({
		mutationFn: async (data: LoginInput) => {
			const { error } = await authClient.signIn.email({
				email: data.email,
				password: data.password,
				rememberMe: data.rememberMe
			});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),

	// mutations.ts
	signUp: mutationOptions({
		mutationFn: async (data: RegisterInput) => {
			const { error } = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
				// Only pass fields with input: true (or default)
				clinicId: data.clinicId,
				address: data.address,
				phone: data.phone
				// role is set server-side, don't pass it here
			});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),
	signOut: mutationOptions({
		mutationFn: async () => {
			// signOut returns { data, error } like other methods
			const { error } = await authClient.signOut({});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),

	forgotPassword: mutationOptions({
		mutationFn: async (data: ForgotPasswordInput) => {
			// ❌ WRONG: Don't use resetPassword - that's for the token step
			// ✅ CORRECT: Use requestPasswordReset to send the email
			const { error } = await authClient.requestPasswordReset({
				email: data.email,
				redirectTo: "/reset-password" // optional: where user lands after clicking email link
			});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),

	resetPassword: mutationOptions({
		mutationFn: async (data: ResetPasswordInput) => {
			// ✅ CORRECT: resetPassword takes token + newPassword
			const { error } = await authClient.resetPassword({
				token: data.token,
				newPassword: data.newPassword
			});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),

	updateProfile: mutationOptions({
		mutationFn: async (data: { name?: string; email?: string; phone?: string; address?: string }) => {
			const { error } = await authClient.updateUser(data);
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),

	changePassword: mutationOptions({
		mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
			const { error } = await authClient.changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword
				// Optional: revokeOtherSessions: true, // sign out all other devices
			});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	}),

	deleteAccount: mutationOptions({
		mutationFn: async (data?: { password?: string }) => {
			const { error } = await authClient.deleteUser({
				// Must provide password OR have fresh session (signed in recently)
				password: data?.password
				// Optional: callbackURL: "/goodbye",
			});
			if (error) throw new Error(error.message);
			return { success: true };
		}
	})
};
