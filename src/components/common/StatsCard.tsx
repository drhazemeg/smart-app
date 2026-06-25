// src/components/common/StatsCard.tsx

import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
	color?: "blue" | "green" | "purple" | "amber" | "teal" | "red" | "pink";
	description?: string;
	icon: LucideIcon;
	title: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	value: number | string;
}

const colorVariants = {
	blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
	green: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
	purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
	amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
	teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
	red: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
	pink: "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400"
};

export function StatsCard({ title, value, icon: Icon, trend, color = "blue", description }: StatsCardProps) {
	return (
		<Card className='transition-all hover:shadow-md'>
			<CardContent className='p-6'>
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<p className='font-medium text-muted-foreground text-sm'>{title}</p>
						<p className='font-bold text-2xl tracking-tight'>{value}</p>
						{trend && (
							<div className='flex items-center gap-1'>
								{trend.isPositive ? (
									<ArrowUp className='h-3 w-3 text-emerald-500' />
								) : (
									<ArrowDown className='h-3 w-3 text-red-500' />
								)}
								<span
									className={cn(
										"font-medium text-xs",
										trend.isPositive
											? "text-emerald-600 dark:text-emerald-400"
											: "text-red-600 dark:text-red-400"
									)}
								>
									{trend.value}%
								</span>
								<span className='text-muted-foreground text-xs'>vs last month</span>
							</div>
						)}
						{description && <p className='text-muted-foreground text-xs'>{description}</p>}
					</div>
					<div className={cn("rounded-lg p-3", colorVariants[color])}>
						<Icon className='h-5 w-5' />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
