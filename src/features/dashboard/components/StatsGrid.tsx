// src/features/dashboard/components/StatsGrid.tsx

import { Activity, CalendarCheck, Clock, Stethoscope, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatItem = {
	label: string;
	value: string | number;
	change?: number;
	icon?: React.ReactNode;
	color?: string;
};

type StatsGridProps = {
	stats: StatItem[];
};

const iconMap: Record<string, React.ReactNode> = {
	patients: <Users className='h-4 w-4' />,
	appointments: <CalendarCheck className='h-4 w-4' />,
	waiting: <Clock className='h-4 w-4' />,
	active: <Activity className='h-4 w-4' />,
	procedures: <Stethoscope className='h-4 w-4' />,
	growth: <TrendingUp className='h-4 w-4' />
};

const colorMap: Record<string, string> = {
	blue: "text-blue-500 bg-blue-50",
	green: "text-green-500 bg-green-50",
	purple: "text-purple-500 bg-purple-50",
	orange: "text-orange-500 bg-orange-50",
	red: "text-red-500 bg-red-50",
	teal: "text-teal-500 bg-teal-50"
};

export function StatsGrid({ stats }: StatsGridProps) {
	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{stats.map((stat, index) => {
				const iconKey = stat.icon?.toString() || "";
				const colorKey = stat.color || "blue";
				const icon = typeof stat.icon === "string" ? iconMap[iconKey] || iconMap.patients : stat.icon;

				return (
					<Card key={index}>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='font-medium text-sm'>{stat.label}</CardTitle>
							{icon && (
								<div className={cn("rounded-md p-1.5", colorMap[colorKey] || colorMap.blue)}>
									{icon}
								</div>
							)}
						</CardHeader>
						<CardContent>
							<div className='font-bold text-2xl'>{stat.value}</div>
							{stat.change !== undefined && (
								<p className={cn("mt-1 text-xs", stat.change > 0 ? "text-green-600" : "text-red-600")}>
									{stat.change > 0 ? "↑" : "↓"} {Math.abs(stat.change)}% from last month
								</p>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
