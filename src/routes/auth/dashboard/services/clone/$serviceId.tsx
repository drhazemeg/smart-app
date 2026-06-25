import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cloneServiceMutation } from "@/features/services/api/mutations";
import { serviceByIdOptions } from "@/features/services/api/queries";
import { Route as ServiceDetailRoute } from "@/routes/auth/dashboard/services/$serviceId";

export const Route = createFileRoute("/auth/dashboard/services/clone/$serviceId")({
	component: CloneServicePage,
	pendingComponent: () => <CloneServiceSkeleton />,
	loader: async ({ params }) => {
		try {
			return await serviceByIdOptions(params.serviceId);
		} catch {
			throw notFound();
		}
	}
});

function CloneServicePage() {
	const { serviceId } = Route.useParams();
	const navigate = useNavigate();
	const { data } = useSuspenseQuery(serviceByIdOptions(serviceId));

	const service = data?.service;

	if (!service) {
		throw notFound();
	}

	const cloneMutation = useMutation({
		...cloneServiceMutation,
		onSuccess: cloned => {
			toast.success(`Service "${cloned.serviceName}" cloned successfully`);
			navigate({ to: `/dashboard/services/${cloned.id}` });
		},
		onError: () => {
			toast.error("Failed to clone service");
		}
	});

	const handleClone = () => {
		cloneMutation.mutate({ id: serviceId });
	};

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
					<h1 className='font-bold font-serif text-2xl text-sea-ink'>Clone Service</h1>
					<p className='text-sea-ink-soft text-sm'>Create a copy of "{service.serviceName}"</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Copy className='h-5 w-5 text-lagoon' />
						Confirm Clone
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='rounded-lg bg-sand/50 p-4'>
						<p className='text-muted-foreground text-sm'>
							You are about to create a copy of the following service:
						</p>
						<div className='mt-2 space-y-1'>
							<p className='font-medium'>{service.serviceName}</p>
							<p className='text-muted-foreground text-sm'>
								Category: {service.category || "Uncategorized"} • Price: ${service.price?.toFixed(2)}
							</p>
							<p className='text-muted-foreground text-sm'>
								Duration: {service.duration || 30} minutes • Status:{" "}
								{service.isAvailable ? "Available" : "Unavailable"}
							</p>
						</div>
					</div>

					<div className='flex gap-2 pt-4'>
						<Button
							className='gap-2 bg-lagoon hover:bg-lagoon-deep'
							disabled={cloneMutation.isPending}
							onClick={handleClone}
						>
							{cloneMutation.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
							Clone Service
						</Button>
						<Link
							params={{ serviceId }}
							to={ServiceDetailRoute.id}
						>
							<Button variant='outline'>Cancel</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function CloneServiceSkeleton() {
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
					<Skeleton className='h-32 w-full' />
					<div className='flex gap-2'>
						<Skeleton className='h-10 w-36' />
						<Skeleton className='h-10 w-24' />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
