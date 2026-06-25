import { createFileRoute } from "@tanstack/react-router";
import { MedicalRecordsPage } from "@/features/records/components/MedicalRecordsPage";

export const Route = createFileRoute("/auth/dashboard/medical-records/")({
	component: MedicalRecordsPage
});
