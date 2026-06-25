// routes/_auth/dashboard/encounters/$id.edit.tsx

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { encounterByIdOptions } from "@/features/encounter/api/querries";
import { EncounterForm } from "@/features/encounter/components/EncounterForm";

export const Route = createFileRoute("/auth/dashboard/encounters/$id/edit")({
	component: EditEncounterPage
});

function EditEncounterPage() {
	const { id } = Route.useParams();
	const clinicId = "current-clinic-id";
	const { data } = useSuspenseQuery(encounterByIdOptions(id, clinicId));

	if (!data?.success || !data?.encounter) {
		return null;
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold text-2xl md:text-3xl'>Edit Encounter</h1>
				<p className='text-muted-foreground text-sm'>Update encounter details</p>
			</div>
			<EncounterForm
				initialData={data.encounter}
				pageTitle='Edit Encounter'
			/>
		</div>
	);
}
