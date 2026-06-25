// products/services/components/service-tables/cell-action.tsx
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
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

import { deleteServiceMutation, restoreServiceMutation, softDeleteServiceMutation } from "../../api/mutations";
import { canDeleteServiceOptions } from "../../api/queries";
import type { Service } from "../../api/types";

interface CellActionProps {
	data: Service;
}

export function CellAction({ data }: CellActionProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const { data: canDeleteData } = useSuspenseQuery(canDeleteServiceOptions(data.id ?? ""));

	const deleteMutation = useMutation({
		...deleteServiceMutation,
		onSuccess: () => {
			toast.success("Service deleted permanently");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to delete service");
		}
	});

	const softDeleteMutation = useMutation({
		...softDeleteServiceMutation,
		onSuccess: () => {
			toast.success("Service archived successfully");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to archive service");
		}
	});

	const restoreMutation = useMutation({
		...restoreServiceMutation,
		onSuccess: () => {
			toast.success("Service restored successfully");
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to restore service");
		}
	});

	const handleView = () => {
		router.navigate({ to: `/dashboard/services/${data.id}` });
	};

	const handleEdit = () => {
		router.navigate({ to: `/dashboard/services/${data.id}/edit` });
	};

	const handleClone = () => {
		router.navigate({ to: `/dashboard/services/clone/${data.id}` });
	};

	const isDeleted = data.isDeleted;
	const canDelete = canDeleteData?.canDelete ?? false;

	return (
		<>
			<AlertModal
				description={
					isDeleted
						? "This action cannot be undone. The service will be permanently removed."
						: canDelete
							? "The service will be archived and won't appear in active lists."
							: "This service cannot be archived because it has upcoming appointments or lab tests associated with it."
				}
				isOpen={open}
				loading={deleteMutation.isPending || softDeleteMutation.isPending}
				onClose={() => setOpen(false)}
				onConfirm={() => {
					if (isDeleted) {
						deleteMutation.mutate(data.id ?? "");
					} else {
						softDeleteMutation.mutate(data.id ?? "");
					}
				}}
				title={isDeleted ? "Permanently delete this service?" : "Archive this service?"}
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
					<DropdownMenuItem onClick={handleClone}>
						<Icons.copy className='mr-2 h-4 w-4' /> Clone
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
							disabled={!canDelete}
							onClick={() => setOpen(true)}
						>
							<Icons.archive className='mr-2 h-4 w-4' /> Archive
							{!canDelete && (
								<span className='ml-1 text-muted-foreground text-xs'>(has dependencies)</span>
							)}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
