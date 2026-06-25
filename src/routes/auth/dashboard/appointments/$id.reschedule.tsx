import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { rescheduleAppointmentMutation } from "@/features/appointment/api/mutations";
import { appointmentByIdOptions, getAvailableTimeSlotsQueryOptions } from "@/features/appointment/api/queries";
import type { Appointment } from "@/features/appointment/api/types";
import { formatDate } from "@/utils/formDate";

// ============================================================
// Schema
// ============================================================

const rescheduleSchema = z.object({
	newDate: z.date({ message: "Please select a date" }),
	newTime: z.string().min(1, "Please select a time"),
	reason: z.string().optional()
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

// ============================================================
// Route Definition
// ============================================================

export const Route = createFileRoute("/auth/dashboard/appointments/$id/reschedule")({
	component: RescheduleAppointmentPage,
	pendingComponent: () => <ReschedulePageSkeleton />,
	loader: async ({ params }) => {
		try {
			const clinicId = "current-clinic-id";
			const queryOptions = appointmentByIdOptions(params.id, clinicId);
			return queryOptions;
		} catch {
			throw notFound();
		}
	}
});

// ============================================================
// Main Component
// ============================================================

function RescheduleAppointmentPage() {
	const router = useRouter();
	const { id: appointmentId } = Route.useParams();
	const clinicId = "current-clinic-id";

	// Fetch appointment data
	const { data: response } = useSuspenseQuery(appointmentByIdOptions(appointmentId, clinicId));

	if (!(response?.success && response?.appointment)) {
		throw notFound();
	}

	const appointment = response.appointment as Appointment;
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		appointment.appointmentDate ? new Date(appointment.appointmentDate) : undefined
	);
	const [selectedDoctor] = useState<string>(appointment.doctorId);

	// Fetch available time slots
	const { data: availableSlots, isFetching: isFetchingSlots } = useSuspenseQuery(
		getAvailableTimeSlotsQueryOptions({
			doctorId: selectedDoctor,
			date: selectedDate || new Date(),
			durationMinutes: appointment.durationMinutes || 30,
			clinicId
		})
	);

	const rescheduleMutation = useMutation({
		...rescheduleAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment rescheduled successfully");
			router.navigate({
				to: "/auth/dashboard/appointments/$id",
				params: { id: appointmentId }
			});
		},
		onError: error => {
			toast.error(error.message || "Failed to reschedule appointment");
		}
	});

	const form = useAppForm({
		defaultValues: {
			newDate: appointment.appointmentDate ? new Date(appointment.appointmentDate) : new Date(),
			newTime: appointment.time || "",
			reason: ""
		} as RescheduleFormValues,
		validators: {
			onSubmit: rescheduleSchema
		},
		onSubmit: ({ value }) => {
			rescheduleMutation.mutate({
				appointmentId: appointment.id,
				clinicId: appointment.clinicId,
				newDate: value.newDate,
				newTime: value.newTime,
				reason: value.reason
			});
		}
	});

	const { FormSelectField, FormTextareaField } = useFormFields<RescheduleFormValues>();

	// Format time slots for select
	const timeOptions = (availableSlots || [])
		.filter(slot => slot.available)
		.map((slot: { startTime: string; endTime: string }) => {
			const [startHour, startMinute] = slot.startTime.split(":").map(Number);
			const [endHour, endMinute] = slot.endTime.split(":").map(Number);

			const startDate = new Date();
			startDate.setHours(startHour || 0, startMinute || 0, 0, 0);

			const endDate = new Date();
			endDate.setHours(endHour || 0, endMinute || 0, 0, 0);

			return {
				value: slot.startTime,
				label: `${format(startDate, "hh:mm a")} - ${format(endDate, "hh:mm a")}`
			};
		});

	const isSubmitting = rescheduleMutation.isPending;

	return (
		<div className='mx-auto max-w-4xl space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link
						params={{ id: appointmentId }}
						to='/auth/dashboard/appointments/$id'
					>
						<Button
							size='icon'
							variant='ghost'
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='font-bold text-2xl text-sea-ink'>Reschedule Appointment</h1>
						<p className='text-sea-ink-soft text-sm'>
							{appointment.patient?.firstName} {appointment.patient?.lastName} • Dr.{" "}
							{appointment.doctor?.name || "TBD"}
						</p>
					</div>
				</div>
				<div className='flex items-center gap-2 text-muted-foreground text-sm'>
					<Calendar className='h-4 w-4' />
					<span>
						Current: {formatDate(appointment.appointmentDate)} at {appointment.time}
					</span>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Clock className='h-5 w-5 text-lagoon' />
						Select New Date & Time
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form.Form className='space-y-6'>
							<div className='grid gap-6 md:grid-cols-2'>
								{/* Date Picker */}
								<form.AppField name='newDate'>
									{field => (
										<field.FieldSet>
											<field.FieldLabel>New Date *</field.FieldLabel>
											<div className='rounded-md border'>
												<CalendarComponent
													className='w-full'
													disabled={date => {
														// Disable past dates and dates before today
														const today = new Date();
														today.setHours(0, 0, 0, 0);
														return date < today;
													}}
													mode='single'
													onSelect={date => {
														field.handleChange(date ?? new Date());
														setSelectedDate(date);
														form.setFieldValue("newTime", "");
													}}
													selected={field.state.value}
												/>
											</div>
											<field.FieldError />
										</field.FieldSet>
									)}
								</form.AppField>

								{/* Time Picker */}
								<div className='space-y-4'>
									<FormSelectField
										disabled={!selectedDate || timeOptions.length === 0 || isFetchingSlots}
										label='New Time *'
										name='newTime'
										options={timeOptions}
										placeholder={
											selectedDate
												? isFetchingSlots
													? "Loading available slots..."
													: timeOptions.length === 0
														? "No available slots"
														: "Select time"
												: "Select a date first"
										}
										required
										validators={{
											onBlur: z.string().min(1, "Please select a time")
										}}
									/>

									{/* Current appointment info */}
									<div className='space-y-1 rounded-lg bg-muted/50 p-4'>
										<p className='font-medium text-sm'>Current Appointment</p>
										<p className='text-muted-foreground text-sm'>
											Date: {formatDate(appointment.appointmentDate)}
										</p>
										<p className='text-muted-foreground text-sm'>Time: {appointment.time}</p>
										{appointment.durationMinutes && (
											<p className='text-muted-foreground text-sm'>
												Duration: {appointment.durationMinutes} minutes
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Reason */}
							<FormTextareaField
								label='Reason for Rescheduling (Optional)'
								name='reason'
								placeholder='Please provide a reason for rescheduling...'
								rows={3}
							/>

							{/* Actions */}
							<div className='flex justify-end gap-3 border-t pt-4'>
								<Link
									params={{ id: appointmentId }}
									to='/auth/dashboard/appointments/$id'
								>
									<Button
										type='button'
										variant='outline'
									>
										Cancel
									</Button>
								</Link>
								<form.SubmitButton disabled={isSubmitting || timeOptions.length === 0}>
									{isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
								</form.SubmitButton>
							</div>
						</form.Form>
					</form.AppForm>
				</CardContent>
			</Card>

			{/* Patient & Doctor Info */}
			<div className='grid gap-4 md:grid-cols-2'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='font-medium text-sm'>Patient</CardTitle>
					</CardHeader>
					<CardContent>
						{appointment.patient ? (
							<div>
								<p className='font-medium'>
									{appointment.patient.firstName} {appointment.patient.lastName}
								</p>
								{appointment.patient.mrn && (
									<p className='text-muted-foreground text-sm'>MRN: {appointment.patient.mrn}</p>
								)}
							</div>
						) : (
							<p className='text-muted-foreground text-sm'>Patient information not available</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='font-medium text-sm'>Doctor</CardTitle>
					</CardHeader>
					<CardContent>
						{appointment.doctor ? (
							<div>
								<p className='font-medium'>Dr. {appointment.doctor.name}</p>
								{appointment.doctor.specialty && (
									<p className='text-muted-foreground text-sm'>{appointment.doctor.specialty}</p>
								)}
							</div>
						) : (
							<p className='text-muted-foreground text-sm'>Doctor not assigned</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// ============================================================
// Skeleton Loader
// ============================================================

function ReschedulePageSkeleton() {
	return (
		<div className='mx-auto max-w-4xl space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Skeleton className='h-10 w-10' />
					<div>
						<Skeleton className='h-7 w-48' />
						<Skeleton className='mt-1 h-4 w-32' />
					</div>
				</div>
				<Skeleton className='h-6 w-40' />
			</div>

			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent>
					<div className='grid gap-6 md:grid-cols-2'>
						<div className='space-y-4'>
							<Skeleton className='h-5 w-20' />
							<Skeleton className='h-64 w-full' />
						</div>
						<div className='space-y-4'>
							<Skeleton className='h-5 w-20' />
							<Skeleton className='h-10 w-full' />
							<Skeleton className='h-32 w-full' />
						</div>
					</div>
					<div className='mt-6'>
						<Skeleton className='h-5 w-40' />
						<Skeleton className='mt-2 h-20 w-full' />
					</div>
					<div className='mt-6 flex justify-end gap-3 border-t pt-4'>
						<Skeleton className='h-10 w-24' />
						<Skeleton className='h-10 w-32' />
					</div>
				</CardContent>
			</Card>

			<div className='grid gap-4 md:grid-cols-2'>
				<Skeleton className='h-24 w-full' />
				<Skeleton className='h-24 w-full' />
			</div>
		</div>
	);
}
