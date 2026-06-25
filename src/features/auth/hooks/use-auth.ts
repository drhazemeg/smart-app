// features/auth/hooks/use-auth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "../client";
import type { Permission, Role } from "../types";

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface UpdateProfileData {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
}

export type AuthUser = Session["user"];
export type Session = typeof authClient.$Infer.Session;

interface UseAuthReturn {
	// User state
	user: AuthUser | null;
	session: Session | null;
	isLoading: boolean;
	isAuthenticated: boolean;

	// Role & Permission checks
	hasRole: (role: Role | Role[]) => boolean;
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (permissions: Permission[]) => boolean;
	hasAllPermissions: (permissions: Permission[]) => boolean;
	getRoleDisplayName: () => string;
	getRoleColor: () => string;

	// Auth actions
	signIn: (credentials: LoginCredentials) => Promise<void>;
	signOut: () => Promise<void>;
	updateProfile: (data: UpdateProfileData) => Promise<void>;

	// Loading states
	isSigningIn: boolean;
	isSigningOut: boolean;
	isUpdatingProfile: boolean;
}

// Define role-based permissions
// These should match the permissions defined in your roles.ts
type RolePermissions = {
	[key in Role]: Permission[];
};

const rolePermissions: RolePermissions = {
	admin: [
		"patients:create",
		"patients:read",
		"patients:update",
		"patients:delete",
		"patients:list",
		"appointments:create",
		"appointments:read",
		"appointments:update",
		"appointments:delete",
		"appointments:list",
		"records:create",
		"records:read",
		"records:update",
		"records:delete",
		"records:list",
		"staff:create",
		"staff:read",
		"staff:update",
		"staff:delete",
		"staff:list",
		"payments:create",
		"payments:read",
		"payments:update",
		"payments:delete",
		"payments:list",
		"immunization:create",
		"immunization:read",
		"immunization:update",
		"immunization:delete",
		"prescription:create",
		"prescription:read",
		"prescription:update",
		"prescription:delete",
		"growth:create",
		"growth:read",
		"growth:update",
		"growth:delete",
		"system:backup",
		"system:restore",
		"system:configure",
		"reports:generate",
		"reports:export",
		"reports:view"
	],
	doctor: [
		"patients:create",
		"patients:read",
		"patients:update",
		"patients:list",
		"appointments:create",
		"appointments:read",
		"appointments:update",
		"appointments:delete",
		"appointments:list",
		"records:create",
		"records:read",
		"records:update",
		"records:list",
		"payments:read",
		"payments:list",
		"immunization:create",
		"immunization:read",
		"immunization:update",
		"prescription:create",
		"prescription:read",
		"prescription:update",
		"growth:create",
		"growth:read",
		"growth:update",
		"reports:generate",
		"reports:view"
	],
	staff: [
		"patients:create",
		"patients:read",
		"patients:update",
		"patients:list",
		"appointments:create",
		"appointments:read",
		"appointments:update",
		"appointments:delete",
		"appointments:list",
		"records:read",
		"records:list",
		"staff:read",
		"payments:create",
		"payments:read",
		"payments:update",
		"payments:list",
		"immunization:read",
		"prescription:read",
		"growth:read",
		"reports:view"
	],
	patient: [
		"appointments:create",
		"appointments:read",
		"records:read",
		"payments:read",
		"immunization:read",
		"prescription:read",
		"growth:read"
	]
};

const roleDisplayNames: Record<Role, string> = {
	admin: "Administrator",
	doctor: "Doctor",
	staff: "Staff Member",
	patient: "Patient"
};

const roleColors: Record<Role, string> = {
	admin: "bg-red-500",
	doctor: "bg-blue-500",
	staff: "bg-green-500",
	patient: "bg-purple-500"
};

export function useAuth(): UseAuthReturn {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Session query
	const { data: session, isLoading } = useQuery({
		queryKey: ["auth", "session"],
		queryFn: async () => {
			const { data, error } = await authClient.getSession();
			if (error) throw new Error(error.message);
			return data as Session;
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
		refetchOnMount: true
	});

	const user = session?.user ?? null;
	const isAuthenticated = !!user;

	// --- Role & Permission Checks ---

	const hasRole = (role: Role | Role[]): boolean => {
		if (!isAuthenticated || !user) return false;
		const rolesToCheck = Array.isArray(role) ? role : [role];
		return rolesToCheck.includes(user.role as Role);
	};

	const hasPermission = (permission: Permission): boolean => {
		if (!isAuthenticated || !user) return false;
		const userRole = user.role as Role;
		const permissions = rolePermissions[userRole] || [];
		return permissions.includes(permission);
	};

	const hasAnyPermission = (permissions: Permission[]): boolean => {
		return permissions.some(permission => hasPermission(permission));
	};

	const hasAllPermissions = (permissions: Permission[]): boolean => {
		return permissions.every(permission => hasPermission(permission));
	};

	const getRoleDisplayName = (): string => {
		if (!user) return "Unknown";
		return roleDisplayNames[user.role as Role] || user.role || "Unknown";
	};

	const getRoleColor = (): string => {
		if (!user) return "bg-gray-500";
		return roleColors[user.role as Role] || "bg-gray-500";
	};

	// --- Auth Actions ---

	const signInMutation = useMutation({
		mutationFn: async (credentials: LoginCredentials) => {
			const { error } = await authClient.signIn.email({
				email: credentials.email,
				password: credentials.password,
				rememberMe: credentials.rememberMe
			});
			if (error) throw new Error(error.message);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Welcome back!");
			navigate({ to: "/auth/dashboard" });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to sign in");
		}
	});

	const signOutMutation = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.signOut({});
			if (error) throw new Error(error.message);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Signed out successfully");
			navigate({ to: "/auth/$path", params: { path: "sign-in" } });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to sign out");
		}
	});

	const updateProfileMutation = useMutation({
		mutationFn: async (data: UpdateProfileData) => {
			const { error } = await authClient.updateUser(data);
			if (error) throw new Error(error.message);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Profile updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update profile");
		}
	});

	const signIn = async (credentials: LoginCredentials): Promise<void> => {
		await signInMutation.mutateAsync(credentials);
	};

	const signOut = async (): Promise<void> => {
		await signOutMutation.mutateAsync();
	};

	const updateProfile = async (data: UpdateProfileData): Promise<void> => {
		await updateProfileMutation.mutateAsync(data);
	};

	return {
		// State
		user,
		session: session as Session | null,
		isLoading,
		isAuthenticated,

		// Role & Permissions
		hasRole,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		getRoleDisplayName,
		getRoleColor,

		// Actions
		signIn,
		signOut,
		updateProfile,

		// Loading states
		isSigningIn: signInMutation.isPending,
		isSigningOut: signOutMutation.isPending,
		isUpdatingProfile: updateProfileMutation.isPending
	};
}
