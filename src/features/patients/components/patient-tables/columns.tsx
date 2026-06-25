// products/patients/components/patient-tables/columns.tsx
import type { Column, ColumnDef } from "@tanstack/react-table";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import type { DbPatient as Patient } from "../../../../db";
// import type { Patient } from "../../api/types";
import { CellAction } from "./cell-action";
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from "./options";

export const columns: ColumnDef<Patient>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Patient'
			/>
		),
		cell: ({ row }) => {
			const patient = row.original;
			const fullName = `${patient.firstName} ${patient.lastName}`;
			return (
				<div className='flex items-center gap-3'>
					{patient.image ? (
						<img
							alt={fullName}
							className='h-8 w-8 rounded-full object-cover'
							src={patient.image}
						/>
					) : (
						<div
							className='flex h-8 w-8 items-center justify-center rounded-full font-medium text-white text-xs'
							style={{ backgroundColor: patient.colorCode || "#6b7280" }}
						>
							{patient.firstName[0]}
							{patient.lastName[0]}
						</div>
					)}
					<div>
						<div className='font-medium'>{fullName}</div>
						<div className='text-muted-foreground text-xs'>
							{patient.email || patient.phone || "No contact"}
						</div>
					</div>
				</div>
			);
		},
		meta: {
			label: "Name",
			placeholder: "Search patients...",
			variant: "text",
			icon: Icons.user
		},
		enableColumnFilter: true
	},
	{
		id: "mrn",
		accessorKey: "mrn",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='MRN'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Patient["mrn"]>();
			return <span className='font-mono text-xs'>{value || "—"}</span>;
		}
	},
	{
		id: "gender",
		accessorKey: "gender",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Gender'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Patient["gender"]>();
			const option = GENDER_OPTIONS.find(o => o.value === value);
			return <span className='capitalize'>{option?.label || value}</span>;
		},
		enableColumnFilter: true,
		meta: {
			label: "gender",
			variant: "multiSelect",
			options: GENDER_OPTIONS
		}
	},
	{
		id: "dateOfBirth",
		accessorKey: "dateOfBirth",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Age'
			/>
		),
		cell: ({ row }) => {
			const dob = row.getValue<Date>("dateOfBirth");
			if (!dob) return <span>—</span>;
			const age = calculateAge(dob);
			return <span>{age}</span>;
		}
	},
	{
		id: "bloodGroup",
		accessorKey: "bloodGroup",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Blood Group'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Patient["bloodGroup"]>();
			const option = BLOOD_GROUP_OPTIONS.find(o => o.value === value);
			return <span>{option?.label || value || "—"}</span>;
		},
		enableColumnFilter: true,
		meta: {
			label: "bloodGroup",
			variant: "multiSelect",
			options: BLOOD_GROUP_OPTIONS
		}
	},
	{
		id: "isActive",
		accessorKey: "isActive",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Patient["isActive"]>();
			const variant = value ? "default" : "destructive";
			return <Badge variant={variant}>{value ? "Active" : "Inactive"}</Badge>;
		}
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: ({ column }: { column: Column<Patient, unknown> }) => (
			<DataTableColumnHeader
				column={column}
				title='Registered'
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue<Patient["createdAt"]>();
			if (!value) return <span>—</span>;
			return <span>{new Date(value).toLocaleDateString()}</span>;
		}
	},
	{
		id: "actions",
		cell: ({ row }) => <CellAction data={row.original} />
	}
];

function calculateAge(dateOfBirth: Date): string {
	const now = new Date();
	const diff = now.getTime() - new Date(dateOfBirth).getTime();
	const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));

	if (years < 1) {
		const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
		return `${months}mo`;
	}
	if (years < 5) {
		const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
		return `${years}y ${months}mo`;
	}
	return `${years}y`;
}
