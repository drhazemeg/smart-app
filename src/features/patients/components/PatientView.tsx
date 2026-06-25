import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, FileText, HeartPulse, Ruler, Weight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatientOptions } from "@/functions/queries";
import { getInitials } from "@/lib/utils";
import { Route as PatientEditRoute } from "@/routes/auth/dashboard/patients/$patientId/edit";

export default function PatientDetailPage() {
	// Use the useParams hook to access parameters for the current route
	const { patientId } = PatientEditRoute.useParams();
	const { data } = useSuspenseQuery(getPatientOptions(patientId));

	if (!data) {
		throw notFound();
	}

	const age = data.dateOfBirth ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : "N/A";

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex items-center gap-4'>
					<Link to='/auth/dashboard/patients'>
						<Button
							size='icon'
							variant='ghost'
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<Avatar className='h-14 w-14 border-2 border-lagoon/20'>
						<AvatarImage src={data.image || undefined} />
						<AvatarFallback className='bg-lagoon/10 text-lagoon-deep text-xl'>
							{getInitials(`${data.firstName} ${data.lastName}`)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className='font-bold font-serif text-2xl text-sea-ink'>
							{data.firstName} {data.lastName}
						</h1>
						<div className='flex flex-wrap items-center gap-2 text-muted-foreground text-sm'>
							<span>MRN: {data.mrn || "N/A"}</span>
							<span>•</span>
							<span>Age: {age} years</span>
							<span>•</span>
							<span className='capitalize'>{data.gender || "Not specified"}</span>
							{data.isActive ? (
								<Badge className='ml-2 bg-emerald-500'>Active</Badge>
							) : (
								<Badge
									className='ml-2'
									variant='secondary'
								>
									Inactive
								</Badge>
							)}
						</div>
					</div>
				</div>
				<div className='flex gap-2'>
					<Link to='/auth/dashboard/appointments/new'>
						<Button
							className='gap-2'
							size='sm'
						>
							<Calendar className='h-4 w-4' />
							Book Appointment
						</Button>
					</Link>
					<Link
						params={{ patientId }}
						to={PatientEditRoute.id}
					>
						<Button
							size='sm'
							variant='outline'
						>
							Edit
						</Button>
					</Link>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				className='space-y-4'
				defaultValue='overview'
			>
				<TabsList>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='growth'>Growth</TabsTrigger>
					<TabsTrigger value='appointments'>Appointments</TabsTrigger>
					<TabsTrigger value='records'>Medical Records</TabsTrigger>
				</TabsList>

				<TabsContent
					className='space-y-4'
					value='overview'
				>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<Card>
							<CardContent className='flex items-center gap-3 p-4'>
								<div className='rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30'>
									<Weight className='h-5 w-5' />
								</div>
								<div>
									<p className='text-muted-foreground text-xs'>Weight</p>
									<p className='font-bold text-lg'>-- kg</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='flex items-center gap-3 p-4'>
								<div className='rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30'>
									<Ruler className='h-5 w-5' />
								</div>
								<div>
									<p className='text-muted-foreground text-xs'>Height</p>
									<p className='font-bold text-lg'>-- cm</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='flex items-center gap-3 p-4'>
								<div className='rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30'>
									<HeartPulse className='h-5 w-5' />
								</div>
								<div>
									<p className='text-muted-foreground text-xs'>BMI</p>
									<p className='font-bold text-lg'>--</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='flex items-center gap-3 p-4'>
								<div className='rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30'>
									<FileText className='h-5 w-5' />
								</div>
								<div>
									<p className='text-muted-foreground text-xs'>Records</p>
									<p className='font-bold text-lg'>0</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Patient Information</CardTitle>
						</CardHeader>
						<CardContent className='grid gap-4 sm:grid-cols-2'>
							<div>
								<p className='text-muted-foreground text-sm'>Email</p>
								<p className='font-medium'>{data.email || "Not provided"}</p>
							</div>
							<div>
								<p className='text-muted-foreground text-sm'>Phone</p>
								<p className='font-medium'>{data.phone || "Not provided"}</p>
							</div>
							<div>
								<p className='text-muted-foreground text-sm'>Address</p>
								<p className='font-medium'>{data.address || "Not provided"}</p>
							</div>
							<div>
								<p className='text-muted-foreground text-sm'>Blood Group</p>
								<p className='font-medium'>{data.bloodGroup || "Not specified"}</p>
							</div>
							{data.allergies && (
								<div className='sm:col-span-2'>
									<p className='text-muted-foreground text-sm'>Allergies</p>
									<p className='font-medium'>{data.allergies}</p>
								</div>
							)}
							{data.medicalConditions && (
								<div className='sm:col-span-2'>
									<p className='text-muted-foreground text-sm'>Medical Conditions</p>
									<p className='font-medium'>{data.medicalConditions}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='growth'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Growth Tracking</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground text-sm'>
								Growth chart and measurements will appear here.
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='appointments'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Appointments</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground text-sm'>Appointment history will appear here.</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='records'>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Medical Records</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground text-sm'>Medical records will appear here.</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export function PatientDetailSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Skeleton className='h-10 w-10' />
				<Skeleton className='h-14 w-14 rounded-full' />
				<div className='space-y-2'>
					<Skeleton className='h-7 w-48' />
					<Skeleton className='h-4 w-64' />
				</div>
			</div>
			<div className='space-y-4'>
				<Skeleton className='h-10 w-full max-w-sm' />
				<Skeleton className='h-64 w-full' />
			</div>
		</div>
	);
}
