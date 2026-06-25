// features/encounters/components/encounter-tables/cell-action.tsx

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
import { Icons } from "@/components/ui/icons";
import { completeEncounterMutation, deleteEncounterMutation } from "../../api/mutations";
import type { Encounter } from "../../api/type";

interface CellActionProps {
	data: Encounter;
}

export function CellAction({ data }: CellActionProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const deleteMutation = useMutation({
		...deleteEncounterMutation,
		onSuccess: () => {
			toast.success("Encounter deleted successfully");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to delete encounter");
		}
	});

	const completeMutation = useMutation({
		...completeEncounterMutation,
		onSuccess: () => {
			toast.success("Encounter completed successfully");
			setOpen(false);
			router.invalidate();
		},
		onError: () => {
			toast.error("Failed to complete encounter");
		}
	});

	const handleView = () => {
		router.navigate({
			to: "/auth/dashboard/encounters/$id",
			params: { id: data.id }
		});
	};

	const handleEdit = () => {
		router.navigate({
			to: "/auth/dashboard/encounters/$id/edit",
			params: { id: data.id }
		});
	};

	const handleComplete = () => {
		completeMutation.mutate({ id: data.id });
	};

	const isCompleted = data.status === "COMPLETED" || data.status === "CANCELLED";

	return (
		<>
			<AlertModal
				description='This action cannot be undone. The encounter will be permanently deleted.'
				isOpen={open}
				loading={deleteMutation.isPending}
				onClose={() => setOpen(false)}
				onConfirm={() => deleteMutation.mutate(data.id)}
				title='Delete encounter?'
				variant='destructive'
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
					{!isCompleted && (
						<>
							<DropdownMenuItem onClick={handleEdit}>
								<Icons.edit className='mr-2 h-4 w-4' /> Edit
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleComplete}>
								<Icons.check className='mr-2 h-4 w-4' /> Complete
							</DropdownMenuItem>
						</>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className='text-destructive focus:text-destructive'
						onClick={() => setOpen(true)}
					>
						<Icons.trash className='mr-2 h-4 w-4' /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
