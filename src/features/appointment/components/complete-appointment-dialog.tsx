import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeAppointmentMutation } from "../api/mutations";

interface CompleteAppointmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	appointment: {
		id: string;
		patient: { firstName: string; lastName: string };
	};
}

export function CompleteAppointmentDialog({ open, onOpenChange, appointment }: CompleteAppointmentDialogProps) {
	const router = useRouter();
	const [notes, setNotes] = useState("");

	const completeMutation = useMutation({
		...completeAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment marked as completed");
			onOpenChange(false);
			router.invalidate();
		},
		onError: () => {
			toast.error("Failed to complete appointment");
		}
	});

	const handleSubmit = () => {
		completeMutation.mutate({ id: appointment.id, notes, clinicId: "" });
	};

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Complete Appointment</DialogTitle>
					<DialogDescription>
						Mark this appointment as completed for {appointment.patient.firstName}{" "}
						{appointment.patient.lastName}.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='completion-notes'>Completion Notes (Optional)</Label>
						<Textarea
							id='completion-notes'
							onChange={e => setNotes(e.target.value)}
							placeholder='Add any notes about the appointment completion...'
							rows={4}
							value={notes}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						disabled={completeMutation.isPending}
						onClick={() => onOpenChange(false)}
						variant='outline'
					>
						Cancel
					</Button>
					<Button
						disabled={completeMutation.isPending}
						onClick={handleSubmit}
					>
						{completeMutation.isPending ? "Completing..." : "Complete Appointment"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
