// products/doctors/components/doctor-tables/columns.tsx
import type { Column, ColumnDef } from "@tanstack/react-table";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";

import type { Doctor } from "../../api/types";
import { CellAction } from "./cell-action";
import { AVAILABILITY_STATUS_OPTIONS, DEPARTMENT_OPTIONS, SPECIALTY_OPTIONS, STATUS_BADGE_VARIANTS } from "./options";

export const columns: ColumnDef<Doctor>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Name'
			/>
		),
		cell: ({ row }) => {
			const doctor = row.original;
			return (
				<div className='flex items-center gap-3'>
					{doctor.img ? (
						<img
							alt={doctor.name}
							className='h-8 w-8 rounded-full object-cover'
							src={doctor.img}
						/>
					) : (
						<div
							className='flex h-8 w-8 items-center justify-center rounded-full font-medium text-white text-xs'
							style={{ backgroundColor: doctor.colorCode || "#6b7280" }}
						>
							{doctor.name
								.split(" ")
								.map(n => n[0])
								.join("")
								.toUpperCase()
								.slice(0, 2)}
						</div>
					)}
					<div>
						<div className='font-medium'>{doctor.name}</div>
						<div className='text-muted-foreground text-xs'>{doctor.email || doctor.phone}</div>
					</div>
				</div>
			);
		},
		meta: {
			label: "Name",
			placeholder: "Search doctors...",
			variant: "text",
			icon: Icons.user
		},
		enableColumnFilter: true
	},
	{
		id: "specialty",
		accessorKey: "specialty",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Specialty'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Doctor["specialty"]>();
			const option = SPECIALTY_OPTIONS.find(o => o.value === value);
			return <span>{option?.label || value}</span>;
		},
		enableColumnFilter: true,
		meta: {
			label: "specialty",
			variant: "multiSelect",
			options: SPECIALTY_OPTIONS
		}
	},
	{
		id: "department",
		accessorKey: "department",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Department'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Doctor["department"]>();
			const option = DEPARTMENT_OPTIONS.find(o => o.value === value);
			return <span>{option?.label || value || "—"}</span>;
		},
		enableColumnFilter: true,
		meta: {
			label: "department",
			variant: "multiSelect",
			options: DEPARTMENT_OPTIONS
		}
	},
	{
		id: "availabilityStatus",
		accessorKey: "availabilityStatus",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ cell }) => {
			const status = cell.getValue<Doctor["availabilityStatus"]>();
			const variant = STATUS_BADGE_VARIANTS[status || "AVAILABLE"] || "default";
			const option = AVAILABILITY_STATUS_OPTIONS.find(o => o.value === status);

			return (
				<Badge
					className='capitalize'
					variant={variant}
				>
					{option?.label || status}
				</Badge>
			);
		},
		enableColumnFilter: true,
		meta: {
			label: "availability",
			variant: "multiSelect",
			options: AVAILABILITY_STATUS_OPTIONS
		}
	},
	{
		id: "appointmentPrice",
		accessorKey: "appointmentPrice",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Price'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Doctor["appointmentPrice"]>();
			return <span>{value ? `$${value}` : "—"}</span>;
		}
	},
	{
		id: "type",
		accessorKey: "type",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Type'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Doctor["type"]>();
			const labels: Record<string, string> = {
				FULL: "Full Time",
				PART_TIME: "Part Time",
				CONSULTANT: "Consultant",
				VISITING: "Visiting"
			};
			return <span>{labels[value || "FULL"] || value}</span>;
		}
	},
	{
		id: "rating",
		accessorKey: "rating",
		header: ({ column }: { column: Column<Doctor, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Rating'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Doctor["rating"]>();
			if (!value) return <span className='text-muted-foreground'>—</span>;
			return (
				<div className='flex items-center gap-1'>
					<Icons.star className='h-3.5 w-3.5 fill-yellow-400 text-yellow-400' />
					<span>{value.toFixed(1)}</span>
				</div>
			);
		}
	},
	{
		id: "actions",
		cell: ({ row }) => <CellAction data={row.original} />
	}
];
