import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import type { Appointment as ApiAppointment } from "@/features/appointment/api/types";

import { CellAction } from "./cell-action";

export type Appointment = ApiAppointment;

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	PENDING: { label: "Pending", variant: "secondary" },
	CONFIRMED: { label: "Confirmed", variant: "default" },
	COMPLETED: { label: "Completed", variant: "default" },
	CANCELLED: { label: "Cancelled", variant: "destructive" },
	NO_SHOW: { label: "No Show", variant: "outline" }
};

export const columns: ColumnDef<Appointment, unknown>[] = [
	{
		accessorKey: "appointmentDate",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Date'
			/>
		),
		cell: ({ row }) => format(new Date(row.original.appointmentDate), "MMM dd, yyyy")
	},
	{
		accessorKey: "time",
		header: "Time"
	},
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
			<Link
				className='font-medium hover:text-primary hover:underline'
				params={{ patientId: row.original.id }}
				to='/auth/dashboard/patients/$patientId'
			>
				{row.original.patient?.firstName ?? ""} {row.original.patient?.lastName ?? ""}
			</Link>
		)
	},
	{
		id: "doctor",
		accessorFn: row => row.doctor?.name ?? "",
		header: "Doctor"
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => (
			<Badge
				className='capitalize'
				variant='outline'
			>
				{row.original.type?.toLowerCase()}
			</Badge>
		)
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const config = statusConfig[row.original.status] || statusConfig.PENDING;
			return (
				<Badge
					className='capitalize'
					variant={config.variant}
				>
					{config.label}
				</Badge>
			);
		}
	},
	{
		accessorKey: "appointmentPrice",
		header: "Price",
		cell: ({ row }) => (row.original.appointmentPrice ? `$${row.original.appointmentPrice}` : "-")
	},
	{
		id: "actions",
		cell: ({ row }) => <CellAction data={row.original} />
	}
];
