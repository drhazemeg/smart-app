// src/features/dashboard/DashboardPage.tsx

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Button } from "@/components/ui/button";
import { dashboardQueryOptions } from "../queries";
import { GrowthAlertsWidget } from "./GrowthAlertsWidget";
import { MiniCalendar } from "./MiniCalendar";
import { RecentActivity } from "./RecentActivity";
import { StatsGrid } from "./StatsGrid";

export function DashboardPage() {
	const { data, isLoading } = useQuery(dashboardQueryOptions());

	if (isLoading) {
		return <PageSkeleton />;
	}

	if (!data) {
		return (
			<div className='flex h-100 items-center justify-center'>
				<div className='text-center'>
					<p className='text-muted-foreground'>Failed to load dashboard data</p>
					<Button
						className='mt-4'
						onClick={() => window.location.reload()}
						variant='outline'
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<PageHeader
				action={
					<Link to='/auth/dashboard/patients/new'>
						<Button className='gap-2'>
							<Plus className='h-4 w-4' />
							New Patient
						</Button>
					</Link>
				}
				subtitle="Welcome back! Here's what's happening at your clinic today."
				title='Dashboard'
			/>

			<StatsGrid stats={data.stats} />

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<div className='space-y-6 lg:col-span-2'>
					<RecentActivity activities={data.recentActivity} />
				</div>
				<div className='space-y-6'>
					<MiniCalendar appointments={data.todayAppointments} />
					<GrowthAlertsWidget alerts={data.growthAlerts} />
				</div>
			</div>
		</div>
	);
}
