import { createFileRoute, notFound } from "@tanstack/react-router";
import z from "zod";
import { PatientResponseSchema } from "#/features/patients";
import PatientDetailPage, { PatientDetailSkeleton } from "@/features/patients/components/PatientView";
import { getPatient } from "@/functions/patient";

export const Route = createFileRoute("/auth/dashboard/patients/$patientId")({
	component: PatientDetailPage,
	pendingComponent: PatientDetailSkeleton,
	loader: async ({ params }) => {
		const patientId = params.patientId;

		if (!patientId) {
			throw notFound();
		}

		try {
			const patient = await getPatient({
				data: { id: patientId }
			});

			const validatedPatient = PatientResponseSchema.parse(patient);
			return { patient: validatedPatient };
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error("Invalid patient data structure:", error.issues);
			}
			throw notFound();
		}
	}
});
