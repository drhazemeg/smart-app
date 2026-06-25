import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { todaysAppointmentsOptions } from "@/features/appointment/api/queries";
import type { Appointment } from "@/features/appointment/api/types";
import { formatTime } from "@/lib/formDate";

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

export const Route = createFileRoute("/auth/dashboard/appointments/today")({
	component: TodayAppointmentsPage,
	pendingComponent: () => <TodayAppointmentsSkeleton />
});

function TodayAppointmentsPage() {
	const clinicId = "current-clinic-id";

	// FIX: Use the correct function name - todaysAppointmentsOptions
	const { data: appointments } = useSuspenseQuery(todaysAppointmentsOptions({ clinicId }));

	// FIX: data is an array directly, not an object with appointments property
	const todayAppointments = appointments || [];

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Today's Appointments</h1>
					<p className='text-sea-ink-soft text-sm'>
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric"
						})}
					</p>
				</div>
				<Link to='/auth/dashboard/appointments'>
					<Button variant='outline'>View All</Button>
				</Link>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='font-medium text-muted-foreground text-sm'>Total Today</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='font-bold text-2xl'>{todayAppointments.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='font-medium text-muted-foreground text-sm'>Upcoming</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='font-bold text-2xl text-emerald-500'>
							{todayAppointments.filter(
								(a: Appointment) => a.status === "CONFIRMED" || a.status === "PENDING"
							).length || 0}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='font-medium text-muted-foreground text-sm'>Completed</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='font-bold text-2xl text-blue-500'>
							{todayAppointments.filter((a: Appointment) => a.status === "COMPLETED").length || 0}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Clock className='h-5 w-5 text-lagoon' />
						Schedule
					</CardTitle>
				</CardHeader>
				<CardContent>
					{todayAppointments.length > 0 ? (
						<div className='space-y-3'>
							{todayAppointments.map((apt: Appointment) => (
								<div
									className='flex flex-wrap items-center justify-between rounded-lg border p-4 hover:bg-muted/50'
									key={apt.id}
								>
									<div className='flex items-center gap-4'>
										<div className='text-center'>
											<p className='font-semibold text-lg'>
												{formatTime(apt.appointmentDate, apt.time ?? "")}
											</p>
										</div>
										<div>
											<p className='font-medium'>
												{apt.patient?.firstName} {apt.patient?.lastName}
											</p>
											<p className='text-muted-foreground text-sm'>
												Dr. {apt.doctor?.name || "TBD"}
											</p>
										</div>
									</div>
									<div className='flex items-center gap-3'>
										<Badge variant={statusConfig[apt.status]?.variant || "secondary"}>
											{statusConfig[apt.status]?.label || apt.status}
										</Badge>
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
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='py-8 text-center'>
							<Calendar className='mx-auto h-12 w-12 text-muted-foreground/30' />
							<p className='mt-2 text-muted-foreground'>No appointments scheduled for today</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function TodayAppointmentsSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='mt-1 h-4 w-64' />
				</div>
				<Skeleton className='h-10 w-24' />
			</div>
			<div className='grid gap-4 md:grid-cols-3'>
				{["card-1", "card-2", "card-3"].map(key => (
					<Skeleton
						className='h-24 w-full'
						key={key}
					/>
				))}
			</div>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						{["item-1", "item-2", "item-3"].map(key => (
							<Skeleton
								className='h-16 w-full'
								key={key}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
