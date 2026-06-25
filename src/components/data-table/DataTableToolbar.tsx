import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Icons } from "../icons";
import type { DataTableConfig } from "./DataTable";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	config: DataTableConfig;
}

export function DataTableToolbar<TData>({ table, config }: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className='flex items-center justify-between'>
			<div className='flex flex-1 items-center space-x-2'>
				{config.searchColumn && (
					<Input
						className='h-8 w-37.5 lg:w-62.5'
						onChange={event => {
							if (config.searchColumn) {
								table.getColumn(config.searchColumn)?.setFilterValue(event.target.value);
							}
						}}
						placeholder={config.searchPlaceholder || "Search..."}
						value={(table.getColumn(config.searchColumn)?.getFilterValue() as string) ?? ""}
					/>
				)}
				{config.facetedFilters?.map(filter => {
					const column = table.getColumn(filter.column);
					return column ? (
						<DataTableFacetedFilter
							column={column}
							key={filter.column}
							options={filter.options}
							title={filter.title}
						/>
					) : null;
				})}
				{isFiltered && (
					<Button
						className='h-8 px-2 lg:px-3'
						onClick={() => table.resetColumnFilters()}
						variant='ghost'
					>
						Reset
						<Icons.cross className='ml-2 h-4 w-4' />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
