import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Patient } from "@/features/patients";
import { listPatientsOptions } from "@/functions/queries";
import { formatDate } from "@/lib/formDate";
import { getInitials } from "@/lib/utils";

export const Route = createFileRoute("/auth/dashboard/patients/")({
	component: PatientsPage,
	pendingComponent: () => <PatientsSkeleton />
});

function PatientsPage() {
	const [search, setSearch] = useState("");
	const { data } = useSuspenseQuery(listPatientsOptions({ limit: 20, offset: 0, search: search || undefined }));

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink md:text-3xl'>Patients</h1>
					<p className='text-sea-ink-soft text-sm'>Manage your pediatric patients</p>
				</div>
				<Link to='/auth/dashboard/patients/new'>
					<Button className='gap-2 bg-lagoon hover:bg-lagoon-deep'>
						<Plus className='h-4 w-4' />
						New Patient
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader className='pb-3'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Users className='h-5 w-5 text-lagoon' />
							Patient List
							<Badge
								className='ml-2'
								variant='secondary'
							>
								{data?.total || 0}
							</Badge>
						</CardTitle>
						<div className='relative max-w-sm'>
							<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								className='pl-9'
								onChange={e => setSearch(e.target.value)}
								placeholder='Search patients...'
								value={search}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Patient</TableHead>
								<TableHead>MRN</TableHead>
								<TableHead>Age</TableHead>
								<TableHead>Gender</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data?.patients.map((patient: Patient) => (
								<TableRow key={patient.id}>
									<TableCell>
										<div className='flex items-center gap-3'>
											<Avatar className='h-8 w-8'>
												<AvatarImage src={patient.image || undefined} />
												<AvatarFallback className='bg-lagoon/10 text-lagoon-deep text-xs'>
													{getInitials(`${patient.firstName} ${patient.lastName}`)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className='font-medium'>
													{patient.firstName} {patient.lastName}
												</p>
												<p className='text-muted-foreground text-xs'>
													{patient.email || "No email"}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell className='font-mono text-sm'>{patient.mrn || "N/A"}</TableCell>
									<TableCell>
										{patient.dateOfBirth
											? formatDate(patient.dateOfBirth, {
													year: "numeric",
													month: "short",
													day: "numeric"
												})
											: "N/A"}
									</TableCell>
									<TableCell className='capitalize'>{patient.gender || "Not specified"}</TableCell>
									<TableCell>
										<Badge variant={patient.isActive ? "default" : "secondary"}>
											{patient.isActive ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell className='text-right'>
										<Link
											params={{ patientId: patient.id ?? "" }}
											to='/auth/dashboard/patients/$patientId'
										>
											<Button
												size='sm'
												variant='ghost'
											>
												View
											</Button>
										</Link>
									</TableCell>
								</TableRow>
							))}
							{(!data?.patients || data.patients.length === 0) && (
								<TableRow>
									<TableCell
										className='py-8 text-center text-muted-foreground'
										colSpan={6}
									>
										No patients found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function PatientsSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='mt-1 h-4 w-48' />
				</div>
				<Skeleton className='h-10 w-36' />
			</div>
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-10 w-48' />
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						{["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4", "skeleton-5"].map(id => (
							<Skeleton
								className='h-12 w-full'
								key={id}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
