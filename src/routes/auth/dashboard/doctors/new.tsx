import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/dashboard/doctors/new")({
	component: RouteComponent
});

function RouteComponent() {
	return <div>Hello "/dashboard/doctors/new"!</div>;
}
