import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import { appointmentByIdOptions as getAppointmentByIdQueryOptions } from "../api/queries";
import type { Appointment } from "../api/types";
import AppointmentForm from "./appointment-form";

type AppointmentViewPageProps = {
	appointmentId: string;
	clinicId: string;
};

export default function AppointmentViewPage({ appointmentId, clinicId }: AppointmentViewPageProps) {
	if (appointmentId === "new") {
		return (
			<AppointmentForm
				initialData={null}
				pageTitle='Create New Appointment'
			/>
		);
	}

	return (
		<EditAppointmentView
			appointmentId={appointmentId}
			clinicId={clinicId}
		/>
	);
}

function EditAppointmentView({ appointmentId, clinicId }: { appointmentId: string; clinicId: string }) {
	const { data } = useSuspenseQuery(getAppointmentByIdQueryOptions(appointmentId, clinicId));

	if (!data?.success || !data?.appointment) {
		notFound();
	}

	return (
		<AppointmentForm
			initialData={data.appointment as Appointment}
			pageTitle='Edit Appointment'
		/>
	);
}
