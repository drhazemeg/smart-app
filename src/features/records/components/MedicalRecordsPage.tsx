import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalRecordsTable } from "./MedicalRecordsTable";

interface MedicalRecordsPageProps {
	patientId?: string;
}

export function MedicalRecordsPage({ patientId }: MedicalRecordsPageProps) {
	const filters = {
		patientId: patientId,
		clinicId: "current-clinic-id",
		limit: 20
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Medical Records</h1>
					<p className='text-sea-ink-soft text-sm'>Manage patient medical records</p>
				</div>
				<Link
					search={{ patientId }}
					to='/auth/dashboard/medical-records/new'
				>
					<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
						<Plus className='h-4 w-4' />
						New Record
					</Button>
				</Link>
			</div>

			<Suspense
				fallback={
					<Card>
						<CardContent className='space-y-2 p-6'>
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton
									className='h-12 w-full'
									key={i}
								/>
							))}
						</CardContent>
					</Card>
				}
			>
				<MedicalRecordsTable filters={filters} />
			</Suspense>
		</div>
	);
}
