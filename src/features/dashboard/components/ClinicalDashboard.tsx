// src/components/dashboard/ClinicalDashboard.tsx

import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowRightIcon,
	Baby,
	Calendar,
	Clock,
	FileText,
	HeartPulse,
	Stethoscope,
	Syringe,
	Users
} from "lucide-react";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { getDueImmunizations, getRecentEncounters, getRecentPatients } from "@/features/dashboard/functions";
import type { getAppointmentsInRange } from "@/functions";
import { formatDate } from "@/utils/formDate";

// Type definitions with proper imports
interface ClinicalDashboardProps {
	upcomingAppointments: Awaited<ReturnType<typeof getAppointmentsInRange>>;
	dueImmunizations: Awaited<ReturnType<typeof getDueImmunizations>>;
	recentPatients: Awaited<ReturnType<typeof getRecentPatients>>;
	recentEncounters: Awaited<ReturnType<typeof getRecentEncounters>>;
}

// Helper function to get status color
const getImmunizationStatusColor = (isOverDue: boolean) => {
	return isOverDue ? "destructive" : "outline";
};

// Helper function to get appointment urgency
const getAppointmentUrgency = (appointmentDate: string | Date) => {
	const today = new Date();
	const aptDate = new Date(appointmentDate);
	const diffDays = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	if (diffDays < 0) return { label: "Overdue", variant: "destructive" as const };
	if (diffDays === 0) return { label: "Today", variant: "default" as const };
	if (diffDays <= 2) return { label: "Soon", variant: "outline" as const };
	return { label: "Upcoming", variant: "secondary" as const };
};

// Small utility to calculate years dynamically from an object with dateOfBirth
const calculateAge = (dobStringOrDate: string | Date | undefined) => {
	if (!dobStringOrDate) return 0;
	const dob = new Date(dobStringOrDate);
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const monthDiff = today.getMonth() - dob.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age--;
	}
	return age;
};

export const ClinicalDashboard = memo(function ClinicalDashboard({
	upcomingAppointments,
	dueImmunizations,
	recentPatients,
	recentEncounters
}: ClinicalDashboardProps) {
	const hasOverdueImmunizations = useMemo(() => dueImmunizations.some(imm => imm.isOverDue), [dueImmunizations]);

	// Pediatric-specific stats
	const pediatricStats = useMemo(() => {
		const totalPatients = recentPatients?.patients?.length ?? 0;
		const totalEncounters = recentEncounters.length;
		const overdueImmunizations = dueImmunizations.filter(imm => imm.isOverDue).length;
		const todayAppointments = upcomingAppointments.filter(
			apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
		).length;

		return {
			totalPatients,
			totalEncounters,
			overdueImmunizations,
			todayAppointments,
			hasOverdueImmunizations: overdueImmunizations > 0
		};
	}, [recentPatients, recentEncounters, dueImmunizations, upcomingAppointments]);

	return (
		<section>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<h2 className='font-semibold text-xl'>Clinical Dashboard</h2>
					<Badge
						className='text-[10px]'
						variant='outline'
					>
						Pediatric Clinic
					</Badge>
				</div>
				<Link to='/auth/dashboard'>
					<Button
						size='sm'
						variant='ghost'
					>
						View Full Dashboard
						<ArrowRightIcon className='ml-1 h-4 w-4' />
					</Button>
				</Link>
			</div>

			{/* Quick Stats - Pediatric Focused */}
			<div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-4'>
				<Card>
					<CardContent className='p-3'>
						<div className='flex items-center gap-2'>
							<Users className='h-4 w-4 text-blue-500' />
							<div>
								<p className='font-bold text-2xl'>{pediatricStats.totalPatients}</p>
								<p className='text-[10px] text-muted-foreground'>Total Patients</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className='p-3'>
						<div className='flex items-center gap-2'>
							<Calendar className='h-4 w-4 text-emerald-500' />
							<div>
								<p className='font-bold text-2xl'>{pediatricStats.todayAppointments}</p>
								<p className='text-[10px] text-muted-foreground'>Today's Visits</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className='p-3'>
						<div className='flex items-center gap-2'>
							<Syringe className='h-4 w-4 text-amber-500' />
							<div>
								<p className='font-bold text-2xl'>{pediatricStats.overdueImmunizations}</p>
								<p className='text-[10px] text-muted-foreground'>Overdue Vaccines</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className='p-3'>
						<div className='flex items-center gap-2'>
							<FileText className='h-4 w-4 text-purple-500' />
							<div>
								<p className='font-bold text-2xl'>{pediatricStats.totalEncounters}</p>
								<p className='text-[10px] text-muted-foreground'>Recent Encounters</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				{/* Upcoming Appointments */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Calendar className='h-5 w-5' />
							Upcoming Appointments
						</CardTitle>
						<CardDescription>Today's schedule and upcoming visits</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{upcomingAppointments.length === 0 ? (
							<p className='py-6 text-center text-muted-foreground text-sm'>No upcoming appointments</p>
						) : (
							upcomingAppointments.map((apt, index) => {
								const urgency = getAppointmentUrgency(apt.appointmentDate);
								return (
									<div
										className='flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800'
										key={apt.id || index}
									>
										<div className='space-y-0.5'>
											<div className='flex items-center gap-2'>
												<Baby className='h-3 w-3 text-blue-500' />
												<p className='font-medium text-sm'>
													{apt.patient?.firstName} {apt.patient?.lastName}
												</p>
											</div>
											<div className='flex items-center gap-2 text-muted-foreground text-xs'>
												<Stethoscope className='h-3 w-3' />
												<span>Dr. {apt.doctor?.name || "TBD"}</span>
												{apt.patient?.dateOfBirth && (
													<>
														<span className='text-muted-foreground/50'>•</span>
														<span>{calculateAge(apt.patient.dateOfBirth)} years old</span>
													</>
												)}
											</div>
										</div>
										<div className='text-right'>
											<Badge
												className='mb-1 text-[10px]'
												variant={urgency.variant}
											>
												{urgency.label}
											</Badge>
											<p className='font-medium text-sm'>{apt.time}</p>
											<p className='text-muted-foreground text-xs'>
												{formatDate(apt.appointmentDate, { month: "short", day: "numeric" })}
											</p>
										</div>
									</div>
								);
							})
						)}
					</CardContent>
				</Card>

				{/* Due Immunizations */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Syringe className='h-5 w-5' />
							Due Immunizations
							{dueImmunizations.length > 0 && (
								<Badge variant={hasOverdueImmunizations ? "destructive" : "default"}>
									{dueImmunizations.length}
								</Badge>
							)}
						</CardTitle>
						<CardDescription>Vaccinations due or overdue</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{dueImmunizations.length === 0 ? (
							<div className='py-6 text-center'>
								<HeartPulse className='mx-auto h-8 w-8 text-emerald-500' />
								<p className='mt-2 text-muted-foreground text-sm'>All immunizations up to date</p>
								<p className='text-muted-foreground/60 text-xs'>
									Great job keeping patients protected!
								</p>
							</div>
						) : (
							dueImmunizations.map(imm => (
								<div
									className='flex items-center justify-between rounded-lg border p-3'
									key={imm.id}
								>
									<div>
										<div className='flex items-center gap-2'>
											<p className='font-medium text-sm'>{imm.vaccine}</p>
											{imm.isOverDue && <AlertTriangle className='h-3 w-3 text-rose-500' />}
										</div>
										<p className='text-muted-foreground text-xs'>
											{imm.patient?.firstName} {imm.patient?.lastName}
											{imm.patient && (
												<>
													<span className='mx-1'>•</span>
													<span>
														{calculateAge(imm.patient.dateOfBirth || imm.patient.createdAt)}{" "}
														years
													</span>
												</>
											)}
										</p>
									</div>
									<Badge variant={getImmunizationStatusColor(imm.isOverDue)}>
										{imm.isOverDue ? "Overdue" : "Due Soon"}
									</Badge>
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Recent Patients */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Users className='h-5 w-5' />
							Recent Patients
						</CardTitle>
						<CardDescription>Newly registered children</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{(recentPatients?.patients?.length ?? 0) === 0 ? (
							<p className='py-6 text-center text-muted-foreground text-sm'>No recent patients</p>
						) : (
							recentPatients.patients.map(patient => (
								<div
									className='flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800'
									key={patient.id}
								>
									<div>
										<div className='flex items-center gap-2'>
											<Baby className='h-3 w-3 text-blue-500' />
											<p className='font-medium text-sm'>
												{patient.firstName} {patient.lastName}
											</p>
										</div>
										<div className='flex items-center gap-2 text-muted-foreground text-xs'>
											<span>MRN: {patient.mrn}</span>
											{patient.dateOfBirth && (
												<>
													<span className='text-muted-foreground/50'>•</span>
													<span>Age: {calculateAge(patient.dateOfBirth)} years</span>
												</>
											)}
										</div>
									</div>
									<ArrowRightIcon className='h-4 w-4 text-slate-400' />
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Recent Encounters */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<FileText className='h-5 w-5' />
							Recent Encounters
						</CardTitle>
						<CardDescription>Latest consultations and diagnoses</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{recentEncounters.length === 0 ? (
							<p className='py-6 text-center text-muted-foreground text-sm'>No recent encounters</p>
						) : (
							recentEncounters.map(encounter => (
								<Link
									className='block'
									key={encounter.id}
									params={{ id: encounter.id.toString() }}
									to='/auth/dashboard/encounters/$id'
								>
									<div className='flex items-center justify-between rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800'>
										<div>
											<div className='flex items-center gap-2'>
												<Stethoscope className='h-3 w-3 text-blue-500' />
												<p className='font-medium text-sm'>
													{encounter.patientFirstName} {encounter.patientLastName}
												</p>
											</div>
											<p className='text-muted-foreground text-xs'>
												{encounter.diagnosis || "No diagnosis recorded"}
											</p>
										</div>
										<div className='text-right'>
											<p className='text-muted-foreground text-xs'>
												{formatDate(encounter.date, { month: "short", day: "numeric" })}
											</p>
											<Clock className='mt-1 ml-auto h-3 w-3 text-slate-400' />
										</div>
									</div>
								</Link>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
});
