// hooks/useClinic.ts
import { useParams } from "@tanstack/react-router";

export function useClinic() {
	// Use the path definition matching your route, e.g., '/clinics/$clinicId'
	// This is type-safe and handles URL changes automatically.
	// The route params expose an `id` field; alias it to `clinicId` for clarity.
	const { id: clinicId } = useParams({ strict: false });

	return {
		clinicId,
		isLoading: false
	};
}
