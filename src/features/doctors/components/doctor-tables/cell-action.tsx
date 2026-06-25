// products/doctors/components/doctor-tables/cell-action.tsx
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

import { deleteDoctorMutation, softDeleteDoctorMutation } from "../../api/mutations";
import type { Doctor } from "../../api/types";

interface CellActionProps {
	data: Doctor;
}

export function CellAction({ data }: CellActionProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const deleteMutation = useMutation({
		...deleteDoctorMutation,
		onSuccess: () => {
			toast.success("Doctor deleted permanently");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to delete doctor");
		}
	});

	const softDeleteMutation = useMutation({
		...softDeleteDoctorMutation,
		onSuccess: () => {
			toast.success("Doctor deactivated successfully");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to deactivate doctor");
		}
	});

	const handleView = () => {
		router.navigate({ to: `/dashboard/doctors/${data.id}` });
	};

	const handleEdit = () => {
		router.navigate({ to: `/dashboard/doctors/${data.id}/edit` });
	};

	return (
		<>
			<AlertModal
				description={
					data.isDeleted
						? "This action cannot be undone. The doctor's data will be permanently removed."
						: "The doctor will be deactivated and won't appear in active lists, but their data will be preserved."
				}
				isOpen={open}
				loading={deleteMutation.isPending || softDeleteMutation.isPending}
				onClose={() => setOpen(false)}
				onConfirm={() => {
					if (data.isDeleted) {
						deleteMutation.mutate(data.id ?? "");
					} else {
						softDeleteMutation.mutate(data.id ?? "");
					}
				}}
				title={data.isDeleted ? "Permanently delete this doctor?" : "Deactivate this doctor?"}
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
					<DropdownMenuItem onClick={() => router.navigate({ to: `/dashboard/doctors/${data.id}/schedule` })}>
						<Icons.calendar className='mr-2 h-4 w-4' /> Schedule
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className='text-destructive focus:text-destructive'
						onClick={() => setOpen(true)}
					>
						{data.isDeleted ? (
							<>
								<Icons.trash className='mr-2 h-4 w-4' /> Delete Permanently
							</>
						) : (
							<>
								<Icons.user className='mr-2 h-4 w-4' /> Deactivate
							</>
						)}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
