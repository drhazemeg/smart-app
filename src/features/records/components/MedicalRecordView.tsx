import { useQuery } from "@tanstack/react-query";
import { Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, ClipboardList, Stethoscope, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { medicalRecordByIdOptions } from "../api/queries";

interface MedicalRecordViewProps {
	recordId: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	ACTIVE: { label: "Active", variant: "default" },
	INACTIVE: { label: "Inactive", variant: "secondary" },
	ARCHIVED: { label: "Archived", variant: "outline" }
};

export function MedicalRecordView({ recordId }: MedicalRecordViewProps) {
	const { data: record } = useQuery(medicalRecordByIdOptions(recordId));

	if (!record) {
		throw notFound();
	}

	const status = statusConfig[record.status] || statusConfig.ACTIVE;

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link to='/auth/dashboard/medical-records'>
						<Button
							size='icon'
							variant='ghost'
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='font-bold font-serif text-2xl text-sea-ink'>Medical Record</h1>
						<p className='text-sea-ink-soft text-sm'>
							{record.patient?.firstName} {record.patient?.lastName}
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Link
						params={{ recordId }}
						to='/auth/dashboard/medical-records/$recordId/edit'
					>
						<Button variant='outline'>Edit</Button>
					</Link>
				</div>
			</div>

			{/* Content */}
			<div className='grid gap-6 lg:grid-cols-3'>
				<div className='lg:col-span-2'>
					{/* Diagnosis & Treatment */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<ClipboardList className='h-5 w-5 text-lagoon' />
								Diagnosis & Treatment
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Diagnosis</p>
								<p className='mt-1'>{record.diagnosis || "—"}</p>
							</div>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Symptoms</p>
								<p className='mt-1'>{record.symptoms || "—"}</p>
							</div>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Treatment Plan</p>
								<p className='mt-1 whitespace-pre-wrap'>{record.treatmentPlan || "—"}</p>
							</div>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Medications</p>
								<p className='mt-1'>{record.medications || "—"}</p>
							</div>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Lab Request</p>
								<p className='mt-1'>{record.labRequest || "—"}</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className='space-y-6'>
					{/* Patient Card */}
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<User className='h-5 w-5 text-lagoon' />
								Patient
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-1'>
								<p className='font-medium'>
									{record.patient?.firstName} {record.patient?.lastName}
								</p>
								{record.patient?.mrn && (
									<p className='text-muted-foreground text-sm'>MRN: {record.patient.mrn}</p>
								)}
								<Link
									className='mt-2 inline-block'
									params={{ patientId: record.patientId }}
									to='/auth/dashboard/patients/$patientId'
								>
									<Button
										size='sm'
										variant='outline'
									>
										View Profile
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					{/* Doctor Card */}
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Stethoscope className='h-5 w-5 text-lagoon' />
								Doctor
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-1'>
								<p className='font-medium'>Dr. {record.doctor?.name || "Unknown"}</p>
								{record.doctor?.specialty && (
									<p className='text-muted-foreground text-sm'>{record.doctor.specialty}</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Metadata Card */}
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-lg'>Metadata</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Status</span>
								<Badge variant={status.variant}>{status.label}</Badge>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Diagnosis Date</span>
								<span>
									{record.diagnosisDate ? format(new Date(record.diagnosisDate), "MMM d, yyyy") : "—"}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Follow-up</span>
								<span>
									{record.followUpDate
										? format(new Date(record.followUpDate), "MMM d, yyyy")
										: "None"}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Created</span>
								<span>{format(new Date(record.createdAt), "MMM d, yyyy")}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
