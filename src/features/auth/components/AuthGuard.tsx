// src/features/auth/components/AuthGuard.tsx

import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";

interface AuthGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate({ to: "/auth/$path", params: { path: "login" } });
		}
	}, [isLoading, isAuthenticated, navigate]);

	if (isLoading) {
		return <div>Loading...</div>; // Or a proper loading component
	}

	if (!isAuthenticated) {
		return fallback || null;
	}

	return <>{children}</>;
}
