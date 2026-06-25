// src/features/dashboard/components/MiniCalendar.tsx

import { Link } from "@tanstack/react-router";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Appointment = {
	id: string;
	time: string;
	patient: string;
	patientId: string;
	type: string;
};

type MiniCalendarProps = {
	appointments: Appointment[];
};

export function MiniCalendar({ appointments }: MiniCalendarProps) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const today = new Date();
	const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
	const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

	const hasAppointmentsOnDay = (date: Date) =>
		appointments.some(app => {
			const appDate = new Date(app.time);
			return isSameDay(appDate, date);
		});

	const getAppointmentsForDay = (date: Date) =>
		appointments.filter(app => {
			const appDate = new Date(app.time);
			return isSameDay(appDate, date);
		});

	const navigateWeek = (direction: "prev" | "next") => {
		const days = direction === "next" ? 7 : -7;
		setCurrentDate(prev => addDays(prev, days));
	};

	const getDayVariant = (day: Date) => {
		const isToday = isSameDay(day, today);
		const hasAppointments = hasAppointmentsOnDay(day);

		if (isToday && hasAppointments) {
			return "link";
		}
		if (isToday) {
			return "outline";
		}
		if (hasAppointments) {
			return "default";
		}
		return "ghost";
	};

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='text-base'>Calendar</CardTitle>
				<div className='flex items-center gap-1'>
					<Button
						className='h-7 w-7'
						onClick={() => navigateWeek("prev")}
						size='icon'
						variant='ghost'
					>
						<ChevronLeft className='h-4 w-4' />
					</Button>
					<Button
						className='h-7 w-7'
						onClick={() => navigateWeek("next")}
						size='icon'
						variant='ghost'
					>
						<ChevronRight className='h-4 w-4' />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-7 gap-1'>
					{weekDays.map(day => {
						const isToday = isSameDay(day, today);
						const dayAppointments = getAppointmentsForDay(day);

						return (
							<div
								className='text-center'
								key={day.toISOString()}
							>
								<div className='text-muted-foreground text-xs'>{format(day, "EEE")}</div>
								<Button
									className={cn(
										"h-8 w-8 p-0 font-normal text-xs",
										isToday && "border-2 border-primary",
										hasAppointmentsOnDay(day) && "font-semibold"
									)}
									variant={getDayVariant(day)}
								>
									{format(day, "d")}
								</Button>
								{dayAppointments.length > 0 && (
									<div className='mt-1 flex justify-center gap-0.5'>
										{dayAppointments.slice(0, 2).map(app => (
											<div
												className='h-1 w-1 rounded-full bg-primary'
												key={app.id}
												title={app.patient}
											/>
										))}
										{dayAppointments.length > 2 && (
											<span className='text-[8px] text-muted-foreground'>
												+{dayAppointments.length - 2}
											</span>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className='mt-4 space-y-1.5 border-t pt-3'>
					<div className='flex items-center justify-between text-muted-foreground text-xs'>
						<span>Today's Appointments</span>
						<span>{appointments.length} scheduled</span>
					</div>
					{appointments.slice(0, 3).map(app => (
						<div
							className='flex items-center justify-between rounded-md bg-muted/30 p-2 text-xs'
							key={app.id}
						>
							<div className='flex items-center gap-2'>
								<Clock className='h-3 w-3 text-muted-foreground' />
								<span>{app.time}</span>
							</div>
							<span className='font-medium'>{app.patient}</span>
						</div>
					))}
					{appointments.length > 3 && (
						<Button
							asChild
							className='w-full text-xs'
							size='sm'
							variant='ghost'
						>
							<Link to='/auth/dashboard/appointments'>View {appointments.length - 3} more</Link>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
