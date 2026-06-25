// src/features/auth/api/client.ts

import { adminClient, customSessionClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "#/features/auth";
import { ac, roles } from "@/features/auth/utils/roles";

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
	baseURL,
	plugins: [
		customSessionClient<typeof auth>(), // This infers the session type from your server
		adminClient({
			ac,
			roles
		}),
		inferAdditionalFields<typeof auth>()
	]
});

export const {
	signIn,
	signUp,
	useSession,
	signOut,
	resetPassword,
	updateUser,
	changeEmail,
	changePassword,
	deleteUser,
	getSession,
	admin
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type AuthClient = typeof authClient;
