// src/features/dashboard/components/GrowthAlertsWidget.tsx

import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	AlertTriangle,
	ArrowUpRight,
	Baby,
	Bell,
	CheckCircle2,
	Clock,
	TrendingDown,
	TrendingUp,
	User
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

export type AlertSeverity = "critical" | "warning" | "info" | "success";

export type AlertType = "weight" | "height" | "bmi" | "head_circumference" | "milestone" | "vaccination";

export interface GrowthAlert {
	id: string;
	type: AlertType;
	severity: AlertSeverity;
	patient: {
		id: string;
		name: string;
		initials: string;
		age: string;
		gender?: "boy" | "girl" | "other";
	};
	metric: string;
	value: string;
	message: string;
	recommendation?: string;
	date: Date;
	isResolved?: boolean;
	resolvedAt?: Date;
	resolvedBy?: string;
	resolutionNote?: string;
}

// ============================================================
// Constants
// ============================================================

const severityColors: Record<AlertSeverity, string> = {
	critical: "border-red-500/20 bg-red-50 dark:bg-red-950/20",
	warning: "border-amber-500/20 bg-amber-50 dark:bg-amber-950/20",
	info: "border-blue-500/20 bg-blue-50 dark:bg-blue-950/20",
	success: "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20"
};

const severityIcons: Record<AlertSeverity, React.ReactNode> = {
	critical: <AlertTriangle className='h-4 w-4 text-red-500' />,
	warning: <Clock className='h-4 w-4 text-amber-500' />,
	info: <Bell className='h-4 w-4 text-blue-500' />,
	success: <CheckCircle2 className='h-4 w-4 text-emerald-500' />
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

const typeColors: Record<AlertType, string> = {
	weight: "text-blue-500",
	height: "text-emerald-500",
	bmi: "text-purple-500",
	head_circumference: "text-amber-500",
	milestone: "text-pink-500",
	vaccination: "text-cyan-500"
};

// ============================================================
// Props
// ============================================================

interface GrowthAlertsWidgetProps {
	alerts: GrowthAlert[];
	onAlertClick?: (alert: GrowthAlert) => void;
	onResolve?: (alertId: string) => void;
	showResolved?: boolean;
	maxAlerts?: number;
}

// ============================================================
// Sub-Components
// ============================================================

const AlertStatusBadge = ({ severity }: { severity: AlertSeverity }) => (
	<Badge
		className={cn("px-1.5 py-0 text-[9px]", severityBadgeColors[severity])}
		variant='secondary'
	>
		{severityLabels[severity]}
	</Badge>
);

const AlertTrendIcon = ({ severity }: { severity: AlertSeverity }) => {
	switch (severity) {
		case "critical":
			return <TrendingDown className='h-3 w-3 text-red-500' />;
		case "warning":
			return <AlertTriangle className='h-3 w-3 text-amber-500' />;
		case "success":
			return <TrendingUp className='h-3 w-3 text-emerald-500' />;
		default:
			return <TrendingUp className='h-3 w-3 text-blue-500' />;
	}
};

// ============================================================
// Main Component
// ============================================================

export function GrowthAlertsWidget({
	alerts,
	onAlertClick,
	onResolve,
	showResolved = false,
	maxAlerts = 3
}: GrowthAlertsWidgetProps) {
	const filteredAlerts = showResolved ? alerts : alerts.filter(a => !a.isResolved);
	const displayedAlerts = filteredAlerts.slice(0, maxAlerts);
	const hasMore = filteredAlerts.length > maxAlerts;

	if (alerts.length === 0) {
		return (
			<Card>
				<CardHeader className='flex flex-row items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-base'>
						<Baby className='h-4 w-4' />
						Growth Alerts
					</CardTitle>
					<Badge variant='secondary'>0</Badge>
				</CardHeader>
				<CardContent>
					<div className='py-8 text-center'>
						<CheckCircle2 className='mx-auto h-10 w-10 text-emerald-500' />
						<p className='mt-3 font-medium text-muted-foreground text-sm'>All clear!</p>
						<p className='text-muted-foreground text-xs'>No growth alerts to review</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='flex items-center gap-2 text-base'>
					<Baby className='h-4 w-4' />
					Growth Alerts
				</CardTitle>
				<div className='flex items-center gap-2'>
					{!showResolved && filteredAlerts.filter(a => a.severity === "critical").length > 0 && (
						<Badge className='bg-red-500 text-white'>
							{filteredAlerts.filter(a => a.severity === "critical").length} critical
						</Badge>
					)}
					<Badge variant='secondary'>{filteredAlerts.length}</Badge>
				</div>
			</CardHeader>
			<CardContent className='space-y-3'>
				{displayedAlerts.map(alert => (
					<div
						className={cn(
							"group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all",
							"hover:scale-[1.01] hover:shadow-sm",
							severityColors[alert.severity],
							alert.isResolved && "opacity-70"
						)}
						key={alert.id}
						onClick={() => onAlertClick?.(alert)}
					>
						{/* Avatar */}
						<Avatar className='h-9 w-9 shrink-0'>
							<AvatarFallback className='bg-primary/10 font-medium text-xs'>
								{alert.patient.initials}
							</AvatarFallback>
						</Avatar>

						{/* Content */}
						<div className='min-w-0 flex-1 space-y-1'>
							<div className='flex flex-wrap items-start justify-between gap-1'>
								<div className='flex items-center gap-2'>
									<span className='font-medium text-sm'>{alert.patient.name}</span>
									<AlertStatusBadge severity={alert.severity} />
									{alert.isResolved && (
										<Badge
											className='bg-emerald-100 text-[9px] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
											variant='secondary'
										>
											Resolved
										</Badge>
									)}
								</div>
								<AlertTrendIcon severity={alert.severity} />
							</div>

							<p className='text-muted-foreground text-xs leading-relaxed'>
								<span className={cn("font-medium", typeColors[alert.type])}>{alert.metric}:</span>{" "}
								{alert.value} — {alert.message}
							</p>

							{alert.recommendation && (
								<p className='text-[10px] text-muted-foreground/70 italic'>💡 {alert.recommendation}</p>
							)}

							<div className='flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground'>
								<span>{format(alert.date, "MMM d, yyyy")}</span>
								<span>•</span>
								<div className='flex items-center gap-1'>
									{severityIcons[alert.severity]}
									<span className='capitalize'>{severityLabels[alert.severity].toLowerCase()}</span>
								</div>
								<span>•</span>
								<span className='flex items-center gap-1'>
									<User className='h-3 w-3' />
									{alert.patient.age}
								</span>
							</div>
						</div>

						{/* Actions */}
						{!alert.isResolved && onResolve && (
							<Button
								className='h-7 shrink-0 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100'
								onClick={e => {
									e.stopPropagation();
									onResolve(alert.id);
								}}
								size='sm'
								variant='ghost'
							>
								<CheckCircle2 className='mr-1 h-3 w-3' />
								Resolve
							</Button>
						)}
					</div>
				))}

				{(hasMore || filteredAlerts.length > 0) && (
					<Button
						asChild
						className='w-full text-xs'
						size='sm'
						variant='ghost'
					>
						<Link to='/auth/dashboard/alerts'>
							View all {filteredAlerts.length} alerts
							<ArrowUpRight className='ml-1 h-3 w-3' />
						</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
