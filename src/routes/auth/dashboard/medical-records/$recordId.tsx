import { createFileRoute } from "@tanstack/react-router";
import { MedicalRecordViewPage } from "@/features/records/components/MedicalRecordViewPage";

export const Route = createFileRoute("/auth/dashboard/medical-records/$recordId")({
	component: () => {
		const { recordId } = Route.useParams();
		return <MedicalRecordViewPage recordId={recordId} />;
	}
});
