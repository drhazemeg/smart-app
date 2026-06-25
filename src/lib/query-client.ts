// src/lib/query-client.ts

import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============================================================
// Environment Check
// ============================================================

// Simple SSR detection without EnvironmentManager
function isServer(): boolean {
	return typeof window === "undefined";
}

// ============================================================
// Error Types
// ============================================================

export class ApiError extends Error {
	message: string;
	status?: number;
	code?: string;

	constructor(message: string, status?: number, code?: string) {
		super(message);
		this.message = message;
		this.status = status;
		this.code = code;
		this.name = "ApiError";
	}
}

export class ValidationError extends ApiError {
	errors?: Record<string, string[]>;

	constructor(message: string, errors?: Record<string, string[]>) {
		super(message, 400, "VALIDATION_ERROR");
		this.errors = errors;
		this.name = "ValidationError";
	}
}

export class AuthError extends ApiError {
	constructor(message: string, status?: number) {
		super(message, status || 401, "AUTH_ERROR");
		this.name = "AuthError";
	}
}

// ============================================================
// Error Helpers
// ============================================================

function isAuthError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}
	const message = error.message.toLowerCase();
	return (
		message.includes("unauthorized") ||
		message.includes("forbidden") ||
		message.includes("401") ||
		message.includes("403") ||
		error instanceof AuthError
	);
}

function isValidationError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}
	return error.message.toLowerCase().includes("validation") || error instanceof ValidationError;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unexpected error occurred";
}

// ============================================================
// Query Client Configuration
// ============================================================

const DEFAULT_STALE_TIME = 1000 * 60 * 2; // 2 minutes
const DEFAULT_GC_TIME = 1000 * 60 * 5; // 5 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000; // 1 second
const MAX_RETRY_DELAY = 30_000; // 30 seconds

function createQueryClientConfig() {
	return {
		defaultOptions: {
			queries: {
				staleTime: DEFAULT_STALE_TIME,
				gcTime: DEFAULT_GC_TIME,
				retry: (failureCount: number, error: unknown) => {
					// Don't retry auth or validation errors
					if (isAuthError(error) || isValidationError(error)) {
						return false;
					}
					return failureCount < MAX_RETRIES;
				},
				retryDelay: (attemptIndex: number) => Math.min(RETRY_DELAY_BASE * 2 ** attemptIndex, MAX_RETRY_DELAY),
				refetchOnWindowFocus: false,
				refetchOnReconnect: true,
				refetchOnMount: true,
				throwOnError: false,
				placeholderData: (previousData: unknown) => previousData
			},
			mutations: {
				retry: 1,
				retryDelay: RETRY_DELAY_BASE
			}
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				// Only show errors for queries that had data (background refetch errors)
				if (query.state.data === undefined) {
					return;
				}

				const errorMessage = getErrorMessage(error);

				// Don't show toast for auth errors (handled by auth flow)
				if (isAuthError(error)) {
					console.warn("Auth error:", errorMessage);
					return;
				}

				// Don't show toast for validation errors (handled by form)
				if (isValidationError(error)) {
					console.warn("Validation error:", errorMessage);
					return;
				}

				// Show toast for other errors with retry action
				toast.error(`Error: ${errorMessage}`, {
					duration: 4000,
					action: {
						label: "Retry",
						onClick: () => query.fetch()
					}
				});
			},
			onSuccess: data => {
				// Only log in development
				if (process.env.NODE_ENV === "development") {
					console.debug("Query succeeded:", data);
				}
			}
		})
	};
}

// ============================================================
// Query Client Singleton
// ============================================================

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (isServer()) {
		// Server: Always create a new client to isolate concurrent requests
		return new QueryClient(createQueryClientConfig());
	}

	// Client: Create a singleton if it doesn't exist
	if (!browserQueryClient) {
		browserQueryClient = new QueryClient(createQueryClientConfig());
	}
	return browserQueryClient;
}

// ============================================================
// Utility Functions
// ============================================================

const getClient = () => getQueryClient();

export const invalidateQueries = (queryKey: string[]) => getClient().invalidateQueries({ queryKey });

export const prefetchQuery = async <T>(queryKey: string[], queryFn: () => Promise<T>) =>
	getClient().prefetchQuery({ queryKey, queryFn });

export const getQueryData = <T>(queryKey: string[]): T | undefined => getClient().getQueryData<T>(queryKey);

export const setQueryData = <T>(queryKey: string[], data: T | ((old: T | undefined) => T)) =>
	getClient().setQueryData(queryKey, data);

export const removeQueries = (queryKey: string[]) => getClient().removeQueries({ queryKey });

export const resetQueryClient = () => {
	if (browserQueryClient) {
		browserQueryClient.clear();
	}
};

// ============================================================
// Query Keys Factory
// ============================================================

export const queryKeys = {
	dashboard: {
		all: ["dashboard"] as const,
		stats: () => [...queryKeys.dashboard.all, "stats"] as const,
		appointments: () => [...queryKeys.dashboard.all, "appointments"] as const,
		patients: () => [...queryKeys.dashboard.all, "patients"] as const,
		growth: () => [...queryKeys.dashboard.all, "growth"] as const,
		vaccinations: () => [...queryKeys.dashboard.all, "vaccinations"] as const
	} as const,

	patients: {
		all: ["patients"] as const,
		details: (id: string) => [...queryKeys.patients.all, "details", id] as const,
		list: (filters?: Record<string, unknown>) => [...queryKeys.patients.all, "list", filters] as const,
		growth: (id: string) => [...queryKeys.patients.all, "growth", id] as const,
		appointments: (id: string) => [...queryKeys.patients.all, "appointments", id] as const,
		medicalRecords: (id: string) => [...queryKeys.patients.all, "medical-records", id] as const
	} as const,

	appointments: {
		all: ["appointments"] as const,
		today: (clinicId?: string) => [...queryKeys.appointments.all, "today", clinicId] as const,
		upcoming: (clinicId?: string) => [...queryKeys.appointments.all, "upcoming", clinicId] as const,
		details: (id: string) => [...queryKeys.appointments.all, "details", id] as const,
		byDate: (date: string) => [...queryKeys.appointments.all, "by-date", date] as const,
		list: (filters?: Record<string, unknown>) => [...queryKeys.appointments.all, "list", filters] as const
	} as const,

	billing: {
		all: ["billing"] as const,
		payments: () => [...queryKeys.billing.all, "payments"] as const,
		invoices: () => [...queryKeys.billing.all, "invoices"] as const,
		insurance: () => [...queryKeys.billing.all, "insurance"] as const,
		details: (id: string) => [...queryKeys.billing.all, "details", id] as const
	} as const,

	staff: {
		all: ["staff"] as const,
		doctors: () => [...queryKeys.staff.all, "doctors"] as const,
		nurses: () => [...queryKeys.staff.all, "nurses"] as const,
		details: (id: string) => [...queryKeys.staff.all, "details", id] as const,
		list: (filters?: Record<string, unknown>) => [...queryKeys.staff.all, "list", filters] as const
	} as const,

	inventory: {
		all: ["inventory"] as const,
		drugs: () => [...queryKeys.inventory.all, "drugs"] as const,
		supplies: () => [...queryKeys.inventory.all, "supplies"] as const,
		lowStock: () => [...queryKeys.inventory.all, "low-stock"] as const,
		details: (id: string) => [...queryKeys.inventory.all, "details", id] as const
	} as const,

	auth: {
		all: ["auth"] as const,
		session: () => [...queryKeys.auth.all, "session"] as const,
		user: () => [...queryKeys.auth.all, "user"] as const
	} as const,

	services: {
		all: ["services"] as const,
		list: (filters?: Record<string, unknown>) => [...queryKeys.services.all, "list", filters] as const,
		details: (id: string) => [...queryKeys.services.all, "details", id] as const,
		categories: () => [...queryKeys.services.all, "categories"] as const
	} as const
} as const;

// ============================================================
// Type Helpers
// ============================================================

export type QueryKeys = typeof queryKeys;
export type QueryKeyPrefix = keyof QueryKeys;
export function getContext() {
	const queryClient = new QueryClient();

	return {
		queryClient
	};
}
