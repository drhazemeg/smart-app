// products/patients/components/patient-view-page.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import { patientByIdOptions } from "../api/queries";
import type { Patient } from "../api/types";
import PatientForm from "./patient-form";

interface PatientViewPageProps {
	patientId: string;
}

export default function PatientViewPage({ patientId }: PatientViewPageProps) {
	if (patientId === "new") {
		return (
			<PatientForm
				initialData={null}
				pageTitle='Create New Patient'
			/>
		);
	}

	return <EditPatientView patientId={patientId} />;
}

function EditPatientView({ patientId }: { patientId: string }) {
	const { data } = useSuspenseQuery(patientByIdOptions(patientId));

	if (!data?.success || !data?.patient) {
		notFound();
	}

	return (
		<PatientForm
			initialData={data.patient as Patient}
			pageTitle='Edit Patient'
		/>
	);
}
