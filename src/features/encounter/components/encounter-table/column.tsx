// features/encounters/components/encounter-tables/columns.tsx

import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Stethoscope, User } from "lucide-react"; // Corrected import path
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import type { Encounter } from "../../api/type";
import { encounterStatusBadgeVariants, encounterTypeOptions } from "../../constants/encounter-options";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Encounter, unknown>[] = [
	{
		id: "patient",
		accessorFn: row => `${row.patient?.firstName ?? ""} ${row.patient?.lastName ?? ""}`,
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Patient'
			/>
		),
		cell: ({ row }) => (
			<div className='flex items-center gap-2'>
				<User className='h-4 w-4 text-muted-foreground' />
				<Link
					className='font-medium hover:text-primary hover:underline'
					params={{ patientId: row.original.patientId ?? "" }}
					to='/auth/dashboard/patients/$patientId'
				>
					{row.original.patient?.firstName ?? ""} {row.original.patient?.lastName ?? ""}
				</Link>
			</div>
		)
	},
	{
		id: "doctor",
		accessorFn: row => row.doctor?.name ?? "",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Doctor'
			/>
		),
		cell: ({ row }) => (
			<div className='flex items-center gap-2'>
				<Stethoscope className='h-4 w-4 text-muted-foreground' />
				<span>Dr. {row.original.doctor?.name || "TBD"}</span>
			</div>
		)
	},
	{
		accessorKey: "encounterDate",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Date'
			/>
		), // @ts-expect-error encounterDate is a string
		cell: ({ row }) => format(new Date(row.original.encounterDate), "MMM dd, yyyy HH:mm")
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const option = encounterTypeOptions.find(o => o.value === row.original.type);
			return (
				<Badge
					className='capitalize'
					variant='outline'
				>
					{option?.label || row.original.type?.toLowerCase()}
				</Badge>
			);
		}
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const variant =
				encounterStatusBadgeVariants[row.original.status as keyof typeof encounterStatusBadgeVariants] ||
				"secondary";
			return (
				<Badge
					className='capitalize'
					variant={variant}
				>
					{row.original.status?.toLowerCase()}
				</Badge>
			);
		}
	},
	{
		accessorKey: "durationMinutes",
		header: "Duration",
		cell: ({ row }) => <span>{row.original.durationMinutes || 30} min</span>
	},
	{
		id: "actions",
		cell: ({ row }) => <CellAction data={row.original} />
	}
];
