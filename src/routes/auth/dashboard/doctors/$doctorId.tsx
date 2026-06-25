import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/dashboard/doctors/$doctorId")({
	component: RouteComponent
});

function RouteComponent() {
	return <div>Hello "/dashboard/doctors/$doctorId"!</div>;
}
