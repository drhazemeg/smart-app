// products/patients/components/patient-detail.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { patientWithDetailsOptions } from "../api/queries";
import { genderOptions, maritalStatusOptions } from "../constants/patient-options";

interface PatientDetailProps {
	patientId: string;
}

export default function PatientDetail({ patientId }: PatientDetailProps) {
	const { data } = useSuspenseQuery(patientWithDetailsOptions(patientId));

	if (!data) {
		return (
			<div className='space-y-4'>
				<Skeleton className='h-32 w-full' />
				<Skeleton className='h-64 w-full' />
			</div>
		);
	}

	const patient = data;

	return (
		<div className='space-y-6'>
			{/* Header Card */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary font-medium text-2xl text-white'>
							{patient.firstName[0]}
							{patient.lastName[0]}
						</div>
						<div className='flex-1'>
							<h2 className='font-bold text-2xl'>
								{patient.firstName} {patient.lastName}
							</h2>
							<div className='flex flex-wrap gap-4 text-muted-foreground text-sm'>
								<span>MRN: {patient.mrn || "N/A"}</span>
								<span>•</span>
								<span>
									Age: {patient.age?.years || "?"} years {patient.age?.months || 0} months
								</span>
								<span>•</span>
								<span>
									Gender:{" "}
									{genderOptions.find(o => o.value === patient.gender)?.label || patient.gender}
								</span>
								<span>•</span>
								<Badge variant={patient.isActive ? "success" : "destructive"}>
									{patient.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
						</div>
						<Link
							className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90'
							to={`/dashboard/patients/${patientId}/edit`}
						>
							Edit Patient
						</Link>
					</div>
				</CardContent>
			</Card>

			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{/* Contact Info */}
				<Card>
					<CardHeader>
						<CardTitle className='font-medium text-sm'>Contact Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2 text-sm'>
						<div>
							<span className='text-muted-foreground'>Email:</span> {patient.email || "N/A"}
						</div>
						<div>
							<span className='text-muted-foreground'>Phone:</span> {patient.phone || "N/A"}
						</div>
						<div>
							<span className='text-muted-foreground'>Address:</span> {patient.address || "N/A"}
						</div>
					</CardContent>
				</Card>

				{/* Emergency Contact */}
				<Card>
					<CardHeader>
						<CardTitle className='font-medium text-sm'>Emergency Contact</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2 text-sm'>
						<div>
							<span className='text-muted-foreground'>Name:</span> {patient.emergencyContactName || "N/A"}
						</div>
						<div>
							<span className='text-muted-foreground'>Phone:</span>{" "}
							{patient.emergencyContactNumber || "N/A"}
						</div>
						<div>
							<span className='text-muted-foreground'>Relation:</span> {patient.relation || "N/A"}
						</div>
					</CardContent>
				</Card>

				{/* Medical Info */}
				<Card>
					<CardHeader>
						<CardTitle className='font-medium text-sm'>Medical Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2 text-sm'>
						<div>
							<span className='text-muted-foreground'>Blood Group:</span> {patient.bloodGroup || "N/A"}
						</div>
						<div>
							<span className='text-muted-foreground'>Marital Status:</span>{" "}
							{maritalStatusOptions.find(o => o.value === patient.maritalStatus)?.label ||
								patient.maritalStatus ||
								"N/A"}
						</div>
						<Separator />
						<div>
							<span className='text-muted-foreground'>Allergies:</span>{" "}
							{patient.allergies || "None reported"}
						</div>
						<div>
							<span className='text-muted-foreground'>Medical Conditions:</span>{" "}
							{patient.medicalConditions || "None reported"}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
