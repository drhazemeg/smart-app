// src/components/VisitDataTable.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState, RowData } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable
} from "@tanstack/react-table";
import {
	AlertCircleIcon,
	CalendarDaysIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ClockIcon,
	EllipsisVerticalIcon,
	HeartPulseIcon,
	Loader2Icon,
	StethoscopeIcon,
	SyringeIcon,
	XCircleIcon
} from "lucide-react";
import { useState } from "react";
// 1. Add custom types to TanStack Table's meta interface
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVisitsFn } from "@/functions/visit";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import type { AppointmentStatus, PaymentStatus } from "../../db";

declare module "@tanstack/react-table" {
	interface TableMeta<TData extends RowData = RowData> {
		onAction?: (action: string, data: TData) => void;
	}
}
// Types
interface PatientVisit {
	id: string;
	patientId: string;
	patientName: string;
	patientAvatar?: string;
	patientAvatarFallback: string;
	age: string;
	gender?: "boy" | "girl" | "other";
	visitDate: string;
	visitType: string;
	status: AppointmentStatus;
	diagnosis: string[];
	amount: number;
	paymentStatus: PaymentStatus;
	provider: string;
	nextAppointment: string | null;
}

interface VisitDataTableProps {
	onAction?: (action: string, visit: PatientVisit) => void;
}

// Helper functions
const getVisitTypeIcon = (type: string) => {
	const lower = type.toLowerCase();
	if (lower.includes("checkup") || lower.includes("general")) return <StethoscopeIcon className='size-4' />;
	if (lower.includes("emergency")) return <AlertCircleIcon className='size-4' />;
	if (lower.includes("vaccine") || lower.includes("immunization")) return <SyringeIcon className='size-4' />;
	return <HeartPulseIcon className='size-4' />;
};

const getStatusBadgeVariant = (status: PatientVisit["status"]) => {
	switch (status) {
		case "PENDING":
			return "outline";
		case "COMPLETED":
			return "default";
		case "CANCELLED":
			return "destructive";
		case "NO_SHOW":
			return "secondary";
		default:
			return "outline";
	}
};

const getStatusIcon = (status: PatientVisit["status"]) => {
	switch (status) {
		case "PENDING":
			return <ClockIcon className='size-3' />;
		case "COMPLETED":
			return <CheckCircleIcon className='size-3' />;
		case "CANCELLED":
			return <XCircleIcon className='size-3' />;
		case "NO_SHOW":
			return <AlertCircleIcon className='size-3' />;
		default:
			return null;
	}
};

const getPaymentStatusBadge = (status: PaymentStatus) => {
	switch (status) {
		case "PAID":
			return <Badge variant='default'>Paid</Badge>;
		case "PENDING":
			return <Badge variant='secondary'>Pending</Badge>;
		case "UNPAID":
			return <Badge variant='destructive'>Unpaid</Badge>;
		default:
			return <Badge variant='outline'>Unknown</Badge>;
	}
};

// Column definitions
const columns: ColumnDef<PatientVisit>[] = [
	{
		id: "patient",
		header: "Patient",
		cell: ({ row }) => {
			const visit = row.original;
			return (
				<div className='flex items-center gap-3'>
					<Avatar className='size-8'>
						<AvatarImage
							alt={visit.patientName}
							src={visit.patientAvatar}
						/>
						<AvatarFallback className='text-xs'>{visit.patientAvatarFallback}</AvatarFallback>
					</Avatar>
					<div>
						<div className='font-medium text-sm'>{visit.patientName}</div>
						<div className='flex items-center gap-1 text-muted-foreground text-xs'>
							<span>{visit.age}</span>
							<span>•</span>
							<span>{visit.gender}</span>
						</div>
					</div>
				</div>
			);
		}
	},
	{
		accessorKey: "visitDate",
		header: "Date & Time",
		cell: ({ row }) => {
			const date = new Date(row.original.visitDate);
			return (
				<div className='text-sm'>
					<div>{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
					<div className='text-muted-foreground text-xs'>
						{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
					</div>
				</div>
			);
		}
	},
	{
		accessorKey: "visitType",
		header: "Type",
		cell: ({ row }) => {
			const visit = row.original;
			return (
				<div className='flex items-center gap-1.5'>
					{getVisitTypeIcon(visit.visitType)}
					<span className='text-sm'>{visit.visitType}</span>
				</div>
			);
		}
	},
	{
		accessorKey: "provider",
		header: "Provider",
		cell: ({ row }) => <span className='text-sm'>{row.original.provider}</span>
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<Badge
					className='flex w-fit items-center gap-1'
					variant={getStatusBadgeVariant(status)}
				>
					{getStatusIcon(status)}
					<span className='capitalize'>{status}</span>
				</Badge>
			);
		}
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => {
			const visit = row.original;
			return (
				<div>
					<div className='font-medium text-sm'>${visit.amount.toFixed(2)}</div>
					<div className='mt-1'>{getPaymentStatusBadge(visit.paymentStatus)}</div>
				</div>
			);
		}
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => {
			const visit = row.original;
			// Retrieve the callback from the table meta
			const onAction = table.options.meta?.onAction;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size='icon'
							variant='ghost'
						>
							<EllipsisVerticalIcon className='size-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => onAction?.("view", visit)}>View Details</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onAction?.("edit", visit)}>Edit Visit</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onAction?.("reschedule", visit)}>
								Reschedule
							</DropdownMenuItem>
							<DropdownMenuItem
								className='text-destructive'
								onClick={() => onAction?.("cancel", visit)}
							>
								Cancel Visit
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

const VisitDataTable = ({ onAction }: VisitDataTableProps) => {
	// 1. Core Async Hydration Layer using TanStack Query
	const {
		data: serverData,
		isLoading,
		isError
	} = useQuery({
		queryKey: ["patient-visits"],
		queryFn: () => getVisitsFn(),
		staleTime: 1000 * 60 * 2 // 2 minutes before refetching implicitly
	});

	const pageSize = 5;
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: pageSize
	});

	// Use empty fallbacks if data is still fetching from DB
	const fallbackVisits = serverData?.visits ?? [];
	const summary = serverData?.summary ?? {
		totalVisits: 0,
		scheduledCount: 0,
		completedCount: 0,
		totalRevenue: 0
	};

	const table = useReactTable({
		data: fallbackVisits,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: setPagination,
		state: { pagination },
		// Pass the prop into meta so columns can read it
		meta: {
			onAction
		}
	});
	const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
		currentPage: table.getState().pagination.pageIndex + 1,
		totalPages: table.getPageCount(),
		paginationItemsToDisplay: 2
	});

	const startIndex = table.getState().pagination.pageIndex * table.getState().pagination.pageSize;
	const endIndex = Math.min(startIndex + table.getState().pagination.pageSize, table.getRowCount());

	// 2. Early return layouts for data fetching edge-cases
	if (isLoading) {
		return (
			<div className='flex h-64 w-full flex-col items-center justify-center gap-2 text-muted-foreground text-sm'>
				<Loader2Icon className='size-8 animate-spin text-primary' />
				<p>Loading records from the clinic datastore...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-center text-rose-700 text-sm'>
				<AlertCircleIcon className='size-8 text-rose-500' />
				<p className='font-semibold'>Failed to fetch logs</p>
				<p className='text-rose-600/80 text-xs'>
					Please check internet line parameters or reload the route context.
				</p>
			</div>
		);
	}

	return (
		<div className='w-full'>
			{/* Stats Summary - Now using real computed fields from our Drizzle layer */}
			<div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
				<div className='rounded-lg border bg-card/50 p-3'>
					<p className='text-muted-foreground text-xs'>Total Visits</p>
					<p className='font-bold text-lg'>{summary.totalVisits}</p>
				</div>
				<div className='rounded-lg border bg-card/50 p-3'>
					<p className='text-muted-foreground text-xs'>Scheduled</p>
					<p className='font-bold text-blue-600 text-lg'>{summary.scheduledCount}</p>
				</div>
				<div className='rounded-lg border bg-card/50 p-3'>
					<p className='text-muted-foreground text-xs'>Completed</p>
					<p className='font-bold text-emerald-600 text-lg'>{summary.completedCount}</p>
				</div>
				<div className='rounded-lg border bg-card/50 p-3'>
					<p className='text-muted-foreground text-xs'>Revenue</p>
					<p className='font-bold text-lg'>
						{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
							summary.totalRevenue
						)}
					</p>
				</div>
			</div>

			{/* Table Layout Wrapper */}
			<div className='rounded-lg border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow
								className='bg-secondary/30'
								key={headerGroup.id}
							>
								{headerGroup.headers.map(header => (
									<TableHead
										className='h-12 text-muted-foreground text-xs first:pl-4'
										key={header.id}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow
									className='transition-colors hover:bg-primary/5'
									key={row.id}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell
											className='py-3 first:pl-4'
											key={cell.id}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									className='h-24 text-center text-muted-foreground'
									colSpan={columns.length}
								>
									<div className='flex flex-col items-center gap-2'>
										<CalendarDaysIcon className='size-8 opacity-20' />
										<p>No visits found</p>
										<p className='text-xs'>Schedule a new visit to get started</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			<div className='flex items-center justify-between gap-3 px-4 py-4 max-sm:flex-col md:max-lg:flex-col'>
				<p
					aria-live='polite'
					className='whitespace-nowrap text-muted-foreground text-sm'
				>
					Showing <span className='font-medium'>{startIndex + 1}</span> to{" "}
					<span className='font-medium'>{endIndex}</span> of{" "}
					<span className='font-medium'>{table.getRowCount().toString()}</span> entries
				</p>

				<div>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<Button
									className='disabled:pointer-events-none disabled:opacity-50'
									disabled={!table.getCanPreviousPage()}
									onClick={() => table.previousPage()}
									size='sm'
									variant='ghost'
								>
									<ChevronLeftIcon /> Previous
								</Button>
							</PaginationItem>

							{showLeftEllipsis && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}

							{pages.map(page => {
								const isActive = page === table.getState().pagination.pageIndex + 1;
								return (
									<PaginationItem key={page}>
										<Button
											className={cn(
												"h-8 w-8",
												isActive
													? "bg-primary text-primary-foreground hover:bg-primary/90"
													: "bg-primary/10 text-primary hover:bg-primary/20"
											)}
											onClick={() => table.setPageIndex(page - 1)}
											size='icon'
										>
											{page}
										</Button>
									</PaginationItem>
								);
							})}

							{showRightEllipsis && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}

							<PaginationItem>
								<Button
									className='disabled:pointer-events-none disabled:opacity-50'
									disabled={!table.getCanNextPage()}
									onClick={() => table.nextPage()}
									size='sm'
									variant='ghost'
								>
									Next <ChevronRightIcon />
								</Button>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
		</div>
	);
};

export default VisitDataTable;
