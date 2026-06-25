import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock query options - replace with actual API calls
const growthDashboardQueryOptions = () => ({
	queryKey: ["growth", "dashboard"],
	queryFn: async () => {
		// Replace with actual API call
		return {
			stats: {
				totalPatients: 156,
				activeTracking: 89,
				completed: 67,
				growthAlerts: 12
			},
			recentPatients: [
				{
					id: "1",
					name: "Ahmed Mohamed",
					lastMeasurement: "2024-01-15",
					age: "2 years"
				},
				{
					id: "2",
					name: "Sara Ali",
					lastMeasurement: "2024-01-14",
					age: "1.5 years"
				},
				{
					id: "3",
					name: "Youssef Hassan",
					lastMeasurement: "2024-01-13",
					age: "3 years"
				}
			],
			upcomingMeasurements: [
				{
					id: "1",
					patientName: "Nour El-Din",
					dueDate: "2024-01-20",
					type: "Weight & Height"
				},
				{
					id: "2",
					patientName: "Mariam Ibrahim",
					dueDate: "2024-01-22",
					type: "Head Circumference"
				}
			]
		};
	},
	staleTime: 1000 * 60 * 5
});

export const Route = createFileRoute("/auth/dashboard/growth/")({
	component: GrowthDashboard,
	pendingComponent: () => <GrowthDashboardSkeleton />
});

function GrowthDashboard() {
	const { data } = useSuspenseQuery(growthDashboardQueryOptions());

	const statCards = [
		{
			title: "Total Patients",
			value: data.stats.totalPatients,
			icon: Users,
			color: "text-blue-500"
		},
		{
			title: "Active Tracking",
			value: data.stats.activeTracking,
			icon: Activity,
			color: "text-emerald-500"
		},
		{
			title: "Completed",
			value: data.stats.completed,
			icon: TrendingUp,
			color: "text-purple-500"
		},
		{
			title: "Growth Alerts",
			value: data.stats.growthAlerts,
			icon: Calendar,
			color: "text-amber-500"
		}
	];

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='font-bold text-2xl text-sea-ink md:text-3xl'>Growth Tracking</h1>
					<p className='text-sea-ink-soft text-sm'>Monitor children's growth and development</p>
				</div>
				<Link to='/auth/dashboard/growth/register'>
					<Button className='gap-2'>
						<Plus className='h-4 w-4' />
						Register Child
					</Button>
				</Link>
			</div>

			{/* Stats */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{statCards.map(stat => (
					<Card key={stat.title}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='font-medium text-sm'>{stat.title}</CardTitle>
							<stat.icon className={`h-4 w-4 ${stat.color}`} />
						</CardHeader>
						<CardContent>
							<div className='font-bold text-2xl'>{stat.value}</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				{/* Recent Patients */}
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Recent Patients</CardTitle>
					</CardHeader>
					<CardContent>
						{data.recentPatients.length === 0 ? (
							<p className='text-muted-foreground text-sm'>No recent patients</p>
						) : (
							<div className='space-y-3'>
								{data.recentPatients.map(patient => (
									<Link
										className='block rounded-lg border p-3 transition-colors hover:bg-muted/50'
										key={patient.id}
										params={{ patientId: patient.id }}
										to='/auth/dashboard/growth/$patientId'
									>
										<div className='flex items-center justify-between'>
											<div>
												<p className='font-medium'>{patient.name}</p>
												<p className='text-muted-foreground text-xs'>
													Age: {patient.age} • Last: {patient.lastMeasurement}
												</p>
											</div>
											<Button
												size='sm'
												variant='ghost'
											>
												View
											</Button>
										</div>
									</Link>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Upcoming Measurements */}
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Upcoming Measurements</CardTitle>
					</CardHeader>
					<CardContent>
						{data.upcomingMeasurements.length === 0 ? (
							<p className='text-muted-foreground text-sm'>No upcoming measurements</p>
						) : (
							<div className='space-y-3'>
								{data.upcomingMeasurements.map(item => (
									<div
										className='flex items-center justify-between rounded-lg border p-3'
										key={item.id}
									>
										<div>
											<p className='font-medium'>{item.patientName}</p>
											<p className='text-muted-foreground text-xs'>{item.type}</p>
										</div>
										<div className='text-right'>
											<p className='font-medium text-sm'>Due: {item.dueDate}</p>
											<Button
												className='mt-1 h-7 px-3 text-xs'
												size='sm'
												variant='outline'
											>
												Record
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function GrowthDashboardSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='mt-1 h-4 w-32' />
				</div>
				<Skeleton className='h-10 w-32' />
			</div>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton
						className='h-24 w-full'
						key={i}
					/>
				))}
			</div>
			<div className='grid gap-6 md:grid-cols-2'>
				<Skeleton className='h-64 w-full' />
				<Skeleton className='h-64 w-full' />
			</div>
		</div>
	);
}
