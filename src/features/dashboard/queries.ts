// src/features/dashboard/queries.ts

import type { Patient } from "@/db";
import { queryKeys } from "@/lib/query-client";
import { getDashboardUpcomingAppointments, getRecentEncounters, getRecentPatients } from "./functions";
import type { AlertSeverity, AlertType, GrowthAlert } from "./types";

type StatItem = {
	label: string;
	value: string | number;
	change?: number;
	icon?: string;
	color?: string;
};

// Define WidgetGrowthAlert as an alias for GrowthAlert — no extra fields needed
type WidgetGrowthAlert = GrowthAlert;
// Dashboard query options
export const dashboardQueryOptions = () => ({
	queryKey: queryKeys.dashboard.all,
	queryFn: async () => {
		// Fetch dashboard data concurrently
		const [stats, appointments, patients, growth] = await Promise.all([
			fetchDashboardStats(),
			fetchTodayAppointments(),
			fetchRecentPatients(),
			fetchGrowthAlerts()
		]);

		return {
			stats,
			appointments,
			patients,
			growth,
			recentActivity: getRecentActivity(appointments, patients, growth),
			todayAppointments: appointments,
			growthAlerts: growth
		};
	},
	staleTime: 1000 * 60 * 1 // 1 minute
});

type RecentActivityAppointment = {
	id: string;
	time: string;
	patient: string;
	patientId: string;
	type: string;
};

// Helper function to get recent activity
function getRecentActivity(
	appointments: RecentActivityAppointment[],
	patients: Patient[],
	growth: WidgetGrowthAlert[]
) {
	const activities = [
		...appointments.slice(0, 5).map(apt => ({
			id: apt.id,
			type: "appointment" as const,
			patient: {
				name: apt.patient || "Unknown",
				initials: (apt.patient || "?")
					.split(" ")
					.map((n: string) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2)
			},
			description: `Appointment of type: ${apt.type}`,
			timestamp: new Date(), // Placeholder, as the original date is lost in mapping
			status: "pending" as const
		})),
		...patients.slice(0, 3).map(patient => ({
			id: patient.id,
			type: "registration" as const,
			patient: {
				name: `${patient.firstName} ${patient.lastName}`,
				initials: `${patient.firstName?.[0] ?? ""}${patient.lastName?.[0] ?? ""}`.toUpperCase()
			},
			description: "New patient registered",
			timestamp: new Date(patient.createdAt)
		})),
		...growth.slice(0, 2).map(alert => ({
			id: alert.id,
			type: "examination" as const,
			patient: {
				name: alert.patient.name,
				initials: alert.patient.initials
			},
			description: alert.message,
			timestamp: new Date(alert.date)
		}))
	];

	return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Mock fetch functions (replace with actual API calls)
async function fetchDashboardStats(): Promise<StatItem[]> {
	return [
		{
			label: "Total Patients",
			value: 1250,
			icon: "patients",
			color: "blue",
			change: 4
		},
		{
			label: "Today's Appointments",
			value: 24,
			icon: "appointments",
			color: "green"
		},
		{
			label: "Pending Payments",
			value: 12,
			icon: "waiting",
			color: "orange"
		},
		{
			label: "Growth Alerts",
			value: 3,
			icon: "growth",
			color: "red"
		}
	];
}

type MiniCalendarAppointment = {
	id: string;
	time: string;
	patient: string;
	patientId: string;
	type: string;
};

async function fetchTodayAppointments(): Promise<MiniCalendarAppointment[]> {
	const appointments = await getDashboardUpcomingAppointments();
	return appointments.map(apt => ({
		id: apt.id,
		time: apt.time ?? apt.appointmentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
		patient: apt.patientName ?? "Unknown",
		patientId: apt.patientId,
		type: apt.type ?? "Consultation"
	}));
}

async function fetchRecentPatients(): Promise<Patient[]> {
	const result = await getRecentPatients();
	return result.patients;
}

async function fetchGrowthAlerts(): Promise<GrowthAlert[]> {
	const encounters = await getRecentEncounters();
	return encounters.map(
		(enc): WidgetGrowthAlert => ({
			id: enc.id,
			type: "weight" as AlertType,
			severity: "info" as AlertSeverity,
			patient: {
				id: enc.id,
				name: `${enc.patientFirstName} ${enc.patientLastName}`.trim() || "Unknown",
				initials: `${enc.patientFirstName?.[0] ?? ""}${enc.patientLastName?.[0] ?? ""}`.toUpperCase(),
				age: ""
			},
			metric: "WEIGHT",
			value: String(enc.diagnosis ?? "—"),
			message: enc.diagnosis ?? "No diagnosis recorded",
			date: new Date(enc.date),
			isResolved: false
		})
	);
}
