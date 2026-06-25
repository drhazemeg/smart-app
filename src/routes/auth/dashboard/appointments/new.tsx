import { createFileRoute } from "@tanstack/react-router";
import AppointmentForm from "@/features/appointment/components/appointment-form";

export const Route = createFileRoute("/auth/dashboard/appointments/new")({
	component: NewAppointmentPage
});

function NewAppointmentPage() {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>New Appointment</h1>
				<p className='text-sea-ink-soft text-sm'>Schedule a new patient appointment</p>
			</div>
			<AppointmentForm
				initialData={null}
				pageTitle='Schedule Appointment'
			/>
		</div>
	);
}
