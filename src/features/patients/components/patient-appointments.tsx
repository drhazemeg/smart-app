// products/patients/components/patient-appointments.tsx
import { useSuspenseQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { patientUpcomingAppointmentsOptions } from "../api/queries";

interface PatientAppointmentsProps {
	patientId: string;
	limit?: number;
}

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	PENDING: "secondary",
	CONFIRMED: "default",
	COMPLETED: "outline",
	CANCELLED: "destructive",
	NO_SHOW: "destructive"
};

export default function PatientAppointments({ patientId, limit = 10 }: PatientAppointmentsProps) {
	const { data, isLoading } = useSuspenseQuery(patientUpcomingAppointmentsOptions(patientId, limit));

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Upcoming Appointments</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2'>
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
				</CardContent>
			</Card>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Upcoming Appointments</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-muted-foreground'>No upcoming appointments</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upcoming Appointments</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date & Time</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Doctor</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map(appointment => (
							<TableRow key={appointment.id}>
								<TableCell>
									{new Date(appointment.appointmentDate).toLocaleDateString()}{" "}
									{new Date(appointment.appointmentDate).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									})}
								</TableCell>
								<TableCell>{appointment.type}</TableCell>
								<TableCell>
									{appointment.doctorName}
									<span className='text-muted-foreground text-xs'>
										{" "}
										({appointment.doctorSpecialty})
									</span>
								</TableCell>
								<TableCell>
									<Badge variant={STATUS_BADGE_VARIANTS[appointment.status] || "default"}>
										{appointment.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
