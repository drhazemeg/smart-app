// products/doctors/components/doctor-view-page.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import { doctorByIdOptions } from "../api/queries";
import type { Doctor } from "../api/types";
import DoctorForm from "./doctor-form";

interface DoctorViewPageProps {
	doctorId: string;
}

export default function DoctorViewPage({ doctorId }: DoctorViewPageProps) {
	if (doctorId === "new") {
		return (
			<DoctorForm
				initialData={null}
				pageTitle='Create New Doctor'
			/>
		);
	}

	return <EditDoctorView doctorId={doctorId} />;
}

function EditDoctorView({ doctorId }: { doctorId: string }) {
	const { data } = useSuspenseQuery(doctorByIdOptions(doctorId));

	if (!data?.success || !data?.doctor) {
		notFound();
	}

	return (
		<DoctorForm
			initialData={data.doctor as Doctor}
			pageTitle='Edit Doctor'
		/>
	);
}
