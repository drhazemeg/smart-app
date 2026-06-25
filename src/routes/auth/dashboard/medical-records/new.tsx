import { createFileRoute, useSearch } from "@tanstack/react-router";
import { MedicalRecordFormPage } from "@/features/records/components/MedicalRecordFormPage";

export const Route = createFileRoute("/auth/dashboard/medical-records/new")({
	component: NewMedicalRecordPage
});

function NewMedicalRecordPage() {
	const search = useSearch({ from: "/auth/dashboard/medical-records/new" }) as {
		patientId?: string;
	};
	return (
		<MedicalRecordFormPage
			initialData={null}
			pageTitle='New Medical Record'
			patientId={search.patientId}
		/>
	);
}
