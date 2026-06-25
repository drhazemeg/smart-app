import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Icons } from "../icons";

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild={true}>
				<Button
					className='ml-auto hidden h-8 lg:flex'
					size='sm'
					variant='outline'
				>
					<Icons.moreHorizontal className='mr-2 h-4 w-4' />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-[150px]'
			>
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter(column => typeof column.accessorFn !== "undefined" && column.getCanHide())
					.map(column => {
						return (
							<DropdownMenuCheckboxItem
								checked={column.getIsVisible()}
								className='capitalize'
								key={column.id}
								onCheckedChange={value => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
