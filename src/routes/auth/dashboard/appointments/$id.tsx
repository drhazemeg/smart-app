import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Stethoscope, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment } from "@/features/appointment/api/types";
import { CompleteAppointmentDialog } from "@/features/appointment/components/complete-appointment-dialog";
import { RescheduleAppointmentDialog } from "@/features/appointment/components/reschedule-appointment-dialog";
import { getAppointmentByIdOptions } from "@/functions/queries";
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
export const Route = createFileRoute("/auth/dashboard/appointments/$id")({
	component: AppointmentDetailPage,
	pendingComponent: () => <AppointmentDetailSkeleton />,
	loader: async ({ params, context }) => {
		const clinicId = "current-clinic-id";
		const queryOptions = getAppointmentByIdOptions(params.id, clinicId);

		// Pre-populate cache in loader
		return await context.queryClient.ensureQueryData(queryOptions);
	}
} as const);

function AppointmentDetailPage() {
	const { id: appointmentId } = Route.useParams();
	const clinicId = "current-clinic-id";
	// FIX: Call the query with the correct options
	const { data: appointment } = useSuspenseQuery(getAppointmentByIdOptions(appointmentId, clinicId));

	if (!appointment) {
		throw notFound();
	}

	const apt = appointment as Appointment;
	const status = statusConfig[apt.status] || statusConfig.PENDING;

	const [showReschedule, setShowReschedule] = useState(false);
	const [showComplete, setShowComplete] = useState(false);

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link to='/auth/dashboard/appointments'>
						<Button
							size='icon'
							variant='ghost'
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='font-bold font-serif text-2xl text-sea-ink'>Appointment Details</h1>
						<p className='text-sea-ink-soft text-sm'>View and manage appointment information</p>
					</div>
				</div>
				<div className='flex gap-2'>
					{apt.status !== "COMPLETED" && apt.status !== "CANCELLED" && (
						<>
							<Button
								onClick={() => setShowReschedule(true)}
								variant='outline'
							>
								Reschedule
							</Button>
							<Button onClick={() => setShowComplete(true)}>Complete</Button>
						</>
					)}
				</div>
			</div>

			{/* Content */}
			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Main Info */}
				<div className='space-y-6 lg:col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Appointment Information</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div>
									<p className='text-muted-foreground text-sm'>Status</p>
									<Badge
										className='mt-1'
										variant={status.variant}
									>
										{status.label}
									</Badge>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Type</p>
									<p className='font-medium capitalize'>{apt.type?.toLowerCase() || "General"}</p>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Date</p>
									<p className='font-medium'>{formatDate(apt.appointmentDate)}</p>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Time</p>
									<p className='font-medium'>{apt.time || "TBD"}</p>
								</div>
								<div>
									<p className='text-muted-foreground text-sm'>Duration</p>
									<p className='font-medium'>{apt.durationMinutes || 30} minutes</p>
								</div>
								{apt.appointmentPrice !== undefined && apt.appointmentPrice !== null && (
									<div>
										<p className='text-muted-foreground text-sm'>Price</p>
										<p className='font-medium'>${apt.appointmentPrice}</p>
									</div>
								)}
							</div>
							{apt.reason && (
								<div>
									<p className='text-muted-foreground text-sm'>Reason</p>
									<p className='font-medium'>{apt.reason}</p>
								</div>
							)}
							{apt.note && (
								<div>
									<p className='text-muted-foreground text-sm'>Notes</p>
									<p className='font-medium'>{apt.note}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Patient Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<User className='h-5 w-5 text-lagoon' />
								Patient
							</CardTitle>
						</CardHeader>
						<CardContent>
							{apt.patient ? (
								<div>
									<p className='font-medium'>
										{apt.patient.firstName} {apt.patient.lastName}
									</p>
									{apt.patient.mrn && (
										<p className='text-muted-foreground text-sm'>MRN: {apt.patient.mrn}</p>
									)}
									<Link
										className='mt-2 inline-block'
										params={{ patientId: apt.patient.id }}
										to='/auth/dashboard/patients/$patientId'
									>
										<Button
											size='sm'
											variant='outline'
										>
											View Profile
										</Button>
									</Link>
								</div>
							) : (
								<p className='text-muted-foreground text-sm'>Patient information not available</p>
							)}
						</CardContent>
					</Card>

					{/* Doctor Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Stethoscope className='h-5 w-5 text-lagoon' />
								Doctor
							</CardTitle>
						</CardHeader>
						<CardContent>
							{apt.doctor ? (
								<div>
									<p className='font-medium'>Dr. {apt.doctor.name}</p>
									{apt.doctor.specialty && (
										<p className='text-muted-foreground text-sm'>{apt.doctor.specialty}</p>
									)}
								</div>
							) : (
								<p className='text-muted-foreground text-sm'>Doctor not assigned</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Dialogs */}
			{showComplete && apt && (
				<CompleteAppointmentDialog
					appointment={{
						id: apt.id,
						patient: {
							firstName: apt.patient?.firstName || "Unknown",
							lastName: apt.patient?.lastName || ""
						}
					}}
					onOpenChange={setShowComplete}
					open={showComplete}
				/>
			)}
			{showReschedule && apt && (
				<RescheduleAppointmentDialog
					appointment={{
						id: apt.id,
						doctorId: apt.doctorId,
						clinicId: apt.clinicId,
						patient: {
							firstName: apt.patient?.firstName || "Unknown",
							lastName: apt.patient?.lastName || ""
						}
					}}
					onOpenChange={setShowReschedule}
					open={showReschedule}
				/>
			)}
		</div>
	);
}

function AppointmentDetailSkeleton() {
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
