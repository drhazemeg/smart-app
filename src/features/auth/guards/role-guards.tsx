// src/features/auth/guards/role.guard.tsx

import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import type { Role } from "../types";

interface RoleGuardProps {
	children: ReactNode;
	roles: Role | Role[];
	fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
	const { hasRole, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// Handle redirects in a side effect to avoid React rendering warnings
	useEffect(() => {
		if (!isAuthenticated) {
			navigate({ to: "/auth/$path", params: { path: "login" } });
			return;
		}

		if (!hasRole(roles) && !fallback) {
			navigate({ to: "/auth/dashboard" });
		}
	}, [isAuthenticated, roles, hasRole, fallback, navigate]);

	// Render edge cases safely
	if (!isAuthenticated) {
		return null;
	}

	if (!hasRole(roles)) {
		return fallback || null;
	}

	return <>{children}</>;
}
