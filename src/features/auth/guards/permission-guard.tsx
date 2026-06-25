// src/features/auth/guards/permission.guard.tsx

import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import type { Permission } from "../types"; // Assuming Permission type is defined here

interface PermissionGuardProps {
	children: ReactNode;
	permission: Permission | Permission[];
	mode?: "any" | "all";
	fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, mode = "any", fallback }: PermissionGuardProps) {
	const { hasAnyPermission, hasAllPermissions, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const permissions = Array.isArray(permission) ? permission : [permission];
	const hasAccess = mode === "any" ? hasAnyPermission(permissions) : hasAllPermissions(permissions);

	useEffect(() => {
		if (!isAuthenticated) {
			// Directs to sign-in path or similar
			navigate({ to: "/auth/$path", params: { path: location.pathname } });
			return;
		}

		if (!hasAccess && !fallback) {
			navigate({ to: "/auth/dashboard" });
		}
	}, [isAuthenticated, hasAccess, fallback, navigate]);

	// Prevent UI flashing before redirecting
	if (!isAuthenticated) {
		return null;
	}

	if (!hasAccess) {
		return fallback || null;
	}

	return <>{children}</>;
}
