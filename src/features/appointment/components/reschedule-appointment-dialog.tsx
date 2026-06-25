import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rescheduleAppointmentMutation } from "../api/mutations";
import { getAvailableTimeSlotsQueryOptions } from "../api/queries";

interface RescheduleAppointmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	appointment: {
		id: string;
		doctorId: string;
		clinicId: string;
		patient: { firstName: string; lastName: string };
	};
}

export function RescheduleAppointmentDialog({ open, onOpenChange, appointment }: RescheduleAppointmentDialogProps) {
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedTime, setSelectedTime] = useState<string>("");

	const { data: availableSlots, isFetching } = useQuery({
		...getAvailableTimeSlotsQueryOptions({
			clinicId: appointment.clinicId,
			doctorId: appointment.doctorId,
			date: selectedDate || new Date(),
			durationMinutes: 30
		}),
		enabled: !!selectedDate
	});

	const rescheduleMutation = useMutation({
		...rescheduleAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment rescheduled successfully");
			onOpenChange(false);
			router.invalidate();
		},
		onError: () => {
			toast.error("Failed to reschedule appointment");
		}
	});

	const handleSubmit = () => {
		if (!selectedDate || !selectedTime) {
			toast.error("Please select a date and time");
			return;
		}
		rescheduleMutation.mutate({
			appointmentId: appointment.id,
			clinicId: appointment.clinicId,
			newDate: selectedDate,
			newTime: selectedTime
		});
	};

	const timeOptions = (availableSlots || []).map(slot => ({
		value: slot.startTime,
		label: `${slot.startTime} - ${slot.endTime}`
	}));

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Reschedule Appointment</DialogTitle>
					<DialogDescription>
						Select a new date and time for {appointment.patient.firstName} {appointment.patient.lastName}'s
						appointment.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label>Select New Date</Label>
						<Calendar
							className='rounded-md border'
							disabled={date => date < new Date()}
							mode='single'
							onSelect={setSelectedDate}
							selected={selectedDate}
						/>
					</div>

					{selectedDate && (
						<div className='space-y-2'>
							<Label>Select New Time</Label>
							<Select
								disabled={isFetching}
								onValueChange={setSelectedTime}
								value={selectedTime}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={isFetching ? "Loading available slots..." : "Select time"}
									/>
								</SelectTrigger>
								<SelectContent>
									{timeOptions.map(option => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						onClick={() => onOpenChange(false)}
						variant='outline'
					>
						Cancel
					</Button>
					<Button
						disabled={rescheduleMutation.isPending}
						onClick={handleSubmit}
					>
						Reschedule
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
