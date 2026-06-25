// products/services/components/service-categories.tsx
import { useSuspenseQuery } from "@tanstack/react-query";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { serviceCategoriesOptions } from "../api/queries";
import { categoryColors as CATEGORY_COLORS, categoryIcons as CATEGORY_ICONS } from "../constants/service-options";

export default function ServiceCategories() {
	const { data: categories, isLoading } = useSuspenseQuery(serviceCategoriesOptions());

	if (isLoading) {
		return (
			<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
				{[...Array(8)].map((_, i) => (
					<Skeleton
						className='h-24 w-full'
						key={i}
					/>
				))}
			</div>
		);
	}

	if (!categories || categories.length === 0) {
		return (
			<Card>
				<CardContent className='py-8 text-center text-muted-foreground'>No categories found</CardContent>
			</Card>
		);
	}

	// const categoryCounts: Record<string, number> = {};
	// This would come from an API call, but for now we'll show the categories

	return (
		<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
			{categories.map(category => {
				const color = CATEGORY_COLORS[category] || "#6b7280";
				const icon = CATEGORY_ICONS[category] || "📌";
				const label = category
					.split("_")
					.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
					.join(" ");

				return (
					<Card
						className='cursor-pointer transition-colors hover:bg-accent/50'
						key={category}
					>
						<CardContent className='flex flex-col items-center p-4 text-center'>
							<div
								className='mb-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl'
								style={{ backgroundColor: `${color}20` }}
							>
								<span style={{ color }}>{icon}</span>
							</div>
							<CardTitle className='font-medium text-sm'>{label}</CardTitle>
							<span className='text-muted-foreground text-xs'>{category}</span>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
