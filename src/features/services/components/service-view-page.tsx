// products/services/components/service-view-page.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import { serviceByIdOptions } from "../api/queries";
import type { Service } from "../api/types";
import ServiceForm from "./service-form";

interface ServiceViewPageProps {
	serviceId: string;
}

export default function ServiceViewPage({ serviceId }: ServiceViewPageProps) {
	if (serviceId === "new") {
		return (
			<ServiceForm
				initialData={null}
				pageTitle='Create New Service'
			/>
		);
	}

	return <EditServiceView serviceId={serviceId} />;
}

function EditServiceView({ serviceId }: { serviceId: string }) {
	const { data } = useSuspenseQuery(serviceByIdOptions(serviceId));

	if (!data?.success || !data?.service) {
		notFound();
	}

	return (
		<ServiceForm
			initialData={data.service as Service}
			pageTitle='Edit Service'
		/>
	);
}
