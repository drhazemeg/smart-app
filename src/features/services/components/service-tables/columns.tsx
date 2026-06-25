// products/services/components/service-tables/columns.tsx

import type { Column, ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import type { Service } from "../../api/types";
import { CellAction } from "./cell-action";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_OPTIONS } from "./options";

export const columns: ColumnDef<Service>[] = [
	{
		id: "serviceName",
		accessorKey: "serviceName",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Service'
			/>
		),
		cell: ({ row }) => {
			const service = row.original;
			const category = service.category || "OTHER";
			const icon = CATEGORY_ICONS[category] || "📌";
			const color = CATEGORY_COLORS[category] || "#6b7280";

			return (
				<div className='flex items-center gap-3'>
					<div
						className='flex h-8 w-8 items-center justify-center rounded-lg text-sm'
						style={{ backgroundColor: `${color}20` }}
					>
						<span style={{ color }}>{icon}</span>
					</div>
					<div>
						<div className='font-medium'>{service.serviceName}</div>
						<div className='text-muted-foreground text-xs'>{service.category || "Uncategorized"}</div>
					</div>
				</div>
			);
		},
		meta: {
			label: "Name",
			placeholder: "Search services...",
			variant: "text",
			icon: Icons.package
		},
		enableColumnFilter: true
	},
	{
		id: "category",
		accessorKey: "category",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Category'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Service["category"]>();
			const option = CATEGORY_OPTIONS.find(o => o.value === value);
			const color = CATEGORY_COLORS[value || "OTHER"];

			return (
				<Badge style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
					{option?.label || value || "Other"}
				</Badge>
			);
		},
		enableColumnFilter: true,
		meta: {
			label: "category",
			variant: "multiSelect",
			options: CATEGORY_OPTIONS
		}
	},
	{
		id: "price",
		accessorKey: "price",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Price'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Service["price"]>();
			return <span className='font-medium'>${value?.toFixed(2) ?? "0.00"}</span>;
		}
	},
	{
		id: "duration",
		accessorKey: "duration",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Duration'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Service["duration"]>();
			return <span>{value || 30} min</span>;
		}
	},
	{
		id: "isAvailable",
		accessorKey: "isAvailable",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Service["isAvailable"]>();
			const variant = value ? "default" : "destructive";
			return <Badge variant={variant}>{value ? "Available" : "Unavailable"}</Badge>;
		}
	},
	{
		id: "isDeleted",
		accessorKey: "isDeleted",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Archived'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Service["isDeleted"]>();
			return value ? <Badge variant='outline'>Archived</Badge> : <span className='text-muted-foreground'>—</span>;
		}
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: ({ column }: { column: Column<Service, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Created'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Service["createdAt"]>();
			if (!value) return <span>—</span>;
			return <span>{new Date(value).toLocaleDateString()}</span>;
		}
	},
	{
		id: "actions",
		cell: ({ row }) => <CellAction data={row.original} />
	}
];
