import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Edit, Loader2, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AlertModal } from "@/components/modal/alertModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteServiceMutation } from "@/features/services/api/mutations";
import { serviceByIdOptions } from "@/features/services/api/queries";
import { categoryColors, categoryIcons } from "@/features/services/constants/service-options";

export const Route = createFileRoute("/auth/dashboard/services/$serviceId")({
	component: ServiceDetailPage,
	pendingComponent: () => <ServiceDetailSkeleton />,
	loader: async ({ params }) => {
		try {
			return await serviceByIdOptions(params.serviceId);
		} catch {
			throw notFound();
		}
	}
});

function ServiceDetailPage() {
	const { serviceId } = Route.useParams();
	const { data } = useSuspenseQuery(serviceByIdOptions(serviceId));
	const [deleteOpen, setDeleteOpen] = useState(false);

	const service = data?.service;

	if (!service) {
		throw notFound();
	}

	const category = service.category || "OTHER";
	const color = categoryColors[category] || "#6b7280";
	const icon = categoryIcons[category] || "📌";

	const deleteService = useMutation({
		...deleteServiceMutation,
		onSuccess: () => {
			toast.success("Service deleted successfully");
			// Navigate back to services list
			window.history.back();
		},
		onError: () => {
			toast.error("Failed to delete service");
		}
	});

	const handleDelete = async () => {
		deleteService.mutate(serviceId);
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex items-center gap-4'>
					<Link to='/auth/dashboard/services'>
						<Button
							size='icon'
							variant='ghost'
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<div className='flex items-center gap-3'>
							<div
								className='flex h-10 w-10 items-center justify-center rounded-lg text-xl'
								style={{ backgroundColor: `${color}20` }}
							>
								<span style={{ color }}>{icon}</span>
							</div>
							<div>
								<h1 className='font-bold font-serif text-2xl text-sea-ink'>{service.serviceName}</h1>
								<div className='flex flex-wrap items-center gap-2 text-muted-foreground text-sm'>
									<Badge
										style={{
											backgroundColor: `${color}20`,
											color,
											borderColor: `${color}40`
										}}
									>
										{service.category || "Uncategorized"}
									</Badge>
									<span>•</span>
									<span>Created {new Date(service.createdAt).toLocaleDateString()}</span>
									{service.isDeleted && (
										<>
											<span>•</span>
											<Badge
												className='text-amber-500'
												variant='outline'
											>
												Archived
											</Badge>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className='flex gap-2'>
					<Link
						params={{ serviceId }}
						to='/auth/dashboard/services/$serviceId/edit'
					>
						<Button
							className='gap-2'
							variant='outline'
						>
							<Edit className='h-4 w-4' />
							Edit
						</Button>
					</Link>
					<Button
						className='gap-2'
						disabled={deleteService.isPending}
						onClick={() => setDeleteOpen(true)}
						variant='destructive'
					>
						{deleteService.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
						<Trash2 className='h-4 w-4' />
						Delete
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Main Info */}
				<div className='space-y-6 lg:col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Service Details</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div>
									<p className='text-muted-foreground text-sm'>Price</p>
									<p className='font-bold text-2xl text-lagoon-deep'>
										${service.price?.toFixed(2) ?? "0.00"}
									</p>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Duration</p>
									<p className='flex items-center gap-2 font-medium text-lg'>
										<Clock className='h-5 w-5 text-muted-foreground' />
										{service.duration || 30} minutes
									</p>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Status</p>
									<Badge variant={service.isAvailable ? "default" : "destructive"}>
										{service.isAvailable ? "Available" : "Unavailable"}
									</Badge>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Category</p>
									<Badge
										style={{
											backgroundColor: `${color}20`,
											color,
											borderColor: `${color}40`
										}}
									>
										{service.category || "Uncategorized"}
									</Badge>
								</div>
							</div>

							<div>
								<p className='text-muted-foreground text-sm'>Description</p>
								<p className='mt-1 text-foreground'>
									{service.description || "No description provided"}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className='space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2'>
							<Button
								className='w-full justify-start gap-2'
								variant='outline'
							>
								<Calendar className='h-4 w-4' />
								Schedule Appointment
							</Button>
							<Button
								className='w-full justify-start gap-2'
								variant='outline'
							>
								<Package className='h-4 w-4' />
								View Related Appointments
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Service Stats</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2'>
							<div className='flex justify-between border-b pb-2'>
								<span className='text-muted-foreground text-sm'>Appointments</span>
								<span className='font-medium'>0</span>
							</div>
							<div className='flex justify-between border-b pb-2'>
								<span className='text-muted-foreground text-sm'>Revenue</span>
								<span className='font-medium'>$0.00</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground text-sm'>Popularity</span>
								<span className='font-medium'>-</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Delete Modal */}
			<AlertModal
				confirmText='Delete'
				description={`Are you sure you want to delete "${service.serviceName}"? This action cannot be undone and will remove all associated appointments.`}
				isOpen={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={handleDelete}
				title='Delete Service'
				variant='destructive'
			/>
		</div>
	);
}

function ServiceDetailSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Skeleton className='h-10 w-10' />
					<div>
						<Skeleton className='h-7 w-48' />
						<Skeleton className='mt-1 h-4 w-32' />
					</div>
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-24' />
					<Skeleton className='h-10 w-24' />
				</div>
			</div>
			<div className='grid gap-6 lg:grid-cols-3'>
				<div className='lg:col-span-2'>
					<Skeleton className='h-64 w-full' />
				</div>
				<div className='space-y-6'>
					<Skeleton className='h-48 w-full' />
					<Skeleton className='h-48 w-full' />
				</div>
			</div>
		</div>
	);
}
