// src/features/dashboard/components/RecentActivity.tsx

import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Activity, CalendarCheck, FileText, HeartPulse, Stethoscope, Syringe, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PatientActivity = {
	id: string;
	type: "appointment" | "registration" | "examination" | "vaccination" | "lab" | "prescription";
	patient: {
		name: string;
		avatar?: string;
		initials: string;
	};
	description: string;
	timestamp: Date;
	status?: "completed" | "pending" | "cancelled";
};

type RecentActivityProps = {
	activities: PatientActivity[];
};

const activityIcons = {
	appointment: <CalendarCheck className='h-4 w-4' />,
	registration: <UserPlus className='h-4 w-4' />,
	examination: <Stethoscope className='h-4 w-4' />,
	vaccination: <Syringe className='h-4 w-4' />,
	lab: <FileText className='h-4 w-4' />,
	prescription: <HeartPulse className='h-4 w-4' />
};

const activityColors = {
	appointment: "bg-blue-500/10 text-blue-600",
	registration: "bg-green-500/10 text-green-600",
	examination: "bg-purple-500/10 text-purple-600",
	vaccination: "bg-orange-500/10 text-orange-600",
	lab: "bg-yellow-500/10 text-yellow-600",
	prescription: "bg-pink-500/10 text-pink-600"
};

const statusColors = {
	completed: "bg-emerald-100 text-emerald-700",
	pending: "bg-amber-100 text-amber-700",
	cancelled: "bg-rose-100 text-rose-700"
};

export function RecentActivity({ activities }: RecentActivityProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle>Recent Activity</CardTitle>
				<Button
					asChild
					size='sm'
					variant='ghost'
				>
					<Link to='/auth/dashboard/activity'>View all</Link>
				</Button>
			</CardHeader>
			<CardContent className='space-y-4'>
				{activities.length === 0 ? (
					<div className='py-8 text-center'>
						<Activity className='mx-auto h-8 w-8 text-muted-foreground' />
						<p className='mt-2 text-muted-foreground text-sm'>No recent activity</p>
					</div>
				) : (
					activities.map(activity => (
						<div
							className='flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50'
							key={activity.id}
						>
							<Avatar className='h-9 w-9'>
								<AvatarFallback className='bg-primary/10 text-xs'>
									{activity.patient.initials}
								</AvatarFallback>
							</Avatar>
							<div className='flex-1 space-y-1'>
								<div className='flex items-center gap-2'>
									<span className='font-medium text-sm'>{activity.patient.name}</span>
									{activity.status && (
										<Badge
											className={cn("text-[10px]", statusColors[activity.status])}
											variant='secondary'
										>
											{activity.status}
										</Badge>
									)}
								</div>
								<p className='text-muted-foreground text-sm'>{activity.description}</p>
								<div className='flex items-center gap-3'>
									<div className={cn("rounded-md p-0.5", activityColors[activity.type])}>
										{activityIcons[activity.type]}
									</div>
									<span className='text-muted-foreground text-xs'>
										{formatDistanceToNow(activity.timestamp, {
											addSuffix: true
										})}
									</span>
								</div>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
