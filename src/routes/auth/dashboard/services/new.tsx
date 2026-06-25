import { createFileRoute } from "@tanstack/react-router";
import ServiceForm from "@/features/services/components/service-form";

export const Route = createFileRoute("/auth/dashboard/services/new")({
	component: NewServicePage
});

function NewServicePage() {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Add New Service</h1>
				<p className='text-sea-ink-soft text-sm'>Create a new service offering for your clinic</p>
			</div>
			<ServiceForm
				initialData={null}
				pageTitle='Create New Service'
			/>
		</div>
	);
}
