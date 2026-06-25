import { Suspense } from "react";

import { AppointmentTable } from "./appointment-tables";

export default function AppointmentListingPage() {
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
			<AppointmentTable />
		</Suspense>
	);
}
