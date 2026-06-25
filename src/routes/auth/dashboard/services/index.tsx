import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, ListFilter, Package, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServicesQueryOptions } from "@/features/services/api/queries";
import ServiceCategories from "@/features/services/components/service-categories";
import { ServiceTable } from "@/features/services/components/service-tables";
import type { ServiceCategory } from "@/features/services/schemas/service";
import { useClinic } from "@/hooks/use-clinic";

export const Route = createFileRoute("/auth/dashboard/services/")({
	component: ServicesPage,
	pendingComponent: () => <ServicesSkeleton />
});

function ServicesPage() {
	const [view, setView] = useState<"list" | "grid">("list");
	const [search, setSearch] = useState("");
	const [selectedCategory] = useState<string | undefined>(undefined);
	const { clinicId } = useClinic();
	const { data } = useSuspenseQuery(
		getServicesQueryOptions({
			page: 1,
			limit: 100,
			clinicId: clinicId || "",
			search: search || undefined,
			category: selectedCategory as ServiceCategory
		})
	);

	// const services = data?.services || [];
	const total = data?.total || 0;

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Services</h1>
					<p className='text-sea-ink-soft text-sm'>Manage your clinic's services and offerings</p>
				</div>
				<Link to='/auth/dashboard/services/new'>
					<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
						<Plus className='h-4 w-4' />
						Add Service
					</Button>
				</Link>
			</div>

			{/* Categories */}
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Package className='h-5 w-5 text-lagoon' />
						Service Categories
						<span className='ml-2 font-normal text-muted-foreground text-sm'>({total} total)</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ServiceCategories />
				</CardContent>
			</Card>

			{/* Service List */}
			<Card>
				<CardHeader className='pb-3'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<ListFilter className='h-5 w-5 text-lagoon' />
							All Services
						</CardTitle>
						<div className='flex items-center gap-2'>
							<div className='relative max-w-sm'>
								<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
								<Input
									className='pl-9'
									onChange={e => setSearch(e.target.value)}
									placeholder='Search services...'
									value={search}
								/>
							</div>
							<Tabs
								className='hidden sm:block'
								onValueChange={v => setView(v as "list" | "grid")}
								value={view}
							>
								<TabsList className='h-9'>
									<TabsTrigger
										className='px-3'
										value='list'
									>
										<ListFilter className='h-4 w-4' />
									</TabsTrigger>
									<TabsTrigger
										className='px-3'
										value='grid'
									>
										<LayoutGrid className='h-4 w-4' />
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<ServiceTable />
				</CardContent>
			</Card>
		</div>
	);
}

function ServicesSkeleton() {
	// Create stable IDs for skeleton items
	const categorySkeletonIds = Array.from({ length: 4 }, (_, i) => `category-skeleton-${i}`);
	const serviceSkeletonIds = Array.from({ length: 5 }, (_, i) => `service-skeleton-${i}`);

	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='mt-1 h-4 w-48' />
				</div>
				<Skeleton className='h-10 w-36' />
			</div>

			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-48' />
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
						{categorySkeletonIds.map(id => (
							<Skeleton
								className='h-24 w-full'
								key={id}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-9 w-48' />
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						{serviceSkeletonIds.map(id => (
							<Skeleton
								className='h-12 w-full'
								key={id}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
