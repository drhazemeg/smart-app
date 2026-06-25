// products/services/components/service-listing.tsx
import { Suspense } from "react";

import { ServiceTable } from "./service-tables";

export default function ServiceListingPage() {
	return (
		<Suspense
			fallback={
				<div className='flex flex-1 animate-pulse flex-col gap-4'>
					<div className='h-10 w-full rounded bg-muted' />
					<div className='h-96 w-full rounded-lg bg-muted' />
					<div className='h-10 w-full rounded bg-muted' />
				</div>
			}
		>
			<ServiceTable />
		</Suspense>
	);
}
