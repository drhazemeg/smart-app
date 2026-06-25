// products/patients/components/patient-tables/cell-action.tsx
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
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { deletePatientMutation, deletePatientPermanentlyMutation, restorePatientMutation } from "../../api/mutations";
import type { Patient } from "../../api/types";

interface CellActionProps {
	data: Patient;
}

export function CellAction({ data }: CellActionProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const deleteMutation = useMutation({
		...deletePatientMutation,
		onSuccess: () => {
			toast.success("Patient deactivated successfully");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to deactivate patient");
		}
	});

	const deletePermanentMutation = useMutation({
		...deletePatientPermanentlyMutation,
		onSuccess: () => {
			toast.success("Patient deleted permanently");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to delete patient");
		}
	});

	const restoreMutation = useMutation({
		...restorePatientMutation,
		onSuccess: () => {
			toast.success("Patient restored successfully");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to restore patient");
		}
	});

	const handleView = () => {
		router.navigate({ to: `/dashboard/patients/${data.id}` });
	};

	const handleEdit = () => {
		router.navigate({ to: `/dashboard/patients/${data.id}/edit` });
	};

	const isDeleted = data.isDeleted;

	return (
		<>
			<AlertModal
				description={
					isDeleted
						? "This action cannot be undone. All patient data will be permanently removed."
						: "The patient will be deactivated and won't appear in active lists."
				}
				isOpen={open}
				loading={deleteMutation.isPending || deletePermanentMutation.isPending}
				onClose={() => setOpen(false)}
				onConfirm={() => {
					if (isDeleted) {
						deletePermanentMutation.mutate(data.id ?? "");
					} else {
						deleteMutation.mutate(data.id ?? "");
					}
				}}
				title={isDeleted ? "Permanently delete this patient?" : "Deactivate this patient?"}
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
					<DropdownMenuItem onClick={handleView}>
						<Icons.eyeOff className='mr-2 h-4 w-4' /> View
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleEdit}>
						<Icons.edit className='mr-2 h-4 w-4' /> Edit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => router.navigate({ to: `/dashboard/patients/${data.id}/growth` })}>
						<Icons.charts className='mr-2 h-4 w-4' /> Growth Chart
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.navigate({ to: `/dashboard/patients/${data.id}/appointments` })}
					>
						<Icons.calendar className='mr-2 h-4 w-4' /> Appointments
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.navigate({ to: `/dashboard/patients/${data.id}/medical` })}>
						<Icons.fileText className='mr-2 h-4 w-4' /> Medical History
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{isDeleted ? (
						<>
							<DropdownMenuItem onClick={() => restoreMutation.mutate(data.id ?? "")}>
								<Icons.undo className='mr-2 h-4 w-4' /> Restore
							</DropdownMenuItem>
							<DropdownMenuItem
								className='text-destructive focus:text-destructive'
								onClick={() => setOpen(true)}
							>
								<Icons.trash className='mr-2 h-4 w-4' /> Delete Permanently
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem
							className='text-destructive focus:text-destructive'
							onClick={() => setOpen(true)}
						>
							<Icons.user className='mr-2 h-4 w-4' /> Deactivate
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
