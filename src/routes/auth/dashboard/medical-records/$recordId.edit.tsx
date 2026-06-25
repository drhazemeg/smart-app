import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { medicalRecordByIdOptions } from "@/features/records/api/queries";
import { MedicalRecordFormPage } from "@/features/records/components/MedicalRecordFormPage";

export const Route = createFileRoute("/auth/dashboard/medical-records/$recordId/edit")({
	component: EditMedicalRecordPage
});

function EditMedicalRecordPage() {
	const { recordId } = Route.useParams();
	const { data: record } = useSuspenseQuery(medicalRecordByIdOptions(recordId));

	if (!record) {
		return null;
	}

	return (
		<MedicalRecordFormPage
			initialData={record}
			pageTitle='Edit Medical Record'
		/>
	);
}
