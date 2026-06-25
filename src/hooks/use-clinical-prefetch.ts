/**
 * Prefetch strategy hook for clinical workflows
 *
 * Anticipates common user journeys in clinic operations:
 * - Patient list → Patient detail → Medical records → Appointments
 * - Appointment list → Appointment detail → Patient detail
 * - Reduces perceived latency by pre-loading likely next steps
 *
 * @example
 * ```tsx
 * function PatientsPage() {
 *   const { prefetchPatientWorkflow } = useClinicalPrefetch();
 *   const { data } = useSuspenseQuery(...);
 *
 *   return (
 *     <TableRow
 *       onMouseEnter={() => prefetchPatientWorkflow(patient.id)}
 *     >
 *       ...
 *     </TableRow>
 *   );
 * }
 * ```
 */

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { getAppointmentByIdOptions, getPatientAppointmentsOptions } from "@/functions/queries";
import { getPatientOptions, getPatientRecordsOptions, listPatientsOptions } from "@/functions/queries/patient";

export const useClinicalPrefetch = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	/**
	 * Prefetch entire patient detail workflow
	 * - Patient data
	 * - Patient's medical records
	 * - Patient's appointments
	 * - Routes to related detail pages
	 */
	const prefetchPatientWorkflow = useCallback(
		(patientId: string, clinicId?: string) => {
			try {
				// Prefetch patient detail data
				queryClient.prefetchQuery(getPatientOptions(patientId));

				// Prefetch patient's medical records
				queryClient.prefetchQuery(
					getPatientRecordsOptions({
						patientId,
						limit: 10,
						offset: 0
					})
				);

				// Prefetch patient's appointments if clinic context is available
				if (clinicId) {
					queryClient.prefetchQuery(getPatientAppointmentsOptions(patientId, clinicId, 1, 10));
				}

				// Preload likely route transitions
				router.preloadRoute({
					to: "/auth/dashboard/patients/$patientId",
					params: { patientId }
				});

				router.preloadRoute({
					to: "/auth/dashboard/medical-records/$recordId",
					params: { recordId: "placeholder" } // Will be replaced with actual ID
				});
			} catch (error) {
				console.warn("[Prefetch] Failed to prefetch patient workflow:", error);
				// Silently fail - prefetching is a nice-to-have
			}
		},
		[queryClient, router]
	);

	/**
	 * Prefetch entire appointment detail workflow
	 * - Appointment data
	 * - Associated patient data
	 * - Routes to related pages
	 */
	const prefetchAppointmentWorkflow = useCallback(
		(appointmentId: string, clinicId: string) => {
			try {
				// Prefetch appointment detail
				queryClient.prefetchQuery(getAppointmentByIdOptions(appointmentId, clinicId));

				// Note: You'll need to add a query function to fetch appointment details
				// which includes the patientId, then prefetch that patient's data
				// This is pseudo-code until you implement getAppointmentByIdOptions
				// to return the patient ID

				// Preload appointment detail route
				router.preloadRoute({
					to: "/auth/dashboard/appointments/$id",
					params: { id: appointmentId }
				});
			} catch (error) {
				console.warn("[Prefetch] Failed to prefetch appointment workflow:", error);
			}
		},
		[queryClient, router]
	);

	/**
	 * Prefetch dashboard overview data
	 * - Summary statistics
	 * - Today's appointments
	 * - Recent patients
	 */
	const prefetchDashboardWorkflow = useCallback(() => {
		try {
			// Prefetch patients list (common first navigation)
			queryClient.prefetchQuery(listPatientsOptions({ limit: 20, offset: 0 }));

			// Preload commonly accessed routes from dashboard
			router.preloadRoute({
				to: "/auth/dashboard/patients"
			});

			router.preloadRoute({
				to: "/auth/dashboard/appointments"
			});

			router.preloadRoute({
				to: "/auth/dashboard/medical-records"
			});
		} catch (error) {
			console.warn("[Prefetch] Failed to prefetch dashboard workflow:", error);
		}
	}, [queryClient, router]);

	/**
	 * Generic prefetch for any list page
	 * Useful for "pagination" or "load more" workflows
	 */
	const prefetchListPage = useCallback(
		(queryOptions: Parameters<typeof queryClient.prefetchQuery>[0], routePath: string) => {
			try {
				queryClient.prefetchQuery(queryOptions);
				router.preloadRoute({ to: routePath });
			} catch (error) {
				console.warn("[Prefetch] Failed to prefetch list page:", error);
			}
		},
		[queryClient, router]
	);

	return {
		prefetchPatientWorkflow,
		prefetchAppointmentWorkflow,
		prefetchDashboardWorkflow,
		prefetchListPage
	};
};
