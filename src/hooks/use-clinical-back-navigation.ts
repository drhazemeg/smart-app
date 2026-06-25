/**
 * Smart back navigation hook for clinical workflows
 *
 * Features:
 * - Prefers browser history when available
 * - Falls back to predictable route based on current location
 * - Prevents disorienting navigation in medical contexts
 *
 * @example
 * ```tsx
 * function PatientDetail() {
 *   const { goBack } = useClinicalBackNavigation();
 *   return (
 *     <Button onClick={() => goBack()}>
 *       <ArrowLeft className="h-4 w-4" />
 *     </Button>
 *   );
 * }
 * ```
 */

import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

interface UseClinicalBackNavigationOptions {
	/** Fallback path if history is empty */
	fallbackPath?: string;
}

export const useClinicalBackNavigation = (options?: UseClinicalBackNavigationOptions) => {
	const navigate = useNavigate();
	const location = useLocation();

	/**
	 * Navigate back with intelligent fallback
	 * 1. Tries browser history first (best UX)
	 * 2. Falls back to provided path
	 * 3. Falls back to inferred parent route
	 */
	const goBack = useCallback(
		(overrideFallbackPath?: string) => {
			// Try browser history first
			if (window.history.length > 1) {
				window.history.back();
				return;
			}

			const fallbackToUse = overrideFallbackPath ?? options?.fallbackPath;

			// Use provided fallback
			if (fallbackToUse) {
				navigate({ to: fallbackToUse });
				return;
			}

			// Smart fallback: infer parent route from current pathname
			const pathname = location.pathname;

			// Route hierarchy for fallback inference
			const pathHierarchy: Array<{
				pattern: RegExp;
				fallback: string;
			}> = [
				{
					pattern: /^\/dashboard\/patients\/[^/]+$/,
					fallback: "/dashboard/patients"
				},
				{
					pattern: /^\/dashboard\/appointments\/[^/]+/,
					fallback: "/dashboard/appointments"
				},
				{
					pattern: /^\/dashboard\/medical-records\/[^/]+/,
					fallback: "/dashboard/medical-records"
				},
				{
					pattern: /^\/dashboard\/growth\/[^/]+/,
					fallback: "/dashboard/growth"
				},
				{
					pattern: /^\/dashboard\/doctors\/[^/]+/,
					fallback: "/dashboard/doctors"
				},
				{
					pattern: /^\/dashboard\/services\/[^/]+/,
					fallback: "/dashboard/services"
				}
			];

			const matchedFallback = pathHierarchy.find(({ pattern }) => pattern.test(pathname))?.fallback;

			const finalFallback = matchedFallback ?? "/dashboard";

			navigate({ to: finalFallback });
		},
		[navigate, location.pathname, options?.fallbackPath]
	);

	return { goBack };
};
