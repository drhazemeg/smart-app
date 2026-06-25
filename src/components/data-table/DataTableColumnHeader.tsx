import type { Column } from "@tanstack/react-table";
import type * as React from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild={true}>
					<Button
						className='-ml-3 h-8 data-[state=open]:bg-accent'
						size='sm'
						variant='ghost'
					>
						<span>{title}</span>
						{column.getIsSorted() === "desc" ? (
							<Icons.chevronDown className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === "asc" ? (
							<Icons.chevronUp className='ml-2 h-4 w-4' />
						) : (
							<Icons.caretSort className='ml-2 h-4 w-4' />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start'>
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<Icons.arrowUp className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<Icons.arrowDown className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						Desc
					</DropdownMenuItem>
					{column.getCanHide() && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
								<Icons.eyeOff className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
								Hide
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
