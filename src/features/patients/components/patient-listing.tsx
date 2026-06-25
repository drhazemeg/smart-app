// products/patients/components/patient-listing.tsx
import { Suspense } from "react";

import { PatientTable } from "./patient-tables";

export default function PatientListingPage() {
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
			<PatientTable />
		</Suspense>
	);
}
