// src/lib/navigation.ts
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../features/auth/hooks/use-auth";

// Define a type for the state that can be passed to navigate
type NavigationState = Record<string, unknown> | true | undefined;

export function useProtectedNavigation() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const { hasRole } = useAuth();

	const navigateTo = (to: string, options?: { replace?: boolean; state?: NavigationState }) => {
		if (!isAuthenticated) {
			navigate({ to: "/auth/$path", params: { path: "login" }, ...options });
			return;
		}
		navigate({ to, ...options });
	};

	const navigateAdmin = (to: string, options?: { replace?: boolean; state?: NavigationState }) => {
		if (!hasRole("admin")) {
			navigate({ to: "/auth/dashboard", ...options });
			return;
		}
		navigate({ to, ...options });
	};

	return {
		navigateTo,
		navigateAdmin,
		navigate
	};
}
