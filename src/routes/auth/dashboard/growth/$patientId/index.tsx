import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Activity, Heart, LineChart, Plus, Ruler, Weight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock query options - replace with actual API calls
const patientGrowthQueryOptions = (patientId: string) => ({
	queryKey: ["growth", "patient", patientId],
	queryFn: async () => {
		// Replace with actual API call
		return {
			id: patientId,
			firstName: "Ahmed",
			lastName: "Mohamed",
			dateOfBirth: "2022-01-15",
			gender: "boy",
			age: "2 years",
			ageMonths: 24,
			latestMeasurement: {
				date: "2024-01-15",
				weight: 12.5,
				height: 85.0,
				bmi: 17.3,
				weightPercentile: 65,
				heightPercentile: 70
			},
			growthAlerts: [
				{
					id: "1",
					type: "weight",
					severity: "warning",
					message: "Weight gain slowing"
				}
			],
			recentMeasurements: [
				{ id: "1", date: "2024-01-15", weight: 12.5, height: 85.0 },
				{ id: "2", date: "2024-01-01", weight: 12.2, height: 84.5 },
				{ id: "3", date: "2023-12-15", weight: 12.0, height: 84.0 }
			]
		};
	},
	staleTime: 1000 * 60 * 5
});

export const Route = createFileRoute("/auth/dashboard/growth/$patientId/")({
	component: PatientGrowthPage,
	pendingComponent: () => <PatientGrowthSkeleton />,
	loader: async ({ params }) => {
		try {
			const queryOptions = patientGrowthQueryOptions(params.patientId);
			return queryOptions;
		} catch {
			throw notFound();
		}
	}
});

function PatientGrowthPage() {
	const { patientId } = Route.useParams();
	const { data: patient } = useSuspenseQuery(patientGrowthQueryOptions(patientId));

	if (!patient) {
		throw notFound();
	}

	const stats = [
		{
			icon: Weight,
			label: "Weight",
			value: patient.latestMeasurement?.weight ? `${patient.latestMeasurement.weight} kg` : "N/A",
			percentile: patient.latestMeasurement?.weightPercentile,
			color: "text-blue-500"
		},
		{
			icon: Ruler,
			label: "Height",
			value: patient.latestMeasurement?.height ? `${patient.latestMeasurement.height} cm` : "N/A",
			percentile: patient.latestMeasurement?.heightPercentile,
			color: "text-emerald-500"
		},
		{
			icon: Activity,
			label: "BMI",
			value: patient.latestMeasurement?.bmi ? `${patient.latestMeasurement.bmi}` : "N/A",
			percentile: null,
			color: "text-purple-500"
		}
	];

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<div className='flex items-center gap-3'>
						<h1 className='font-bold text-2xl text-sea-ink md:text-3xl'>
							{patient.firstName} {patient.lastName}
						</h1>
						<Badge variant='outline'>{patient.age}</Badge>
						<Badge variant='secondary'>
							{patient.gender === "boy" ? "👦" : "👧"} {patient.gender}
						</Badge>
					</div>
					<p className='text-sea-ink-soft text-sm'>
						DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} •{patient.ageMonths} months
					</p>
				</div>
				<div className='flex gap-2'>
					<Link
						params={{ patientId }}
						to='/auth/dashboard/growth/$patientId/add-measurement'
					>
						<Button className='gap-2'>
							<Plus className='h-4 w-4' />
							Add Measurement
						</Button>
					</Link>
					<Link
						params={{ patientId }}
						to='/auth/dashboard/growth/$patientId/chart'
					>
						<Button
							className='gap-2'
							variant='outline'
						>
							<LineChart className='h-4 w-4' />
							Growth Chart
						</Button>
					</Link>
				</div>
			</div>

			{/* Growth Alerts */}
			{patient.growthAlerts && patient.growthAlerts.length > 0 && (
				<Card className='border-amber-200 bg-amber-50'>
					<CardContent className='p-4'>
						<div className='flex items-start gap-3'>
							<Heart className='mt-0.5 h-5 w-5 text-amber-500' />
							<div>
								<p className='font-medium text-amber-800'>Growth Alerts</p>
								{patient.growthAlerts.map(alert => (
									<p
										className='text-amber-700 text-sm'
										key={alert.id}
									>
										• {alert.message}
									</p>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Stats */}
			<div className='grid gap-4 md:grid-cols-3'>
				{stats.map(stat => (
					<Card key={stat.label}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='font-medium text-sm'>{stat.label}</CardTitle>
							<stat.icon className={`h-4 w-4 ${stat.color}`} />
						</CardHeader>
						<CardContent>
							<div className='font-bold text-2xl'>{stat.value}</div>
							{stat.percentile !== null && (
								<p className='text-muted-foreground text-xs'>Percentile: {stat.percentile}%</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Measurements */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center justify-between text-lg'>
						<span>Recent Measurements</span>
						<Link
							params={{ patientId }}
							to='/auth/dashboard/growth/$patientId/add-measurement'
						>
							<Button
								size='sm'
								variant='ghost'
							>
								View All
							</Button>
						</Link>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{patient.recentMeasurements.length === 0 ? (
						<p className='py-4 text-center text-muted-foreground'>No measurements recorded yet</p>
					) : (
						<div className='space-y-2'>
							{patient.recentMeasurements.map(measurement => (
								<div
									className='flex items-center justify-between rounded-lg border p-3'
									key={measurement.id}
								>
									<div>
										<p className='font-medium'>{new Date(measurement.date).toLocaleDateString()}</p>
									</div>
									<div className='flex gap-4 text-sm'>
										<span>Weight: {measurement.weight} kg</span>
										<span>Height: {measurement.height} cm</span>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function PatientGrowthSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='mt-1 h-4 w-32' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-32' />
					<Skeleton className='h-10 w-32' />
				</div>
			</div>
			<div className='grid gap-4 md:grid-cols-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton
						className='h-24 w-full'
						key={i}
					/>
				))}
			</div>
			<Skeleton className='h-64 w-full' />
		</div>
	);
}
