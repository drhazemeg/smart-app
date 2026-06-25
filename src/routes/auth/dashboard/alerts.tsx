// routes/auth/dashboard/alerts.tsx

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, AlertTriangle, CheckCircle2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertModal } from "@/components/modal/alertModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formDate";

// ============================================================
// Types
// ============================================================

type AlertSeverity = "critical" | "warning" | "info" | "success";

type AlertType =
	| "SEVERE_OBESITY"
	| "SEVERE_STUNTING"
	| "MODERATE_STUNTING"
	| "SEVERE_UNDERWEIGHT"
	| "MODERATE_UNDERWEIGHT"
	| "OBESITY"
	| "GROWTH_PLATEAU"
	| "RAPID_WEIGHT_GAIN"
	| "POOR_WEIGHT_GAIN"
	| "HEAD_GROWTH_ABNORMALITY";

// UI-level alert shape (decoupled from DB schema)
type UIGrowthAlert = {
	id: string;
	alertType: AlertType;
	severity: AlertSeverity;
	patient: {
		id: string;
		name: string;
		initials: string;
		age: string;
		gender: "boy" | "girl" | "other";
	};
	metric: string;
	value: string;
	message: string;
	recommendation?: string;
	date: Date;
	isResolved: boolean;
};

type AlertFilter = {
	severity?: AlertSeverity;
	type?: "weight" | "height" | "bmi" | "head_circumference" | "milestone" | "vaccination";
	status?: "all" | "active" | "resolved";
	search?: string;
};

// ============================================================
// Mock Data - Replace with API calls
// ============================================================

const mockAlerts: UIGrowthAlert[] = [
	{
		id: "1",
		alertType: "SEVERE_UNDERWEIGHT",
		severity: "critical",
		patient: { id: "p1", name: "Emma Johnson", initials: "EJ", age: "2y 3m", gender: "girl" },
		metric: "Weight",
		value: "8.2 kg",
		message: "Weight dropped below 3rd percentile",
		recommendation: "Schedule nutritional consultation",
		date: new Date("2024-01-15"),
		isResolved: false
	},
	{
		id: "2",
		alertType: "RAPID_WEIGHT_GAIN",
		severity: "warning",
		patient: { id: "p2", name: "Liam Smith", initials: "LS", age: "4y 1m", gender: "boy" },
		metric: "Height",
		value: "95 cm",
		message: "Height velocity slowing",
		recommendation: "Monitor growth over next 3 months",
		date: new Date("2024-01-14"),
		isResolved: false
	},
	{
		id: "3",
		alertType: "OBESITY",
		severity: "warning",
		patient: { id: "p3", name: "Mia Garcia", initials: "MG", age: "1y 8m", gender: "girl" },
		metric: "BMI",
		value: "18.5",
		message: "BMI above 85th percentile",
		recommendation: "Dietary review recommended",
		date: new Date("2024-01-13"),
		isResolved: false
	},
	{
		id: "4",
		alertType: "SEVERE_STUNTING",
		severity: "info",
		patient: { id: "p4", name: "Noah Davis", initials: "ND", age: "6y", gender: "boy" },
		metric: "Milestone",
		value: "Reading",
		message: "Achieved reading milestone early",
		recommendation: "Continue current activities",
		date: new Date("2024-01-12"),
		isResolved: true
	},
	{
		id: "5",
		alertType: "SEVERE_OBESITY",
		severity: "critical",
		patient: { id: "p5", name: "Sophia Taylor", initials: "ST", age: "3y 6m", gender: "girl" },
		metric: "Immunization",
		value: "MMR Booster",
		message: "Vaccination overdue by 3 months",
		recommendation: "Schedule immunization appointment",
		date: new Date("2024-01-11"),
		isResolved: false
	}
];

// ============================================================
// Queries
// ============================================================

const alertsQueryOptions = (filters?: AlertFilter) => ({
	queryKey: ["alerts", "growth", filters],
	queryFn: async () => {
		let filtered = [...mockAlerts];

		if (filters?.severity) {
			filtered = filtered.filter(a => a.severity === filters.severity);
		}
		if (filters?.status === "active") {
			filtered = filtered.filter(a => !a.isResolved);
		}
		if (filters?.status === "resolved") {
			filtered = filtered.filter(a => a.isResolved);
		}
		if (filters?.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				a =>
					a.patient.name.toLowerCase().includes(searchLower) ||
					a.metric.toLowerCase().includes(searchLower) ||
					a.message.toLowerCase().includes(searchLower)
			);
		}

		return filtered;
	},
	staleTime: 1000 * 60 * 2
});

// ============================================================
// Route Definition
// ============================================================

export const Route = createFileRoute("/auth/dashboard/alerts")({
	component: AlertsPage,
	pendingComponent: () => <AlertsPageSkeleton />
});

// ============================================================
// Severity config
// ============================================================

const severityConfig: Record<AlertSeverity, { bg: string; border: string; text: string }> = {
	critical: { bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200", text: "text-red-700" },
	warning: { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200", text: "text-amber-700" },
	info: { bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200", text: "text-blue-700" },
	success: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200", text: "text-emerald-700" }
};

const severityBadgeColors: Record<AlertSeverity, string> = {
	critical: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
	warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
	info: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
	success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
};

const severityLabels: Record<AlertSeverity, string> = {
	critical: "Critical",
	warning: "Warning",
	info: "Info",
	success: "Resolved"
};

// ============================================================
// Main Component
// ============================================================

function AlertsPage() {
	const [filters, setFilters] = useState<AlertFilter>({ status: "active" });
	const [selectedAlert, setSelectedAlert] = useState<UIGrowthAlert | null>(null);
	const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
	const [alertToResolve, setAlertToResolve] = useState<string | null>(null);

	const { data: alerts, refetch } = useSuspenseQuery(alertsQueryOptions(filters));

	const resolveMutation = useMutation({
		mutationFn: async (alertId: string) => {
			await new Promise(resolve => setTimeout(resolve, 500));
			return alertId;
		},
		onSuccess: () => {
			toast.success("Alert resolved successfully");
			refetch();
		},
		onError: () => {
			toast.error("Failed to resolve alert");
		}
	});

	const stats = useMemo(() => {
		const total = alerts.length;
		const active = alerts.filter(a => !a.isResolved).length;
		const resolved = alerts.filter(a => a.isResolved).length;
		const critical = alerts.filter(a => a.severity === "critical").length;
		return { total, active, resolved, critical };
	}, [alerts]);

	const handleResolve = (alertId: string) => {
		setAlertToResolve(alertId);
		setResolveDialogOpen(true);
	};

	const handleConfirmResolve = () => {
		if (alertToResolve) {
			resolveMutation.mutate(alertToResolve);
		}
		setResolveDialogOpen(false);
		setAlertToResolve(null);
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Growth Alerts</h1>
					<p className='text-sea-ink-soft text-sm'>
						Monitor and manage growth-related alerts for your patients
					</p>
				</div>
				<Button
					className='gap-2'
					onClick={() => refetch()}
					size='sm'
					variant='outline'
				>
					<AlertCircle className='h-4 w-4' />
					Refresh
				</Button>
			</div>

			{/* Stats */}
			<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					color='text-slate-500'
					icon={<AlertCircle className='h-4 w-4' />}
					label='Total Alerts'
					value={stats.total}
				/>
				<StatCard
					color='text-amber-500'
					icon={<CheckCircle2 className='h-4 w-4' />}
					label='Active'
					value={stats.active}
				/>
				<StatCard
					color='text-emerald-500'
					icon={<CheckCircle2 className='h-4 w-4' />}
					label='Resolved'
					value={stats.resolved}
				/>
				<StatCard
					color='text-red-500'
					icon={<AlertTriangle className='h-4 w-4' />}
					label='Critical'
					value={stats.critical}
				/>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-center gap-3'>
				<div className='relative min-w-[200px] flex-1'>
					<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						className='pl-9'
						onChange={e => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
						placeholder='Search alerts...'
						value={filters.search || ""}
					/>
				</div>

				<Select
					onValueChange={value =>
						setFilters(prev => ({
							...prev,
							severity: value === "all" ? undefined : (value as AlertSeverity)
						}))
					}
					value={filters.severity || "all"}
				>
					<SelectTrigger className='w-[140px]'>
						<SelectValue placeholder='Severity' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Severities</SelectItem>
						<SelectItem value='critical'>Critical</SelectItem>
						<SelectItem value='warning'>Warning</SelectItem>
						<SelectItem value='info'>Info</SelectItem>
						<SelectItem value='success'>Resolved</SelectItem>
					</SelectContent>
				</Select>

				<Select
					onValueChange={value =>
						setFilters(prev => ({
							...prev,
							type: value === "all" ? undefined : (value as AlertFilter["type"])
						}))
					}
					value={filters.type || "all"}
				>
					<SelectTrigger className='w-[140px]'>
						<SelectValue placeholder='Type' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Types</SelectItem>
						<SelectItem value='weight'>Weight</SelectItem>
						<SelectItem value='height'>Height</SelectItem>
						<SelectItem value='bmi'>BMI</SelectItem>
						<SelectItem value='head_circumference'>Head Circ.</SelectItem>
						<SelectItem value='milestone'>Milestone</SelectItem>
						<SelectItem value='vaccination'>Vaccination</SelectItem>
					</SelectContent>
				</Select>

				<Select
					onValueChange={value => setFilters(prev => ({ ...prev, status: value as AlertFilter["status"] }))}
					value={filters.status || "all"}
				>
					<SelectTrigger className='w-[140px]'>
						<SelectValue placeholder='Status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Status</SelectItem>
						<SelectItem value='active'>Active</SelectItem>
						<SelectItem value='resolved'>Resolved</SelectItem>
					</SelectContent>
				</Select>

				{(filters.severity || filters.type || filters.status !== "active" || filters.search) && (
					<Button
						className='gap-2'
						onClick={() => setFilters({ status: "active" })}
						size='sm'
						variant='ghost'
					>
						<X className='h-4 w-4' />
						Clear
					</Button>
				)}
			</div>

			{/* Alerts List */}
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center justify-between text-lg'>
						<span>Alert List</span>
						<Badge variant='secondary'>{alerts.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{alerts.length === 0 ? (
						<div className='py-12 text-center'>
							<CheckCircle2 className='mx-auto h-12 w-12 text-emerald-500' />
							<p className='mt-3 font-medium text-lg'>No alerts found</p>
							<p className='text-muted-foreground text-sm'>
								{filters.search ? "Try adjusting your search filters" : "All alerts have been resolved"}
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{alerts.map(alert => (
								<AlertListItem
									alert={alert}
									key={alert.id}
									onResolve={handleResolve}
									onView={() => setSelectedAlert(alert)}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AlertModal
				confirmText='Resolve'
				description='This alert will be marked as resolved. You can still view it in the resolved alerts list.'
				isOpen={resolveDialogOpen}
				loading={resolveMutation.isPending}
				onClose={() => setResolveDialogOpen(false)}
				onConfirm={handleConfirmResolve}
				title='Resolve Alert'
				variant='success'
			/>

			{selectedAlert && (
				<AlertDetailDialog
					alert={selectedAlert}
					onClose={() => setSelectedAlert(null)}
					onResolve={() => {
						handleResolve(selectedAlert.id);
						setSelectedAlert(null);
					}}
					open={!!selectedAlert}
				/>
			)}
		</div>
	);
}

// ============================================================
// Sub-Components
// ============================================================

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: number;
	color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
	return (
		<Card>
			<CardContent className='flex items-center gap-3 p-4'>
				<div className={cn("rounded-lg bg-primary/10 p-2", color)}>{icon}</div>
				<div>
					<p className='text-muted-foreground text-xs'>{label}</p>
					<p className='font-bold text-xl'>{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

interface AlertListItemProps {
	alert: UIGrowthAlert;
	onResolve: (id: string) => void;
	onView: () => void;
}

function AlertListItem({ alert, onResolve, onView }: AlertListItemProps) {
	const config = severityConfig[alert.severity];

	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:shadow-sm sm:flex-row sm:items-start sm:justify-between",
				config.bg,
				alert.isResolved && "opacity-70"
			)}
		>
			<div
				className='flex flex-1 cursor-pointer gap-3'
				onClick={onView}
			>
				<div className='mt-0.5 shrink-0'>
					<Avatar className='h-10 w-10'>
						<AvatarFallback className='bg-primary/10 font-medium text-sm'>
							{alert.patient.initials}
						</AvatarFallback>
					</Avatar>
				</div>
				<div className='min-w-0 flex-1 space-y-1'>
					<div className='flex flex-wrap items-center gap-2'>
						<span className='font-medium'>{alert.patient.name}</span>
						<Badge
							className={cn("text-[10px]", severityBadgeColors[alert.severity])}
							variant='secondary'
						>
							{severityLabels[alert.severity]}
						</Badge>
						{alert.isResolved && (
							<Badge
								className='bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
								variant='secondary'
							>
								Resolved
							</Badge>
						)}
						<span className='text-muted-foreground text-xs'>{alert.patient.age}</span>
					</div>
					<p className='text-sm'>
						<span className='font-medium'>{alert.metric}:</span> {alert.value} — {alert.message}
					</p>
					{alert.recommendation && <p className='text-muted-foreground text-xs'>💡 {alert.recommendation}</p>}
					<p className='text-muted-foreground text-xs'>
						{formatDate(alert.date, { month: "short", day: "numeric", year: "numeric" })}
					</p>
				</div>
			</div>

			{!alert.isResolved && (
				<Button
					className='shrink-0 gap-1.5'
					onClick={() => onResolve(alert.id)}
					size='sm'
					variant='outline'
				>
					<CheckCircle2 className='h-4 w-4' />
					Resolve
				</Button>
			)}
		</div>
	);
}

interface AlertDetailDialogProps {
	alert: UIGrowthAlert;
	open: boolean;
	onClose: () => void;
	onResolve: () => void;
}

function AlertDetailDialog({ alert, open, onClose, onResolve }: AlertDetailDialogProps) {
	if (!open) return null;

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
			onClick={onClose}
		>
			<div
				className='mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900'
				onClick={e => e.stopPropagation()}
			>
				<div className='flex items-center justify-between'>
					<h2 className='font-bold text-xl'>Alert Details</h2>
					<Button
						onClick={onClose}
						size='icon'
						variant='ghost'
					>
						<X className='h-4 w-4' />
					</Button>
				</div>

				<div className='mt-4 space-y-3'>
					<div className='flex items-center gap-3'>
						<Avatar className='h-12 w-12'>
							<AvatarFallback className='bg-primary/10 font-medium text-lg'>
								{alert.patient.initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className='font-semibold text-lg'>{alert.patient.name}</p>
							<p className='text-muted-foreground text-sm'>{alert.patient.age}</p>
						</div>
					</div>

					<div className='rounded-lg bg-muted/50 p-3'>
						<p className='text-muted-foreground text-xs'>Alert Type</p>
						<p className='font-medium'>{alert.metric}</p>
					</div>

					<div className='rounded-lg bg-muted/50 p-3'>
						<p className='text-muted-foreground text-xs'>Measurement</p>
						<p className='font-medium'>
							{alert.metric}: {alert.value}
						</p>
					</div>

					<div className='rounded-lg bg-muted/50 p-3'>
						<p className='text-muted-foreground text-xs'>Message</p>
						<p className='font-medium'>{alert.message}</p>
					</div>

					{alert.recommendation && (
						<div className='rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20'>
							<p className='text-muted-foreground text-xs'>Recommendation</p>
							<p className='font-medium text-amber-700 dark:text-amber-400'>{alert.recommendation}</p>
						</div>
					)}

					<div className='flex justify-between text-muted-foreground text-xs'>
						<span>Created: {formatDate(alert.date)}</span>
						<span className='capitalize'>Severity: {alert.severity}</span>
					</div>
				</div>

				{!alert.isResolved && (
					<div className='mt-4 flex gap-2 border-t pt-4'>
						<Button
							className='flex-1'
							onClick={onResolve}
						>
							<CheckCircle2 className='mr-2 h-4 w-4' />
							Resolve Alert
						</Button>
						<Button
							onClick={onClose}
							variant='outline'
						>
							Close
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

// ============================================================
// Skeleton
// ============================================================

function AlertsPageSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='mt-1 h-4 w-64' />
				</div>
				<Skeleton className='h-9 w-24' />
			</div>
			<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton
						className='h-20 w-full'
						key={i}
					/>
				))}
			</div>
			<div className='flex flex-wrap gap-3'>
				<Skeleton className='h-10 w-48' />
				<Skeleton className='h-10 w-32' />
				<Skeleton className='h-10 w-32' />
				<Skeleton className='h-10 w-32' />
			</div>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent className='space-y-3'>
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							className='h-24 w-full'
							key={i}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
