import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalRecordView } from "./MedicalRecordView";

interface MedicalRecordViewPageProps {
	recordId: string;
}

export function MedicalRecordViewPage({ recordId }: MedicalRecordViewPageProps) {
	return (
		<Suspense
			fallback={
				<Card>
					<CardContent className='space-y-4 p-6'>
						<Skeleton className='h-8 w-1/3' />
						<Skeleton className='h-4 w-1/2' />
						<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
							<div className='lg:col-span-2'>
								<Skeleton className='h-64 w-full' />
							</div>
							<div className='space-y-6'>
								<Skeleton className='h-48 w-full' />
								<Skeleton className='h-48 w-full' />
							</div>
						</div>
					</CardContent>
				</Card>
			}
		>
			<MedicalRecordView recordId={recordId} />
		</Suspense>
	);
}
