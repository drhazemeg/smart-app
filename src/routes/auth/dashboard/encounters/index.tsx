// routes/_auth/dashboard/encounters/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import EncounterListingPage from "@/features/encounter/components/EncounterListing";

export const Route = createFileRoute("/auth/dashboard/encounters/")({
	component: EncounterListingPage
});
