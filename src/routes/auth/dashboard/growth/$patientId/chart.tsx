import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - replace with actual API call
const growthChartQueryOptions = (patientId: string, metric: string) => ({
	queryKey: ["growth", "chart", patientId, metric],
	queryFn: () => {
		// Simulate API call
		const data = [
			{ age: 0, value: 3.5, zScore: 0 },
			{ age: 3, value: 5.2, zScore: 0.5 },
			{ age: 6, value: 6.8, zScore: -0.3 },
			{ age: 9, value: 7.5, zScore: -0.8 },
			{ age: 12, value: 8.2, zScore: -0.5 },
			{ age: 15, value: 9.0, zScore: 0.2 },
			{ age: 18, value: 9.8, zScore: 0.8 },
			{ age: 21, value: 10.5, zScore: 0.3 },
			{ age: 24, value: 11.2, zScore: -0.2 }
		];

		const referenceLines = [
			{
				age: 0,
				sd3neg: 2.0,
				sd2neg: 2.5,
				sd1neg: 3.0,
				median: 3.5,
				sd1pos: 4.0,
				sd2pos: 4.5,
				sd3pos: 5.0
			},
			{
				age: 6,
				sd3neg: 4.0,
				sd2neg: 5.0,
				sd1neg: 5.8,
				median: 6.8,
				sd1pos: 7.8,
				sd2pos: 8.8,
				sd3pos: 9.8
			},
			{
				age: 12,
				sd3neg: 5.5,
				sd2neg: 6.5,
				sd1neg: 7.3,
				median: 8.2,
				sd1pos: 9.2,
				sd2pos: 10.2,
				sd3pos: 11.2
			},
			{
				age: 18,
				sd3neg: 7.0,
				sd2neg: 8.0,
				sd1neg: 8.8,
				median: 9.8,
				sd1pos: 10.8,
				sd2pos: 11.8,
				sd3pos: 12.8
			},
			{
				age: 24,
				sd3neg: 8.5,
				sd2neg: 9.5,
				sd1neg: 10.3,
				median: 11.2,
				sd1pos: 12.2,
				sd2pos: 13.2,
				sd3pos: 14.2
			}
		];

		return {
			chartData: data,
			referenceLines,
			metric,
			unit: "kg"
		};
	},
	staleTime: 1000 * 60 * 5
});

export const Route = createFileRoute("/auth/dashboard/growth/$patientId/chart")({
	component: GrowthChartPage,
	pendingComponent: () => <GrowthChartSkeleton />,
	loader: async ({ params }) => {
		try {
			const queryOptions = growthChartQueryOptions(params.patientId, "weight");
			return await queryOptions.queryFn();
		} catch {
			throw notFound();
		}
	}
});

function GrowthChartPage() {
	const { patientId } = Route.useParams();
	const [metric, setMetric] = useState<"weight" | "height" | "bmi">("weight");

	const { data } = useSuspenseQuery(growthChartQueryOptions(patientId, metric));

	const metricLabels = {
		weight: { label: "Weight", unit: "kg" },
		height: { label: "Height", unit: "cm" },
		bmi: { label: "BMI", unit: "kg/m²" }
	};

	const formatXAxis = (age: number) => {
		if (age < 12) {
			return `${age}m`;
		}
		if (age < 24) {
			return `${age}m`;
		}
		return `${Math.floor(age / 12)}y ${age % 12}m`;
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link
					params={{ patientId }}
					to='/auth/dashboard/growth/$patientId'
				>
					<Button
						size='icon'
						variant='ghost'
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
				</Link>
				<div>
					<h1 className='font-bold text-2xl text-sea-ink'>Growth Chart</h1>
					<p className='text-sea-ink-soft text-sm'>Track growth over time with WHO standards</p>
				</div>
			</div>

			{/* Chart Controls */}
			<div className='flex flex-wrap items-center justify-between gap-4'>
				<Tabs
					onValueChange={v => setMetric(v as typeof metric)}
					value={metric}
				>
					<TabsList>
						<TabsTrigger value='weight'>Weight</TabsTrigger>
						<TabsTrigger value='height'>Height</TabsTrigger>
						<TabsTrigger value='bmi'>BMI</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Chart */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>{metricLabels[metric].label} Chart</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-100 w-full'>
						<ResponsiveContainer
							height='100%'
							width='100%'
						>
							<LineChart
								data={data.chartData}
								margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
							>
								<CartesianGrid
									opacity={0.5}
									strokeDasharray='3 3'
								/>
								<XAxis
									dataKey='age'
									label={{
										value: "Age (months)",
										position: "bottom",
										offset: 0
									}}
									tickFormatter={formatXAxis}
								/>
								<YAxis
									label={{
										value: `${metricLabels[metric].label} (${metricLabels[metric].unit})`,
										angle: -90,
										position: "left",
										offset: -5
									}}
								/>
								<Tooltip
									formatter={value => {
										// FIX: Use 'any' to bypass complex Recharts type inference issues
										// Recharts' formatter can sometimes pass an array for 'value'.
										const displayValue = Array.isArray(value) ? value[0] : value; // Access first element if array
										return `${displayValue} ${metricLabels[metric].unit}`;
									}}
									labelFormatter={label => `Age: ${formatXAxis(label as number)}`}
								/>
								<Legend />

								{/* Reference Lines */}
								<Line
									data={data.referenceLines}
									dataKey='sd3neg'
									dot={false}
									legendType='none'
									name='-3 SD'
									stroke='#e74c3c'
									strokeDasharray='5 5'
								/>
								<Line
									data={data.referenceLines}
									dataKey='sd2neg'
									dot={false}
									legendType='none'
									name='-2 SD'
									stroke='#f39c12'
									strokeDasharray='5 5'
								/>
								<Line
									data={data.referenceLines}
									dataKey='median'
									dot={false}
									name='Median'
									stroke='#2ecc71'
									strokeDasharray='5 5'
								/>
								<Line
									data={data.referenceLines}
									dataKey='sd2pos'
									dot={false}
									legendType='none'
									name='+2 SD'
									stroke='#f39c12'
									strokeDasharray='5 5'
								/>
								<Line
									data={data.referenceLines}
									dataKey='sd3pos'
									dot={false}
									legendType='none'
									name='+3 SD'
									stroke='#e74c3c'
									strokeDasharray='5 5'
								/>

								{/* Patient Data */}
								<Line
									dataKey='value'
									dot={{ r: 4 }}
									name='Patient'
									stroke='#3498db'
									strokeWidth={2}
									type='monotone'
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className='mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4'>
						<div className='rounded-lg border p-2'>
							<span className='text-muted-foreground'>Latest Value</span>
							<p className='font-medium'>
								{data.chartData.at(-1)?.value || "N/A"} {metricLabels[metric].unit}
							</p>
						</div>
						<div className='rounded-lg border p-2'>
							<span className='text-muted-foreground'>Latest Z-Score</span>
							<p className='font-medium'>{data.chartData.at(-1)?.zScore?.toFixed(2) || "N/A"}</p>
						</div>
						<div className='rounded-lg border p-2'>
							<span className='text-muted-foreground'>Total Measurements</span>
							<p className='font-medium'>{data.chartData.length}</p>
						</div>
						<div className='rounded-lg border p-2'>
							<span className='text-muted-foreground'>Age Range</span>
							<p className='font-medium'>
								{formatXAxis(data.chartData[0]?.age || 0)} -
								{formatXAxis(data.chartData.at(-1)?.age || 0)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function GrowthChartSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Skeleton className='h-10 w-10' />
				<div>
					<Skeleton className='h-7 w-48' />
					<Skeleton className='mt-1 h-4 w-32' />
				</div>
			</div>
			<Skeleton className='h-10 w-64' />
			<Skeleton className='h-112.5 w-full' />
		</div>
	);
}
