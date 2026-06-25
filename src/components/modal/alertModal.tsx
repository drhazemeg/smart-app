// src/components/modal/alert-modal.tsx

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Icons } from "@/components/icons";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const alertModalVariants = cva("flex items-center justify-center rounded-full p-3", {
	variants: {
		variant: {
			default: "bg-destructive/10 text-destructive",
			warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
			info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
			success: "bg-green-500/10 text-green-600 dark:text-green-400",
			destructive: "bg-destructive/10 text-destructive"
		}
	},
	defaultVariants: {
		variant: "destructive"
	}
});

export interface AlertModalProps
	extends React.ComponentProps<typeof AlertDialog>,
		VariantProps<typeof alertModalVariants> {
	isOpen: boolean;
	loading?: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	showCancel?: boolean;
	icon?: React.ReactNode;
	className?: string;
}

export function AlertModal({
	isOpen,
	loading = false,
	onClose,
	onConfirm,
	title = "Are you sure?",
	description = "This action cannot be undone.",
	confirmText = "Continue",
	cancelText = "Cancel",
	showCancel = true,
	variant = "destructive",
	icon,
	className,
	...props
}: AlertModalProps) {
	const iconMap: Record<string, React.ReactNode> = {
		default: <Icons.alertCircle className='h-6 w-6' />,
		destructive: <Icons.alertCircle className='h-6 w-6' />,
		warning: <Icons.alertTriangle className='h-6 w-6' />,
		info: <Icons.info className='h-6 w-6' />,
		success: <Icons.check className='h-6 w-6' />
	};

	const defaultIcon = icon || iconMap[variant || "destructive"];

	return (
		<AlertDialog
			onOpenChange={onClose}
			open={isOpen}
			{...props}
		>
			<AlertDialogContent className='max-w-md'>
				<AlertDialogHeader className='flex flex-col items-center text-center'>
					<div className={cn(alertModalVariants({ variant }), "mb-4")}>{defaultIcon}</div>
					<AlertDialogTitle className='font-semibold text-xl'>{title}</AlertDialogTitle>
					<AlertDialogDescription className='text-muted-foreground'>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className={cn("flex gap-2", showCancel ? "flex-row" : "justify-center")}>
					{showCancel && (
						<AlertDialogCancel asChild>
							<Button
								className='flex-1'
								disabled={loading}
								onClick={onClose}
								variant='outline'
							>
								{cancelText}
							</Button>
						</AlertDialogCancel>
					)}
					<AlertDialogAction asChild>
						<Button
							className={cn(
								"flex-1",
								variant === "warning" && "bg-amber-500 text-white hover:bg-amber-600",
								variant === "info" && "bg-blue-500 text-white hover:bg-blue-600",
								variant === "success" && "bg-green-500 text-white hover:bg-green-600"
							)}
							disabled={loading}
							onClick={onConfirm}
							variant={variant === "warning" ? "default" : "destructive"}
						>
							{loading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
							{confirmText}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
