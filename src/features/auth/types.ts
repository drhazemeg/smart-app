// src/features/auth/types/auth.types.ts
import type { auth } from "#/features/auth";
import type { authClient } from "./client";

export type AuthSession = typeof auth.$Infer.Session;
export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
export type Role = AuthUser["role"];

export type AuthClientSession = typeof authClient.$Infer.Session;
export type AuthClientUser = AuthClientSession["user"];
export type AuthClient = typeof authClient;

export interface UserWithClinic extends Omit<AuthUser, "clinic"> {
	clinic:
		| {
				id: string;
				name: string;
				role: Role;
		  }
		| undefined;
}

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	name: string;
	role?: Role;
	clinicId?: string;
}

export interface PasswordResetRequest {
	email: string;
}

export interface PasswordResetConfirm {
	token: string;
	newPassword: string;
}

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";
// features/auth/types.ts
export type Permission =
	| "patients:create"
	| "patients:read"
	| "patients:update"
	| "patients:delete"
	| "patients:list"
	| "appointments:create"
	| "appointments:read"
	| "appointments:update"
	| "appointments:delete"
	| "appointments:list"
	| "records:create"
	| "records:read"
	| "records:update"
	| "records:delete"
	| "records:list"
	| "staff:create"
	| "staff:read"
	| "staff:update"
	| "staff:delete"
	| "staff:list"
	| "payments:create"
	| "payments:read"
	| "payments:update"
	| "payments:delete"
	| "payments:list"
	| "immunization:create"
	| "immunization:read"
	| "immunization:update"
	| "immunization:delete"
	| "prescription:create"
	| "prescription:read"
	| "prescription:update"
	| "prescription:delete"
	| "growth:create"
	| "growth:read"
	| "growth:update"
	| "growth:delete"
	| "system:backup"
	| "system:restore"
	| "system:configure"
	| "reports:generate"
	| "reports:export"
	| "reports:view";
