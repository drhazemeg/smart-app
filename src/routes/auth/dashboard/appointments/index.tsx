// routes/_auth/dashboard/appointments/index.tsx

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Calendar, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAppointmentsQueryOptions } from "@/features/appointment/api/queries";
import type { Appointment } from "@/features/appointment/api/types";
import { useClinic } from "@/hooks/use-clinic";
import { formatDate } from "@/lib/formDate";

const statusConfig: Record<
	string,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
	PENDING: { label: "Pending", variant: "secondary" },
	CONFIRMED: { label: "Confirmed", variant: "default" },
	COMPLETED: { label: "Completed", variant: "default" },
	CANCELLED: { label: "Cancelled", variant: "destructive" },
	NO_SHOW: { label: "No Show", variant: "outline" }
};

export const Route = createFileRoute("/auth/dashboard/appointments/")({
	component: AppointmentsPage,
	pendingComponent: () => <AppointmentsSkeleton />
});

function AppointmentsPage() {
	// Get clinic ID from context or hook
	const { clinicId, isLoading: clinicLoading } = useClinic();
	const router = useRouter();

	// Prepare query options so the hook is always called in the same order.
	const queryOptions = getAppointmentsQueryOptions({
		clinicId: clinicId || "",
		page: 1,
		limit: 20
	});

	// Always call the hook (hooks must be called in the same order). Use enabled
	// flag to prevent fetching while clinic or clinicId is not ready.
	const { data } = useSuspenseQuery({
		...queryOptions
	});

	// Handle loading state
	if (clinicLoading) {
		return <AppointmentsSkeleton />;
	}

	// Handle missing clinic
	if (!clinicId) {
		return (
			<div className='flex h-100 items-center justify-center'>
				<div className='text-center'>
					<p className='text-muted-foreground'>No clinic selected</p>
					<Button
						className='mt-4'
						onClick={() => router.navigate({ to: "/auth/$path", params: { path: "clinics" } })}
						variant='outline'
					>
						Select a clinic
					</Button>
				</div>
			</div>
		);
	}

	// Extract appointments and total from the response
	const appointments = data?.appointments || [];
	const total = data?.total || 0;

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Appointments</h1>
					<p className='text-sea-ink-soft text-sm'>Manage patient appointments</p>
				</div>
				<div className='flex gap-2'>
					<Link to='/auth/dashboard/appointments/today'>
						<Button
							className='gap-2'
							variant='outline'
						>
							<Clock className='h-4 w-4' />
							Today
						</Button>
					</Link>
					<Link to='/auth/dashboard/appointments/new'>
						<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
							<Plus className='h-4 w-4' />
							New Appointment
						</Button>
					</Link>
				</div>
			</div>

			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Calendar className='h-5 w-5 text-lagoon' />
						All Appointments
						<Badge
							className='ml-2'
							variant='secondary'
						>
							{total}
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Patient</TableHead>
								<TableHead>Doctor</TableHead>
								<TableHead>Date & Time</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{appointments.map((apt: Appointment) => (
								<TableRow key={apt.id}>
									<TableCell>
										<p className='font-medium'>
											{apt.patient?.firstName} {apt.patient?.lastName}
										</p>
									</TableCell>
									<TableCell>Dr. {apt.doctor?.name || "TBD"}</TableCell>
									<TableCell>
										<div>{formatDate(apt.appointmentDate)}</div>
										<div className='text-muted-foreground text-xs'>{apt.time || "TBD"}</div>
									</TableCell>
									<TableCell>
										<Badge
											className='capitalize'
											variant='outline'
										>
											{apt.type?.toLowerCase() || "General"}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={statusConfig[apt.status]?.variant || "secondary"}>
											{statusConfig[apt.status]?.label || apt.status}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										<Link
											params={{ id: apt.id }}
											to='/auth/dashboard/appointments/$id'
										>
											<Button
												size='sm'
												variant='ghost'
											>
												View
											</Button>
										</Link>
									</TableCell>
								</TableRow>
							))}
							{appointments.length === 0 && (
								<TableRow>
									<TableCell
										className='py-8 text-center text-muted-foreground'
										colSpan={6}
									>
										No appointments found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function AppointmentsSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-40' />
					<Skeleton className='mt-1 h-4 w-48' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-24' />
					<Skeleton className='h-10 w-36' />
				</div>
			</div>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						{["item-1", "item-2", "item-3", "item-4", "item-5"].map(key => (
							<Skeleton
								className='h-12 w-full'
								key={key}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
