// products/doctors/components/doctor-listing.tsx
import { Suspense } from "react";

import { DoctorTable } from "./doctor-tables";

export default function DoctorListingPage() {
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
			<DoctorTable />
		</Suspense>
	);
}
