import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serviceByIdOptions } from "@/features/services/api/queries";
import ServiceForm from "@/features/services/components/service-form";
import { Route as ServiceDetailRoute } from "@/routes/auth/dashboard/services/$serviceId";

export const Route = createFileRoute("/auth/dashboard/services/$serviceId/edit")({
	component: EditServicePage,
	pendingComponent: () => <EditServiceSkeleton />,
	loader: async ({ params }) => {
		try {
			return serviceByIdOptions(params.serviceId);
		} catch {
			throw notFound();
		}
	}
});

function EditServicePage() {
	const { serviceId } = Route.useParams();
	const { data } = useSuspenseQuery(serviceByIdOptions(serviceId));

	const service = data?.service;

	if (!service) {
		throw notFound();
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Link
					params={{ serviceId }}
					to={ServiceDetailRoute.id}
				>
					<Button
						size='icon'
						variant='ghost'
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
				</Link>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink'>Edit Service</h1>
					<p className='text-sea-ink-soft text-sm'>Update "{service.serviceName}"</p>
				</div>
			</div>

			<ServiceForm
				initialData={service}
				pageTitle='Edit Service'
			/>
		</div>
	);
}

function EditServiceSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Skeleton className='h-10 w-10' />
				<div>
					<Skeleton className='h-7 w-48' />
					<Skeleton className='mt-1 h-4 w-32' />
				</div>
			</div>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid gap-4 md:grid-cols-2'>
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
					<Skeleton className='h-32 w-full' />
					<Skeleton className='h-10 w-full max-w-xs' />
				</CardContent>
			</Card>
		</div>
	);
}

// Need to import Card for the skeleton
import { Card, CardContent, CardHeader } from "@/components/ui/card";
