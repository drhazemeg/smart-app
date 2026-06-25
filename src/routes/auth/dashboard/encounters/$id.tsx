// routes/_auth/dashboard/encounters/$id.tsx
import { createFileRoute } from "@tanstack/react-router";
import { EncounterViewPage } from "@/features/encounter/components/EncounterViewPage";

export const Route = createFileRoute("/auth/dashboard/encounters/$id")({
	component: () => {
		const { id } = Route.useParams();
		return <EncounterViewPage encounterId={id} />;
	}
});
