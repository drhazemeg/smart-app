// routes/_auth/dashboard/encounters/new.tsx
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { EncounterForm } from "@/features/encounter/components/EncounterForm";

export const Route = createFileRoute("/auth/dashboard/encounters/new")({
	component: NewEncounterPage
});

function NewEncounterPage() {
	const search = useSearch({ from: "/auth/dashboard/encounters/new" }) as {
		patientId?: string;
		appointmentId?: string;
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold text-2xl md:text-3xl'>New Encounter</h1>
				<p className='text-muted-foreground text-sm'>Create a new patient encounter</p>
			</div>
			<EncounterForm
				initialData={null}
				pageTitle='Create New Encounter'
				patientId={search.patientId}
			/>
		</div>
	);
}
