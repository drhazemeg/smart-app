// features/patients/components/patient-growth-chart.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { growthChartDataOptions } from "../api/queries";

interface PatientGrowthChartProps {
	patientId: string;
}

type MetricType = "weight" | "height" | "bmi";

// Define the data structure based on what your API actually returns
interface GrowthDataPoint {
	ageMonths: number;
	value: number;
	zScore: number;
	percentile?: number;
}

interface ReferenceLineData {
	age: number;
	sd3neg: number;
	sd2neg: number;
	sd1neg: number;
	median: number;
	sd1pos: number;
	sd2pos: number;
	sd3pos: number;
}

// This should match what growthChartDataOptions returns
interface GrowthChartData {
	data: {
		chartData: GrowthDataPoint[];
		referenceLines: ReferenceLineData[];
		metric: MetricType;
		unit: string;
	};
}

export default function PatientGrowthChart({ patientId }: PatientGrowthChartProps) {
	const [metric, setMetric] = useState<MetricType>("weight");

	// Use the correct type - GrowthChartData might have a nested structure
	const { data } = useSuspenseQuery(growthChartDataOptions(patientId, metric));

	// Extract the actual data from the response
	const growthData = (data as unknown as GrowthChartData)?.data || data;

	if (!growthData?.chartData || growthData.chartData.length === 0) {
		return (
			<Card>
				<CardContent className='flex h-96 items-center justify-center'>
					<p className='text-muted-foreground'>No growth data available</p>
				</CardContent>
			</Card>
		);
	}

	const chartData = growthData.chartData.map((d: GrowthDataPoint) => ({
		ageMonths: d.ageMonths,
		value: d.value,
		zScore: d.zScore,
		percentile: d.percentile
	}));

	const referenceLines = growthData.referenceLines || [];

	const formatXAxis = (value: number) => {
		if (value < 12) return `${value}m`;
		if (value < 24) return `${value}m`;
		return `${Math.floor(value / 12)}y ${Math.round(value % 12)}m`;
	};

	const metricLabels: Record<MetricType, { label: string; unit: string }> = {
		weight: { label: "Weight", unit: "kg" },
		height: { label: "Height", unit: "cm" },
		bmi: { label: "BMI", unit: "kg/m²" }
	};

	// Tooltip formatter with proper type checking
	const tooltipFormatter = (value: unknown) => {
		if (typeof value === "number" && !Number.isNaN(value)) {
			return `${value.toFixed(2)} ${metricLabels[metric].unit}`;
		}
		return String(value ?? "N/A");
	};

	// Label formatter for tooltip
	const labelFormatter = (label: unknown) => {
		if (typeof label === "number") {
			return `Age: ${formatXAxis(label)}`;
		}
		return String(label ?? "N/A");
	};

	const latestDataPoint = growthData.chartData[growthData.chartData.length - 1];

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>Growth Chart</CardTitle>
				<div className='flex flex-wrap gap-2'>
					<Tabs
						className='w-full max-w-md'
						onValueChange={v => setMetric(v as MetricType)}
						value={metric}
					>
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger value='weight'>Weight</TabsTrigger>
							<TabsTrigger value='height'>Height</TabsTrigger>
							<TabsTrigger value='bmi'>BMI</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>
			<CardContent>
				<div className='h-[400px] w-full'>
					<ResponsiveContainer
						height='100%'
						width='100%'
					>
						<LineChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
						>
							<CartesianGrid
								opacity={0.5}
								strokeDasharray='3 3'
							/>
							<XAxis
								dataKey='ageMonths'
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
								formatter={tooltipFormatter}
								labelFormatter={labelFormatter}
							/>
							<Legend />

							{/* Reference lines from WHO standards */}
							{referenceLines.length > 0 && (
								<>
									<Line
										activeDot={false}
										data={referenceLines}
										dataKey='sd3neg'
										dot={false}
										legendType='none'
										name='-3 SD'
										stroke='#e74c3c'
										strokeDasharray='5 5'
									/>
									<Line
										activeDot={false}
										data={referenceLines}
										dataKey='sd2neg'
										dot={false}
										legendType='none'
										name='-2 SD'
										stroke='#f39c12'
										strokeDasharray='5 5'
									/>
									<Line
										activeDot={false}
										data={referenceLines}
										dataKey='median'
										dot={false}
										name='Median'
										stroke='#2ecc71'
										strokeDasharray='5 5'
									/>
									<Line
										activeDot={false}
										data={referenceLines}
										dataKey='sd2pos'
										dot={false}
										legendType='none'
										name='+2 SD'
										stroke='#f39c12'
										strokeDasharray='5 5'
									/>
									<Line
										activeDot={false}
										data={referenceLines}
										dataKey='sd3pos'
										dot={false}
										legendType='none'
										name='+3 SD'
										stroke='#e74c3c'
										strokeDasharray='5 5'
									/>
								</>
							)}

							{/* Patient measurements */}
							<Line
								dataKey='value'
								dot={{ r: 4 }}
								name='Patient'
								stroke='#3498db'
								strokeWidth={2}
								type='monotone'
							/>

							{/* Z-Score reference line at 0 */}
							<ReferenceLine
								stroke='#ccc'
								strokeDasharray='3 3'
								y={0}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				<div className='mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4'>
					<div className='rounded-lg border p-2'>
						<span className='text-muted-foreground'>Latest Value</span>
						<p className='font-medium'>
							{latestDataPoint?.value !== undefined
								? `${latestDataPoint.value.toFixed(2)} ${metricLabels[metric].unit}`
								: "N/A"}
						</p>
					</div>
					<div className='rounded-lg border p-2'>
						<span className='text-muted-foreground'>Latest Z-Score</span>
						<p className='font-medium'>
							{latestDataPoint?.zScore !== undefined ? latestDataPoint.zScore.toFixed(2) : "N/A"}
						</p>
					</div>
					<div className='rounded-lg border p-2'>
						<span className='text-muted-foreground'>Latest Percentile</span>
						<p className='font-medium'>
							{latestDataPoint?.percentile !== undefined
								? `${latestDataPoint.percentile.toFixed(1)}%`
								: "N/A"}
						</p>
					</div>
					<div className='rounded-lg border p-2'>
						<span className='text-muted-foreground'>Total Measurements</span>
						<p className='font-medium'>{growthData.chartData.length}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
