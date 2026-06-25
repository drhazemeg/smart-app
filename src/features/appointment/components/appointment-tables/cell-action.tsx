import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { AlertModal } from "@/components/modal/alertModal";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { cancelAppointmentMutation } from "../../api/mutations";
import type { Appointment } from "./columns";

interface CellActionProps {
	data: Appointment;
}

export function CellAction({ data }: CellActionProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const cancelMutation = useMutation({
		...cancelAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment cancelled successfully");
			setOpen(false);
			router.invalidate();
		},
		onError: () => {
			toast.error("Failed to cancel appointment");
		}
	});

	const clinicId = "current-clinic-id";

	const handleCancel = () => {
		cancelMutation.mutate({ appointmentId: data.id, clinicId });
	};

	return (
		<>
			<AlertModal
				isOpen={open}
				loading={cancelMutation.isPending}
				onClose={() => setOpen(false)}
				onConfirm={handleCancel}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						className='h-8 w-8 p-0'
						variant='ghost'
					>
						<span className='sr-only'>Open menu</span>
						<Icons.ellipsis className='h-4 w-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() =>
							router.navigate({
								to: "/auth/dashboard/appointments/$id",
								params: { id: data.id }
							})
						}
					>
						<Icons.eyeOff className='mr-2 h-4 w-4' /> View
					</DropdownMenuItem>
					{data.status !== "CANCELLED" && data.status !== "COMPLETED" && (
						<>
							<DropdownMenuItem
								onClick={() =>
									router.navigate({
										to: "/auth/dashboard/appointments/$id/reschedule",
										params: { id: data.id }
									})
								}
							>
								<Icons.calendar className='mr-2 h-4 w-4' /> Reschedule
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setOpen(true)}>
								<Icons.close className='mr-2 h-4 w-4' /> Cancel
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
