"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ActivityIcon,
	ArrowDownIcon,
	ArrowUpIcon,
	BabyIcon,
	CalendarDaysIcon,
	HeartPulseIcon,
	RulerIcon,
	SparklesIcon,
	TrendingUpIcon,
	WeightIcon
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { CartesianGrid, Label, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// ============ Constants & Types ============

type MetricKey = "weight" | "height" | "headCircumference";

interface GrowthMetric {
	icon: React.ReactNode;
	title: string;
	value: string;
	trend: string;
	trendUp: boolean;
	color: string;
}

interface Measurement {
	date: string;
	weight: number;
	height: number;
	bmi: number;
	status: "Normal" | "Underweight" | "Overweight" | "Obese";
}

interface PatientData {
	name: string;
	dob: string;
	gender: string;
	lastVisit: string;
	age: string;
	weight: number;
	height: number;
	headCircumference: number;
}

// ============ Data ============

const GROWTH_METRICS: GrowthMetric[] = [
	{
		icon: <ActivityIcon className='size-5' />,
		title: "Growth Percentile",
		value: "75%",
		trend: "+5%",
		trendUp: true,
		color: "#4CAF50"
	},
	{
		icon: <WeightIcon className='size-5' />,
		title: "Weight",
		value: "14.2 kg",
		trend: "+0.8 kg",
		trendUp: true,
		color: "#FF9800"
	},
	{
		icon: <RulerIcon className='size-5' />,
		title: "Height",
		value: "95.5 cm",
		trend: "+2.3 cm",
		trendUp: true,
		color: "#2196F3"
	},
	{
		icon: <HeartPulseIcon className='size-5' />,
		title: "BMI",
		value: "15.6",
		trend: "-0.2",
		trendUp: false,
		color: "#E91E63"
	}
];

const GROWTH_CHART_DATA = [
	{ age: "0m", weight: 3.3, height: 50, headCircumference: 35, lowerBound: 2.8, upperBound: 4.0 },
	{ age: "1m", weight: 4.3, height: 55, headCircumference: 37, lowerBound: 3.8, upperBound: 5.0 },
	{ age: "2m", weight: 5.2, height: 58, headCircumference: 39, lowerBound: 4.7, upperBound: 6.0 },
	{ age: "3m", weight: 6.0, height: 62, headCircumference: 40, lowerBound: 5.3, upperBound: 7.0 },
	{ age: "4m", weight: 6.7, height: 64, headCircumference: 41.5, lowerBound: 6.0, upperBound: 7.8 },
	{ age: "5m", weight: 7.3, height: 66, headCircumference: 42.5, lowerBound: 6.5, upperBound: 8.5 },
	{ age: "6m", weight: 7.9, height: 68, headCircumference: 43.5, lowerBound: 7.0, upperBound: 9.2 },
	{ age: "9m", weight: 9.0, height: 72, headCircumference: 45, lowerBound: 8.0, upperBound: 10.5 },
	{ age: "12m", weight: 10.0, height: 76, headCircumference: 46, lowerBound: 8.8, upperBound: 11.5 },
	{ age: "18m", weight: 11.5, height: 82, headCircumference: 47.5, lowerBound: 10.0, upperBound: 13.0 },
	{ age: "24m", weight: 12.5, height: 87, headCircumference: 48.5, lowerBound: 11.0, upperBound: 14.5 },
	{ age: "36m", weight: 14.5, height: 96, headCircumference: 50, lowerBound: 13.0, upperBound: 16.5 },
	{ age: "48m", weight: 16.5, height: 103, headCircumference: 51, lowerBound: 15.0, upperBound: 19.0 },
	{ age: "60m", weight: 18.5, height: 110, headCircumference: 52, lowerBound: 17.0, upperBound: 21.0 }
];

const CURRENT_PATIENT: PatientData = {
	name: "Emma Johnson",
	dob: "2024-06-15",
	gender: "Female",
	lastVisit: "2026-06-15",
	age: "24m",
	weight: 12.5,
	height: 87,
	headCircumference: 48.5
};

const RECENT_MEASUREMENTS: Measurement[] = [
	{ date: "2026-06-15", weight: 12.5, height: 87, bmi: 16.5, status: "Normal" },
	{ date: "2026-05-15", weight: 12.2, height: 86.5, bmi: 16.3, status: "Normal" },
	{ date: "2026-04-15", weight: 11.9, height: 85.8, bmi: 16.1, status: "Normal" },
	{ date: "2026-03-15", weight: 11.5, height: 84.5, bmi: 16.0, status: "Normal" }
];

const BMI_DISTRIBUTION_DATA = [
	{ category: "Underweight", value: 5, fill: "#FF5722" },
	{ category: "Normal", value: 65, fill: "#4CAF50" },
	{ category: "Overweight", value: 20, fill: "#FF9800" },
	{ category: "Obese", value: 10, fill: "#F44336" }
];

// ============ Chart Configurations ============

const GROWTH_CHART_CONFIG = {
	weight: { label: "Weight (kg)", color: "#FF9800" },
	height: { label: "Height (cm)", color: "#2196F3" },
	headCircumference: { label: "Head Circumference (cm)", color: "#9C27B0" },
	lowerBound: { label: "Lower Bound (3rd percentile)", color: "#FF5722" },
	upperBound: { label: "Upper Bound (97th percentile)", color: "#4CAF50" }
} satisfies ChartConfig;

const BMI_CHART_CONFIG = {
	underweight: { label: "Underweight", color: "#FF5722" },
	normal: { label: "Normal", color: "#4CAF50" },
	overweight: { label: "Overweight", color: "#FF9800" },
	obese: { label: "Obese", color: "#F44336" }
} satisfies ChartConfig;

// ============ Chart Colors ============

const METRIC_COLORS: Record<MetricKey, string> = {
	weight: "#FF9800",
	height: "#2196F3",
	headCircumference: "#9C27B0"
};

const METRIC_LABELS: Record<MetricKey, string> = {
	weight: "Weight",
	height: "Height",
	headCircumference: "Head Circ."
};

// ============ Animation Variants ============

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 }
};

const scaleIn = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: { opacity: 1, scale: 1 }
};

const slideIn = {
	hidden: { opacity: 0, x: -20 },
	visible: { opacity: 1, x: 0 }
};

// ============ Subcomponents ============

const MetricCard: React.FC<{ metric: GrowthMetric; index: number }> = ({ metric, index }) => (
	<motion.div
		animate='visible'
		className='relative'
		initial='hidden'
		transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 300 }}
		variants={scaleIn}
		whileHover={{ y: -5, transition: { type: "spring", stiffness: 400 } }}
	>
		<Card className='h-full overflow-hidden border-2 border-transparent shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg'>
			<CardContent className='p-4'>
				<div className='flex items-center gap-3'>
					<div
						className='shrink-0 rounded-lg p-2.5'
						style={{ backgroundColor: `${metric.color}15` }}
					>
						<div
							className='text-current'
							style={{ color: metric.color }}
						>
							{metric.icon}
						</div>
					</div>
					<div className='min-w-0 flex-1'>
						<p className='truncate font-medium text-muted-foreground text-xs uppercase tracking-wider'>
							{metric.title}
						</p>
						<p className='font-bold text-2xl leading-tight'>{metric.value}</p>
						<div className='mt-1 flex items-center gap-1.5'>
							{metric.trendUp ? (
								<ArrowUpIcon className='size-3 text-emerald-500' />
							) : (
								<ArrowDownIcon className='size-3 text-rose-500' />
							)}
							<span
								className={cn(
									"font-medium text-xs",
									metric.trendUp ? "text-emerald-500" : "text-rose-500"
								)}
							>
								{metric.trend}
							</span>
							<span className='text-muted-foreground/60 text-xs'>vs last month</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</motion.div>
);

const ChartMetricButton: React.FC<{
	metric: MetricKey;
	selected: MetricKey;
	onSelect: (metric: MetricKey) => void;
}> = ({ metric, selected, onSelect }) => (
	<button
		aria-pressed={selected === metric}
		className={cn(
			"rounded-full px-3.5 py-1.5 font-medium text-xs transition-all duration-200",
			selected === metric
				? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
				: "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80"
		)}
		onClick={() => onSelect(metric)}
		type='button'
	>
		{METRIC_LABELS[metric]}
	</button>
);

const StatusBadge: React.FC<{ status: Measurement["status"] }> = ({ status }) => {
	const colors = {
		Normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
		Underweight: "bg-amber-100 text-amber-700 border-amber-200",
		Overweight: "bg-orange-100 text-orange-700 border-orange-200",
		Obese: "bg-rose-100 text-rose-700 border-rose-200"
	};

	return (
		<Badge
			className={cn("font-medium", colors[status])}
			variant='outline'
		>
			{status}
		</Badge>
	);
};

// ============ Main Component ============

interface GrowthDataPoint {
	age: string;
	[key: string]: string | number; // Allows dynamic metric matching like data[selectedMetric]
}

interface Patient {
	id?: string;
	name?: string;
	growthData?: GrowthDataPoint[];
	// Add other shared criteria properties as needed
}

interface GrowthMetricsCareProps {
	className?: string;
	patient?: Partial<Patient>;
}

const GrowthMetricsCare = ({ className, patient }: GrowthMetricsCareProps) => {
	const [selectedMetric, setSelectedMetric] = useState<MetricKey>("weight");

	const patientData = useMemo(() => ({ ...CURRENT_PATIENT, ...patient }), [patient]);

	const handleMetricSelect = useCallback((metric: MetricKey) => {
		setSelectedMetric(metric);
	}, []);

	// Custom tooltip safely utilizing Recharts standard generic definitions
	const CustomTooltip = useCallback(
		({
			active,
			payload
		}: {
			active?: boolean;
			payload?: ReadonlyArray<{
				payload?: GrowthDataPoint;
				dataKey?: string | number;
				color?: string;
				name?: string;
				value?: string | number;
			}>;
		}) => {
			if (!active || !payload || payload.length === 0) return null;

			// Safely cast payload to your exact data structure
			const data = payload[0]?.payload as GrowthDataPoint | undefined;
			if (!data) return null;

			return (
				<div className='rounded-lg border border-primary/20 bg-popover p-4 shadow-lg'>
					<p className='font-semibold text-sm'>Age: {data.age}</p>
					<div className='mt-2 space-y-1'>
						{payload.map(p => (
							<p
								className='text-sm'
								key={String(p.dataKey)}
								style={{ color: p.color }}
							>
								<span className='font-medium'>{p.name}:</span> {p.value}
							</p>
						))}
					</div>
				</div>
			);
		},
		[]
	);
	return (
		<motion.div
			animate='visible'
			className={cn("space-y-6", className)}
			initial='hidden'
			transition={{ duration: 0.5 }}
			variants={fadeInUp}
		>
			<Card className='overflow-hidden border-2 border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-xl'>
				<CardContent className='p-6'>
					{/* Header */}
					<motion.div
						className='mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'
						transition={{ delay: 0.1 }}
						variants={scaleIn}
					>
						<div className='flex items-center gap-4'>
							<Avatar className='h-16 w-16 border-2 border-primary/20 shadow-md'>
								<AvatarFallback className='bg-linear-to-br from-primary/20 to-primary/5 text-primary text-xl'>
									<BabyIcon className='size-8' />
								</AvatarFallback>
							</Avatar>
							<div>
								<h2 className='font-bold text-2xl text-foreground'>{patientData.name}</h2>
								<div className='mt-1 flex flex-wrap items-center gap-3 text-muted-foreground text-sm'>
									<span className='flex items-center gap-1.5'>
										<CalendarDaysIcon className='size-3.5' />
										DOB: {patientData.dob}
									</span>
									<span className='flex items-center gap-1.5'>
										<span className='inline-block h-2 w-2 rounded-full bg-primary/60' />
										{patientData.gender}
									</span>
									<span className='flex items-center gap-1.5'>
										<ActivityIcon className='size-3.5' />
										Last: {patientData.lastVisit}
									</span>
								</div>
							</div>
						</div>
						<Badge
							className='flex items-center gap-2 bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20'
							variant='secondary'
						>
							<SparklesIcon className='size-4' />
							<span className='font-medium'>Growth Tracking</span>
						</Badge>
					</motion.div>

					{/* Growth Metrics Grid */}
					<div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{GROWTH_METRICS.map((metric, index) => (
							<MetricCard
								index={index}
								key={metric.title}
								metric={metric}
							/>
						))}
					</div>

					{/* Main Growth Chart */}
					<motion.div
						transition={{ delay: 0.3 }}
						variants={fadeInUp}
					>
						<Card className='border-2 border-primary/10 shadow-sm'>
							<CardHeader className='flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between'>
								<CardTitle className='flex items-center gap-2 font-semibold text-lg'>
									<TrendingUpIcon className='size-5 text-primary' />
									Growth Tracking Chart
								</CardTitle>
								<div className='flex gap-1.5'>
									{(["weight", "height", "headCircumference"] as const).map(metric => (
										<ChartMetricButton
											key={metric}
											metric={metric}
											onSelect={handleMetricSelect}
											selected={selectedMetric}
										/>
									))}
								</div>
							</CardHeader>
							<CardContent>
								<div className='h-[320px] w-full'>
									<ChartContainer
										className='h-full w-full'
										config={GROWTH_CHART_CONFIG}
									>
										<LineChart
											data={GROWTH_CHART_DATA}
											margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
										>
											<CartesianGrid
												className='stroke-muted/30'
												strokeDasharray='3 3'
											/>
											<XAxis
												axisLine={{ stroke: "hsl(var(--border))" }}
												dataKey='age'
												tick={{ fontSize: 11 }}
												tickLine={false}
											/>
											<YAxis
												axisLine={{ stroke: "hsl(var(--border))" }}
												label={{
													value:
														selectedMetric === "weight"
															? "Weight (kg)"
															: selectedMetric === "height"
																? "Height (cm)"
																: "Head Circumference (cm)",
													angle: -90,
													position: "insideLeft",
													className: "text-xs text-muted-foreground",
													style: { textAnchor: "middle" }
												}}
												tick={{ fontSize: 11 }}
												tickLine={false}
											/>
											{/** biome-ignore lint/suspicious/noExplicitAny: <ok> */}
											<Tooltip content={CustomTooltip as any} />
											<Legend
												height={36}
												iconSize={10}
												iconType='circle'
												verticalAlign='top'
											/>
											<Line
												activeDot={{ r: 6 }}
												animationDuration={1000}
												animationEasing='ease-in-out'
												dataKey={selectedMetric}
												dot={{
													r: 4,
													fill: "white",
													strokeWidth: 2,
													stroke: METRIC_COLORS[selectedMetric]
												}}
												stroke={METRIC_COLORS[selectedMetric]}
												strokeWidth={3}
												type='monotone'
											/>
											<Line
												animationDuration={1000}
												dataKey='upperBound'
												dot={false}
												opacity={0.6}
												stroke='#4CAF50'
												strokeDasharray='5 5'
												strokeWidth={2}
												type='monotone'
											/>
											<Line
												animationDuration={1000}
												dataKey='lowerBound'
												dot={false}
												opacity={0.6}
												stroke='#FF5722'
												strokeDasharray='5 5'
												strokeWidth={2}
												type='monotone'
											/>
										</LineChart>
									</ChartContainer>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Bottom Section */}
					<div className='mt-6 grid gap-6 lg:grid-cols-2'>
						{/* BMI Distribution */}
						<motion.div
							transition={{ delay: 0.4 }}
							variants={fadeInUp}
						>
							<Card className='h-full border-2 border-primary/10 shadow-sm'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2 font-semibold text-lg'>
										<HeartPulseIcon className='size-5 text-primary' />
										BMI Distribution
									</CardTitle>
								</CardHeader>
								<CardContent className='flex justify-center'>
									<div className='h-[220px] w-full max-w-[300px]'>
										<ChartContainer
											className='h-full w-full'
											config={BMI_CHART_CONFIG}
										>
											<PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
												<ChartTooltip content={<ChartTooltipContent hideLabel />} />
												<Pie
													animationBegin={500}
													animationDuration={1000}
													data={BMI_DISTRIBUTION_DATA}
													dataKey='value'
													innerRadius={55}
													label={({ name, percent }) =>
														`${name} ${((percent ?? 0) * 100).toFixed(0)}%`
													}
													labelLine={{
														stroke: "hsl(var(--muted-foreground))",
														strokeWidth: 1
													}}
													nameKey='category'
													outerRadius={85}
													paddingAngle={2}
												>
													<Label
														content={({ viewBox }) => {
															if (viewBox && "cx" in viewBox && "cy" in viewBox) {
																return (
																	<text
																		dominantBaseline='middle'
																		textAnchor='middle'
																		x={viewBox.cx}
																		y={viewBox.cy}
																	>
																		<tspan
																			className='fill-foreground font-bold text-2xl'
																			x={viewBox.cx}
																			y={(viewBox.cy || 0) - 8}
																		>
																			65%
																		</tspan>
																		<tspan
																			className='fill-muted-foreground text-xs'
																			x={viewBox.cx}
																			y={(viewBox.cy || 0) + 20}
																		>
																			Normal BMI
																		</tspan>
																	</text>
																);
															}
															return null;
														}}
													/>
												</Pie>
											</PieChart>
										</ChartContainer>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Recent Measurements */}
						<motion.div
							transition={{ delay: 0.5 }}
							variants={fadeInUp}
						>
							<Card className='h-full border-2 border-primary/10 shadow-sm'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2 font-semibold text-lg'>
										<CalendarDaysIcon className='size-5 text-primary' />
										Recent Measurements
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<AnimatePresence>
											{RECENT_MEASUREMENTS.map((measurement, index) => (
												<motion.div
													animate='visible'
													className='flex flex-col gap-1 rounded-lg bg-secondary/30 p-3 transition-all hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between'
													initial='hidden'
													key={measurement.date}
													transition={{ delay: 0.1 + index * 0.08 }}
													variants={slideIn}
												>
													<div>
														<p className='font-medium text-sm'>
															{new Date(measurement.date).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
																year: "numeric"
															})}
														</p>
														<div className='mt-0.5 flex flex-wrap gap-3 text-muted-foreground text-xs'>
															<span>Weight: {measurement.weight} kg</span>
															<span>Height: {measurement.height} cm</span>
															<span>BMI: {measurement.bmi}</span>
														</div>
													</div>
													<StatusBadge status={measurement.status} />
												</motion.div>
											))}
										</AnimatePresence>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default GrowthMetricsCare;
