import { motion } from "framer-motion";
import {
	ActivityIcon,
	BabyIcon,
	CalendarDaysIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	EllipsisVerticalIcon,
	HeartPulseIcon,
	PillIcon,
	RulerIcon,
	StethoscopeIcon,
	SyringeIcon,
	TrendingUpIcon,
	WeightIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const listItems = ["View Details", "Update Records", "Share Report", "Refresh Data"];

// Pediatric growth metrics types
type GrowthMetric = {
	label: string;
	value: string;
	change: number;
	trend: "up" | "down";
	icon: React.ReactNode;
	color: string;
};

type PatientGrowthData = {
	patientName: string;
	patientId: string;
	age: string;
	gender: "Male" | "Female";
	lastVisit: string;
	metrics: {
		weight: { value: string; percentile: number; change: number };
		height: { value: string; percentile: number; change: number };
		bmi: { value: string; percentile: number; change: number };
		headCircumference: { value: string; percentile: number; change: number };
	};
	growthHistory: {
		date: string;
		weight: string;
		height: string;
		headCircumference: string;
		milestones: string[];
	}[];
	vaccinations: {
		name: string;
		date: string;
		status: "Completed" | "Pending" | "Overdue";
	}[];
};

type Props = {
	className?: string;
	patientData: PatientGrowthData;
	onAction?: (action: string) => void;
};

const PediatricGrowthCard = ({ className, patientData, onAction }: Props) => {
	// Calculate growth percentiles for display
	const growthMetrics: GrowthMetric[] = [
		{
			label: "Weight",
			value: patientData.metrics.weight.value,
			change: patientData.metrics.weight.change,
			trend: patientData.metrics.weight.change >= 0 ? "up" : "down",
			icon: <WeightIcon className='size-4' />,
			color: "text-orange-500"
		},
		{
			label: "Height",
			value: patientData.metrics.height.value,
			change: patientData.metrics.height.change,
			trend: patientData.metrics.height.change >= 0 ? "up" : "down",
			icon: <RulerIcon className='size-4' />,
			color: "text-blue-500"
		},
		{
			label: "BMI",
			value: patientData.metrics.bmi.value,
			change: patientData.metrics.bmi.change,
			trend: patientData.metrics.bmi.change >= 0 ? "up" : "down",
			icon: <HeartPulseIcon className='size-4' />,
			color: "text-rose-500"
		},
		{
			label: "Head Circ.",
			value: patientData.metrics.headCircumference.value,
			change: patientData.metrics.headCircumference.change,
			trend: patientData.metrics.headCircumference.change >= 0 ? "up" : "down",
			icon: <ActivityIcon className='size-4' />,
			color: "text-purple-500"
		}
	];

	// Get status color for vaccination
	const getVaccineStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "bg-emerald-100 text-emerald-700";
			case "Pending":
				return "bg-amber-100 text-amber-700";
			case "Overdue":
				return "bg-rose-100 text-rose-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	// Get percentile color
	const getPercentileColor = (percentile: number) => {
		if (percentile < 5) return "text-rose-500";
		if (percentile < 25) return "text-amber-500";
		if (percentile <= 75) return "text-emerald-500";
		if (percentile <= 95) return "text-amber-500";
		return "text-rose-500";
	};

	return (
		<Card className={cn("overflow-hidden border-2 border-primary/10 shadow-lg", className)}>
			<CardContent className='flex flex-col gap-6 p-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-primary/10 p-2.5'>
							<BabyIcon className='size-5 text-primary' />
						</div>
						<div>
							<h3 className='font-semibold text-lg'>{patientData.patientName}</h3>
							<div className='flex items-center gap-3 text-muted-foreground text-sm'>
								<span>ID: {patientData.patientId}</span>
								<span>•</span>
								<span>{patientData.age}</span>
								<span>•</span>
								<span>{patientData.gender}</span>
							</div>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<Badge
							className='bg-primary/5'
							variant='outline'
						>
							<CalendarDaysIcon className='mr-1 size-3' />
							Last: {patientData.lastVisit}
						</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className='size-8 rounded-full text-muted-foreground'
									size='icon'
									variant='ghost'
								>
									<EllipsisVerticalIcon className='size-4' />
									<span className='sr-only'>Menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuGroup>
									{listItems.map((item, index) => (
										<DropdownMenuItem
											key={index}
											onClick={() => onAction?.(item)}
										>
											{item}
										</DropdownMenuItem>
									))}
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Growth Metrics Grid */}
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
					{growthMetrics.map((metric, index) => (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className='rounded-lg border bg-card/50 p-3'
							initial={{ opacity: 0, y: 10 }}
							key={metric.label}
							transition={{ delay: index * 0.1 }}
						>
							<div className='flex items-center gap-2'>
								<div className={metric.color}>{metric.icon}</div>
								<span className='font-medium text-muted-foreground text-xs uppercase tracking-wider'>
									{metric.label}
								</span>
							</div>
							<div className='mt-1 flex items-end justify-between'>
								<span className='font-bold text-lg'>{metric.value}</span>
								<span className='flex items-center gap-0.5 text-xs'>
									{metric.trend === "up" ? (
										<ChevronUpIcon className='size-3 text-emerald-500' />
									) : (
										<ChevronDownIcon className='size-3 text-rose-500' />
									)}
									<span className={metric.trend === "up" ? "text-emerald-500" : "text-rose-500"}>
										{Math.abs(metric.change)}%
									</span>
								</span>
							</div>
						</motion.div>
					))}
				</div>

				{/* Growth Percentiles */}
				<div className='space-y-3'>
					<h4 className='font-medium text-sm'>Growth Percentiles</h4>
					<div className='grid gap-3 sm:grid-cols-3'>
						{Object.entries(patientData.metrics).map(([key, value]) => {
							const percentile = value.percentile;
							const color = getPercentileColor(percentile);
							return (
								<div
									className='space-y-1.5'
									key={key}
								>
									<div className='flex justify-between text-xs'>
										<span className='text-muted-foreground capitalize'>{key}</span>
										<span className={cn("font-medium", color)}>{percentile}th percentile</span>
									</div>
									<Progress
										className={cn(
											"h-2",
											percentile < 5
												? "bg-rose-200 [&>div]:bg-rose-500"
												: percentile < 25
													? "bg-amber-200 [&>div]:bg-amber-500"
													: percentile <= 75
														? "bg-emerald-200 [&>div]:bg-emerald-500"
														: percentile <= 95
															? "bg-amber-200 [&>div]:bg-amber-500"
															: "bg-rose-200 [&>div]:bg-rose-500"
										)}
										value={percentile}
									/>
									<Progress
										className={cn(
											"h-2",
											percentile < 5
												? "bg-rose-200"
												: percentile < 25
													? "bg-amber-200"
													: percentile <= 75
														? "bg-emerald-200"
														: percentile <= 95
															? "bg-amber-200"
															: "bg-rose-200",
											// Target the underlying primitive layout block cleanly via utility selectors
											percentile < 5
												? "[&>div]:bg-rose-500"
												: percentile < 25
													? "[&>div]:bg-amber-500"
													: percentile <= 75
														? "[&>div]:bg-emerald-500"
														: percentile <= 95
															? "[&>div]:bg-amber-500"
															: "[&>div]:bg-rose-500"
										)}
										value={percentile}
									/>
								</div>
							);
						})}
					</div>
				</div>

				{/* Growth History */}
				<div className='space-y-3'>
					<div className='flex items-center justify-between'>
						<h4 className='font-medium text-sm'>Recent Growth History</h4>
						<Button
							className='h-7 text-xs'
							size='sm'
							variant='ghost'
						>
							View All
						</Button>
					</div>
					<div className='space-y-2'>
						{patientData.growthHistory.slice(0, 3).map((record, index) => (
							<motion.div
								animate={{ opacity: 1, x: 0 }}
								className='flex items-center justify-between rounded-lg bg-secondary/30 p-3'
								initial={{ opacity: 0, x: -10 }}
								key={index}
								transition={{ delay: 0.2 + index * 0.1 }}
							>
								<div className='flex items-center gap-3'>
									<CalendarDaysIcon className='size-4 text-muted-foreground' />
									<span className='font-medium text-sm'>{record.date}</span>
								</div>
								<div className='flex gap-4 text-sm'>
									<span>W: {record.weight}</span>
									<span>H: {record.height}</span>
									<span>HC: {record.headCircumference}</span>
								</div>
								<div className='flex gap-1'>
									{record.milestones.slice(0, 2).map((milestone, idx) => (
										<Badge
											className='text-[10px]'
											key={idx}
											variant='secondary'
										>
											{milestone}
										</Badge>
									))}
									{record.milestones.length > 2 && (
										<Badge
											className='text-[10px]'
											variant='secondary'
										>
											+{record.milestones.length - 2}
										</Badge>
									)}
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Vaccinations */}
				<div className='space-y-3'>
					<div className='flex items-center justify-between'>
						<h4 className='font-medium text-sm'>Vaccinations</h4>
						<Badge
							className='text-[10px]'
							variant='outline'
						>
							<SyringeIcon className='mr-1 size-3' />
							{patientData.vaccinations.filter(v => v.status === "Completed").length}/
							{patientData.vaccinations.length}
						</Badge>
					</div>
					<div className='grid gap-2 sm:grid-cols-2'>
						{patientData.vaccinations.slice(0, 4).map((vaccine, index) => (
							<div
								className='flex items-center justify-between rounded-lg border bg-card/30 p-2.5'
								key={index}
							>
								<div className='flex items-center gap-2'>
									<PillIcon className='size-3.5 text-muted-foreground' />
									<span className='text-sm'>{vaccine.name}</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='text-[10px] text-muted-foreground'>{vaccine.date}</span>
									<Badge className={cn("text-[10px]", getVaccineStatusColor(vaccine.status))}>
										{vaccine.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quick Actions */}
				<div className='flex flex-wrap gap-2 border-t pt-4'>
					<Button
						className='flex-1'
						size='sm'
						variant='outline'
					>
						<StethoscopeIcon className='mr-2 size-4' />
						Record Visit
					</Button>
					<Button
						className='flex-1'
						size='sm'
						variant='outline'
					>
						<SyringeIcon className='mr-2 size-4' />
						Vaccination
					</Button>
					<Button
						className='flex-1'
						size='sm'
						variant='outline'
					>
						<TrendingUpIcon className='mr-2 size-4' />
						Growth Chart
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default PediatricGrowthCard;

// Example usage with mock data
export const examplePatientData: PatientGrowthData = {
	patientName: "Emma Johnson",
	patientId: "P-2024-001",
	age: "24 months",
	gender: "Female",
	lastVisit: "2026-06-15",
	metrics: {
		weight: { value: "12.5 kg", percentile: 65, change: 5.2 },
		height: { value: "87 cm", percentile: 70, change: 3.8 },
		bmi: { value: "16.5", percentile: 55, change: -1.2 },
		headCircumference: { value: "48.5 cm", percentile: 60, change: 2.1 }
	},
	growthHistory: [
		{
			date: "2026-06-15",
			weight: "12.5 kg",
			height: "87 cm",
			headCircumference: "48.5 cm",
			milestones: ["Walking", "First words"]
		},
		{
			date: "2026-05-15",
			weight: "12.2 kg",
			height: "86.5 cm",
			headCircumference: "48.2 cm",
			milestones: ["Standing"]
		},
		{
			date: "2026-04-15",
			weight: "11.9 kg",
			height: "85.8 cm",
			headCircumference: "47.8 cm",
			milestones: ["Crawling"]
		}
	],
	vaccinations: [
		{ name: "MMR", date: "2026-06-01", status: "Completed" },
		{ name: "DTaP", date: "2026-05-15", status: "Completed" },
		{ name: "Polio", date: "2026-04-20", status: "Pending" },
		{ name: "Hib", date: "2026-03-10", status: "Overdue" },
		{ name: "Hepatitis B", date: "2026-02-15", status: "Completed" },
		{ name: "Varicella", date: "2026-07-01", status: "Pending" }
	]
};
