import type { MedicalRecord } from "../api/types";
import { MedicalRecordForm } from "./MedicalRecordForm";

interface MedicalRecordFormPageProps {
	initialData: MedicalRecord | null;
	pageTitle: string;
	patientId?: string;
}

export function MedicalRecordFormPage({ initialData, pageTitle, patientId }: MedicalRecordFormPageProps) {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>{pageTitle}</h1>
				<p className='text-sea-ink-soft text-sm'>
					{initialData
						? "Update the medical record information"
						: "Create a new medical record for a patient"}
				</p>
			</div>
			<MedicalRecordForm
				initialData={initialData}
				pageTitle={pageTitle}
				patientId={patientId}
			/>
		</div>
	);
}
