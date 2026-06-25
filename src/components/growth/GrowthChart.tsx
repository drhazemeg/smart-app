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

export interface GrowthChartData {
	ageInMonths: number;
	weight?: number;
	height?: number;
	bmi?: number;
	date: string;
}

interface GrowthChartProps {
	data: GrowthChartData[];
	metric: "weight" | "height" | "bmi";
	referenceLines?: {
		sd3neg: number;
		sd2neg: number;
		sd1neg: number;
		sd0: number;
		sd1: number;
		sd2: number;
		sd3: number;
	};
	title?: string;
}

const metricConfig = {
	weight: {
		label: "Weight (kg)",
		color: "#78716c",
		dataKey: "weight"
	},
	height: {
		label: "Height (cm)",
		color: "#92400e",
		dataKey: "height"
	},
	bmi: {
		label: "BMI",
		color: "#6b5b95",
		dataKey: "bmi"
	}
};

const sdColors = {
	sd3neg: "#ef4444", // -3 SD (red)
	sd2neg: "#f97316", // -2 SD (orange)
	sd1neg: "#eab308", // -1 SD (yellow)
	sd0: "#16a34a", // 0 SD (green - median)
	sd1: "#eab308", // +1 SD (yellow)
	sd2: "#f97316", // +2 SD (orange)
	sd3: "#ef4444" // +3 SD (red)
};

/**
 * Growth Chart Component
 * Displays patient growth records with WHO reference Z-score bands
 */
export function GrowthChart({ data, metric, referenceLines, title }: GrowthChartProps) {
	const config = metricConfig[metric];

	// Prepare chart data with sorted ages
	const chartData = [...data]
		.sort((a, b) => a.ageInMonths - b.ageInMonths)
		.map(d => ({
			...d,
			[config.dataKey]: d[config.dataKey as keyof GrowthChartData]
		}));

	if (chartData.length === 0) {
		return (
			<div className='flex h-80 w-full items-center justify-center rounded-lg border border-stone-200 bg-stone-50'>
				<p className='text-stone-500'>No measurements yet</p>
			</div>
		);
	}

	return (
		<div className='w-full rounded-lg border border-stone-200 bg-white p-6 shadow-sm'>
			<h3 className='mb-4 font-semibold text-lg text-stone-900'>{title || `${config.label} Growth Chart`}</h3>

			<ResponsiveContainer
				height={400}
				width='100%'
			>
				<LineChart data={chartData}>
					<CartesianGrid
						stroke='#e7e5e4'
						strokeDasharray='3 3'
						vertical={true}
					/>
					<XAxis
						dataKey='ageInMonths'
						label={{
							value: "Age (months)",
							position: "insideBottomRight",
							offset: -5,
							fill: "#57534e"
						}}
						stroke='#a8a29e'
					/>
					<YAxis
						label={{
							value: config.label,
							angle: -90,
							position: "insideLeft",
							fill: "#57534e"
						}}
						stroke='#a8a29e'
					/>

					{/* Reference Z-score bands */}
					{referenceLines && (
						<>
							<ReferenceLine
								label={{
									value: "-3 SD",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.5}
								stroke={sdColors.sd3neg}
								strokeDasharray='5 5'
								y={referenceLines.sd3neg}
							/>
							<ReferenceLine
								label={{
									value: "-2 SD",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.5}
								stroke={sdColors.sd2neg}
								strokeDasharray='5 5'
								y={referenceLines.sd2neg}
							/>
							<ReferenceLine
								label={{
									value: "-1 SD",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.5}
								stroke={sdColors.sd1neg}
								strokeDasharray='5 5'
								y={referenceLines.sd1neg}
							/>
							<ReferenceLine
								label={{
									value: "Median (0 SD)",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.7}
								stroke={sdColors.sd0}
								y={referenceLines.sd0}
							/>
							<ReferenceLine
								label={{
									value: "+1 SD",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.5}
								stroke={sdColors.sd1}
								strokeDasharray='5 5'
								y={referenceLines.sd1}
							/>
							<ReferenceLine
								label={{
									value: "+2 SD",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.5}
								stroke={sdColors.sd2}
								strokeDasharray='5 5'
								y={referenceLines.sd2}
							/>
							<ReferenceLine
								label={{
									value: "+3 SD",
									position: "right",
									fill: "#666",
									fontSize: 11
								}}
								opacity={0.5}
								stroke={sdColors.sd3}
								strokeDasharray='5 5'
								y={referenceLines.sd3}
							/>
						</>
					)}

					<Tooltip
						contentStyle={{
							backgroundColor: "#fafaf8",
							border: "1px solid #e7e5e4",
							borderRadius: "0.5rem"
						}}
						formatter={value => {
							if (typeof value === "number") {
								return value.toFixed(2);
							}
							return value;
						}}
					/>

					<Legend
						wrapperStyle={{
							paddingTop: "1rem"
						}}
					/>

					{/* Patient data line */}
					<Line
						activeDot={{
							r: 7,
							fill: "#78716c"
						}}
						dataKey={config.dataKey}
						dot={{
							fill: config.color,
							r: 5
						}}
						isAnimationActive={true}
						name={config.label}
						stroke={config.color}
						strokeWidth={2}
						type='monotone'
					/>
				</LineChart>
			</ResponsiveContainer>

			<div className='mt-6 rounded border border-stone-200 bg-stone-50 p-4'>
				<h4 className='mb-2 font-semibold text-sm text-stone-900'>Z-Score Reference Guide</h4>
				<div className='grid grid-cols-2 gap-2 text-stone-600 text-xs'>
					<div className='flex items-center gap-2'>
						<div className='h-0.5 w-3 bg-red-500' />
						<span>&lt; -3 SD: Severely Below</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-0.5 w-3 bg-orange-500' />
						<span>-2 to -3 SD: Moderately Below</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-0.5 w-3 bg-yellow-500' />
						<span>-1 to -2 SD: Slightly Below</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-0.5 w-3 bg-green-600' />
						<span>Around Median (0 SD)</span>
					</div>
				</div>
			</div>
		</div>
	);
}
