// src/features/auth/utils/permissions.ts
import type { Role } from "../types";

export function hasRequiredRole(userRole: Role | undefined, requiredRoles: Role | Role[]): boolean {
	if (!userRole) return false;
	const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
	return roles.includes(userRole);
}

export function getRoleDisplayName(role: Role): string {
	const displayNames: Record<Role, string> = {
		admin: "Administrator",
		doctor: "Doctor",
		staff: "Staff Member",
		patient: "Patient"
	};
	return displayNames[role] || role;
}

export function getRoleColor(role: Role): string {
	const colors: Record<Role, string> = {
		admin: "bg-red-500",
		doctor: "bg-blue-500",
		staff: "bg-green-500",
		patient: "bg-purple-500"
	};
	return colors[role] || "bg-gray-500";
}
