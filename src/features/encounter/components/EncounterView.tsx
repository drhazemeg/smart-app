// features/encounters/components/EncounterView.tsx

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Stethoscope, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { encounterByIdOptions } from "../api/querries";
import type { Encounter } from "../api/type";
import { encounterStatusBadgeVariants, encounterTypeOptions } from "../constants/encounter-options";

interface EncounterViewProps {
	encounterId: string;
}

export function EncounterView({ encounterId }: EncounterViewProps) {
	const clinicId = "current-clinic-id";
	const { data } = useSuspenseQuery(encounterByIdOptions(encounterId, clinicId));

	if (!data?.success || !data?.encounter) {
		throw notFound();
	}

	const encounter = data.encounter as Encounter;
	const statusVariant = encounterStatusBadgeVariants[encounter.status ?? "PENDING"] || "secondary";
	const typeOption = encounterTypeOptions.find(t => t.value === encounter.type);

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link to='/auth/dashboard/encounters'>
						<Button
							size='icon'
							variant='ghost'
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='font-bold text-2xl'>Encounter Details</h1>
						<div className='flex items-center gap-3 text-muted-foreground text-sm'>
							<span>{format(new Date(encounter.date), "MMM dd, yyyy HH:mm")}</span>
							<span>•</span>
							<Badge variant={statusVariant}>{encounter.status?.toLowerCase()}</Badge>
							<span>•</span>
							<Badge variant='outline'>{typeOption?.label || encounter.type}</Badge>
						</div>
					</div>
				</div>
				{encounter.status !== "COMPLETED" && encounter.status !== "CANCELLED" && (
					<div className='flex gap-2'>
						<Link
							params={{ id: encounterId }}
							to='/auth/dashboard/encounters/$id/edit'
						>
							<Button variant='outline'>Edit</Button>
						</Link>
					</div>
				)}
			</div>

			{/* Content */}
			<div className='grid gap-6 lg:grid-cols-3'>
				<div className='space-y-6 lg:col-span-2'>
					{/* Chief Complaint */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Chief Complaint</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{encounter.symptoms || "No chief complaint recorded"}</p>
						</CardContent>
					</Card>

					{/* History */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>History of Present Illness</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{encounter.notes || "No history recorded"}</p>
						</CardContent>
					</Card>

					{/* Diagnosis & Treatment */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Diagnosis & Treatment</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Diagnosis</p>
								<p className='mt-1'>{encounter.diagnosis || "No diagnosis recorded"}</p>
							</div>
							<div>
								<p className='font-medium text-muted-foreground text-sm'>Treatment Plan</p>
								<p className='mt-1 whitespace-pre-wrap'>
									{encounter.treatment || "No treatment plan recorded"}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Diagnoses List */}
					{encounter.diagnoses && encounter.diagnoses.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Diagnoses</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									{encounter.diagnoses.map((diag, index) => (
										<div
											className='flex items-center justify-between rounded-lg border p-3'
											key={diag.id || index}
										>
											<div>
												<p className='font-medium'>{diag.description}</p>
												<p className='text-muted-foreground text-sm'>
													Status: {diag.status?.toLowerCase()}
												</p>
											</div>
											{diag.isPrimary && <Badge variant='default'>Primary</Badge>}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Prescriptions */}
					{encounter.prescriptions && encounter.prescriptions.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Prescriptions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-3'>
									{encounter.prescriptions.map((prescription, index) => (
										<div
											className='rounded-lg border p-3'
											key={prescription.id || index}
										>
											<div className='flex items-center justify-between'>
												<p className='font-medium'>{prescription.medicationName}</p>
												<Badge variant='outline'>{prescription.status?.toLowerCase()}</Badge>
											</div>
											<div className='mt-1 grid grid-cols-2 gap-2 text-muted-foreground text-sm'>
												<span>
													Dosage: {prescription.dosageValue} {prescription.dosageUnit}
												</span>
												<span>
													Frequency:{" "}
													{prescription.frequency?.toLowerCase().replace(/_/g, " ")}
												</span>
												<span className='col-span-2'>Duration: {prescription.duration}</span>
												{prescription.instructions && (
													<span className='col-span-2'>
														Instructions: {prescription.instructions}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Patient Card */}
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<User className='h-5 w-5 text-primary' />
								Patient
							</CardTitle>
						</CardHeader>
						<CardContent>
							{encounter.patient ? (
								<div className='space-y-1'>
									<p className='font-medium'>
										{encounter.patient.firstName} {encounter.patient.lastName}
									</p>
									{encounter.patient.mrn && (
										<p className='text-muted-foreground text-sm'>MRN: {encounter.patient.mrn}</p>
									)}
									<Link
										className='mt-2 inline-block'
										params={{ patientId: encounter.patientId }}
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
							) : (
								<p className='text-muted-foreground text-sm'>Patient information not available</p>
							)}
						</CardContent>
					</Card>

					{/* Doctor Card */}
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Stethoscope className='h-5 w-5 text-primary' />
								Doctor
							</CardTitle>
						</CardHeader>
						<CardContent>
							{encounter.doctor ? (
								<div className='space-y-1'>
									<p className='font-medium'>Dr. {encounter.doctor.name}</p>
									{encounter.doctor.specialty && (
										<p className='text-muted-foreground text-sm'>{encounter.doctor.specialty}</p>
									)}
								</div>
							) : (
								<p className='text-muted-foreground text-sm'>Doctor not assigned</p>
							)}
						</CardContent>
					</Card>

					{/* Metadata */}
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-lg'>Metadata</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Duration</span>
								<span>{encounter.durationMinutes || 30} minutes</span>
							</div>
							{encounter.followUpDate && (
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Follow-up</span>
									<span>{format(new Date(encounter.followUpDate), "MMM d, yyyy")}</span>
								</div>
							)}
							<Separator />
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Created</span>
								<span>{format(new Date(encounter.createdAt), "MMM d, yyyy")}</span>
							</div>
							{encounter.updatedAt && (
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Updated</span>
									<span>{format(new Date(encounter.updatedAt), "MMM d, yyyy")}</span>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
