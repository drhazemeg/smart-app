// src/lib/clinic-utils.ts

import { getQueryClient } from "./query-client";

const CLINIC_ID_STORAGE_KEY = "clinic-id";
const CLINIC_ID_QUERY_KEY = ["clinic", "current"];

/**
 * Get the current clinic ID
 */
export async function getClinicId(): Promise<string> {
	// 1. Check localStorage first (client-side only)
	if (typeof window !== "undefined") {
		const storedId = localStorage.getItem(CLINIC_ID_STORAGE_KEY);
		if (storedId) {
			return storedId;
		}
	}

	// 2. Check query cache
	const queryClient = getQueryClient();
	const cachedClinicId = queryClient.getQueryData<string>(CLINIC_ID_QUERY_KEY);
	if (cachedClinicId) {
		return cachedClinicId;
	}

	// 3. Check environment variable
	const envClinicId = import.meta.env.VITE_DEFAULT_CLINIC_ID || process.env.DEFAULT_CLINIC_ID;
	if (envClinicId) {
		return envClinicId;
	}

	// 4. Fallback
	console.warn("No clinic ID found, using fallback");
	return "default-clinic-id";
}

/**
 * Set the current clinic ID
 */
export function setClinicId(clinicId: string): void {
	if (!clinicId) {
		throw new Error("Clinic ID is required");
	}

	if (typeof window !== "undefined") {
		localStorage.setItem(CLINIC_ID_STORAGE_KEY, clinicId);
	}

	const queryClient = getQueryClient();
	queryClient.setQueryData(CLINIC_ID_QUERY_KEY, clinicId);
}

/**
 * Clear the current clinic ID
 */
export function clearClinicId(): void {
	if (typeof window !== "undefined") {
		localStorage.removeItem(CLINIC_ID_STORAGE_KEY);
	}

	const queryClient = getQueryClient();
	queryClient.removeQueries({ queryKey: CLINIC_ID_QUERY_KEY });
}
