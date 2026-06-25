// src/components/common/PageSkeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
	return (
		<div className='space-y-6 p-6'>
			<div className='flex flex-col space-y-2'>
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-4 w-72' />
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5'>
				{Array.from({ length: 5 }).map(_ => (
					<Card key={`stats-skeleton-${_}`}>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-8 w-12' />
								</div>
								<Skeleton className='h-10 w-10 rounded-lg' />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<div className='space-y-6 lg:col-span-2'>
					<Card>
						<CardContent className='p-6'>
							<div className='space-y-4'>
								{Array.from({ length: 5 }).map(_ => (
									<div
										className='flex items-center gap-3'
										key={`activity-skeleton-${_}`}
									>
										<Skeleton className='h-8 w-8 rounded-full' />
										<div className='flex-1 space-y-1'>
											<div className='flex items-center justify-between'>
												<Skeleton className='h-4 w-32' />
												<Skeleton className='h-3 w-16' />
											</div>
											<Skeleton className='h-3 w-48' />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
				<div className='space-y-6'>
					<Card>
						<CardContent className='p-6'>
							<Skeleton className='h-50 w-full' />
						</CardContent>
					</Card>
					<Card>
						<CardContent className='p-6'>
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-4 w-16' />
								</div>
								{Array.from({ length: 3 }).map(_ => (
									<div
										className='flex items-center gap-3'
										key={`alert-skeleton-${_}`}
									>
										<Skeleton className='h-8 w-8 rounded-full' />
										<div className='flex-1 space-y-1'>
											<div className='flex items-center justify-between'>
												<Skeleton className='h-4 w-24' />
												<Skeleton className='h-3 w-12' />
											</div>
											<Skeleton className='h-3 w-32' />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
