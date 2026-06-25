// src/hooks/use-dashboard.ts

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";

// ============================================================
// Types
// ============================================================

interface DashboardStats {
	growthAlerts: number;
	patientsGrowth: number;
	pendingPayments: number;
	revenueMonth: number;
	revenueToday: number;
	todayAppointments: number;
	totalPatients: number;
}

interface Appointment {
	doctorId: string;
	doctorName: string;
	id: string;
	patientId: string;
	patientName: string;
	status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
	time: string;
	type: "checkup" | "vaccination" | "consultation" | "follow-up";
}

interface Patient {
	age: number;
	dateOfBirth: string;
	email: string;
	growthData?: GrowthData[];
	id: string;
	lastVisit: string;
	name: string;
	nextAppointment: string | null;
	phone: string;
}

interface GrowthData {
	age: number;
	date: string;
	headCircumference?: number;
	height: number;
	weight: number;
}

interface GrowthAlert {
	age: number;
	date: string;
	id: string;
	message: string;
	patientId: string;
	patientName: string;
	severity: "low" | "medium" | "high";
	type: "weight" | "height" | "head-circumference";
}

// ============================================================
// Mock Data (Replace with actual API calls)
// ============================================================

const mockPatients: Patient[] = [
	{
		id: "p1",
		name: "Emma Johnson",
		email: "emma@example.com",
		phone: "+1 555-0123",
		dateOfBirth: "2021-03-15",
		age: 2,
		lastVisit: "2023-06-10",
		nextAppointment: "2023-07-15",
		growthData: [
			{ date: "2023-01-15", weight: 10.5, height: 85, age: 1.8 },
			{ date: "2023-02-15", weight: 10.8, height: 86, age: 1.9 },
			{ date: "2023-03-15", weight: 11.2, height: 87, age: 2.0 },
			{ date: "2023-04-15", weight: 11.5, height: 88, age: 2.1 },
			{ date: "2023-05-15", weight: 11.8, height: 89, age: 2.2 }
		]
	},
	{
		id: "p2",
		name: "Liam Smith",
		email: "liam@example.com",
		phone: "+1 555-0456",
		dateOfBirth: "2022-07-20",
		age: 1,
		lastVisit: "2023-06-05",
		nextAppointment: "2023-08-20",
		growthData: [
			{ date: "2023-02-20", weight: 8.5, height: 72, age: 0.7 },
			{ date: "2023-03-20", weight: 8.8, height: 73, age: 0.8 },
			{ date: "2023-04-20", weight: 9.2, height: 74, age: 0.9 },
			{ date: "2023-05-20", weight: 9.5, height: 75, age: 1.0 },
			{ date: "2023-06-20", weight: 9.8, height: 76, age: 1.1 }
		]
	},
	{
		id: "p3",
		name: "Sophia Martinez",
		email: "sophia@example.com",
		phone: "+1 555-0789",
		dateOfBirth: "2021-11-01",
		age: 1.5,
		lastVisit: "2023-05-20",
		nextAppointment: "2023-09-01",
		growthData: [
			{ date: "2023-01-01", weight: 9.0, height: 78, age: 1.2 },
			{ date: "2023-02-01", weight: 9.3, height: 79, age: 1.3 },
			{ date: "2023-03-01", weight: 9.7, height: 80, age: 1.4 },
			{ date: "2023-04-01", weight: 10.0, height: 81, age: 1.5 },
			{ date: "2023-05-01", weight: 10.3, height: 82, age: 1.6 }
		]
	},
	{
		id: "p4",
		name: "Oliver Brown",
		email: "oliver@example.com",
		phone: "+1 555-0123",
		dateOfBirth: "2023-02-28",
		age: 0.3,
		lastVisit: "2023-06-15",
		nextAppointment: "2023-07-28",
		growthData: [
			{ date: "2023-03-28", weight: 4.2, height: 54, age: 0.1 },
			{ date: "2023-04-28", weight: 4.8, height: 56, age: 0.2 },
			{ date: "2023-05-28", weight: 5.2, height: 58, age: 0.3 },
			{ date: "2023-06-28", weight: 5.6, height: 60, age: 0.4 }
		]
	}
];

const mockAppointments: Appointment[] = [
	{
		id: "a1",
		patientId: "p1",
		patientName: "Emma Johnson",
		doctorId: "d1",
		doctorName: "Dr. Sarah Chen",
		time: "09:00",
		status: "PENDING",
		type: "checkup"
	},
	{
		id: "a2",
		patientId: "p2",
		patientName: "Liam Smith",
		doctorId: "d2",
		doctorName: "Dr. Michael Rodriguez",
		time: "10:30",
		status: "PENDING",
		type: "vaccination"
	},
	{
		id: "a3",
		patientId: "p3",
		patientName: "Sophia Martinez",
		doctorId: "d1",
		doctorName: "Dr. Sarah Chen",
		time: "13:00",
		status: "COMPLETED",
		type: "consultation"
	},
	{
		id: "a4",
		patientId: "p4",
		patientName: "Oliver Brown",
		doctorId: "d3",
		doctorName: "Dr. Emily Park",
		time: "15:30",
		status: "PENDING",
		type: "checkup"
	}
];

const mockGrowthAlerts: GrowthAlert[] = [
	{
		id: "g1",
		patientId: "p1",
		patientName: "Emma Johnson",
		age: 2,
		type: "weight",
		message: "Weight below 5th percentile for age",
		severity: "high",
		date: "2023-06-10"
	},
	{
		id: "g2",
		patientId: "p2",
		patientName: "Liam Smith",
		age: 1,
		type: "height",
		message: "Height above 95th percentile for age",
		severity: "medium",
		date: "2023-06-05"
	},
	{
		id: "g3",
		patientId: "p3",
		patientName: "Sophia Martinez",
		age: 1.5,
		type: "head-circumference",
		message: "Head circumference above 90th percentile",
		severity: "low",
		date: "2023-05-20"
	}
];

// ============================================================
// API Functions (Replace with actual API calls)
// ============================================================

async function fetchDashboardStats(): Promise<DashboardStats> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 500));

	// Calculate real stats from mock data
	// const today = new Date().toDateString();
	const todayAppointments = mockAppointments.filter(a => a.status === "PENDING").length;

	return {
		totalPatients: mockPatients.length,
		todayAppointments,
		pendingPayments: 12,
		growthAlerts: mockGrowthAlerts.filter(a => a.severity === "high").length,
		revenueToday: 2450,
		revenueMonth: 12_500,
		patientsGrowth: 15 // percentage
	};
}

async function fetchTodayAppointments(): Promise<Appointment[]> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 300));

	// Return today's PENDING appointments
	return mockAppointments.filter(a => a.status === "PENDING");
}

async function fetchRecentPatients(): Promise<Patient[]> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 300));

	// Return recent patients (last 5)
	return mockPatients.slice(0, 5);
}

async function fetchGrowthAlerts(): Promise<GrowthAlert[]> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 300));

	// Return growth alerts
	return mockGrowthAlerts;
}

// ============================================================
// Query Options
// ============================================================

export const dashboardQueryOptions = () => ({
	queryKey: queryKeys.dashboard.all,
	queryFn: fetchDashboardStats,
	staleTime: 1000 * 60 * 2, // 2 minutes
	gcTime: 1000 * 60 * 5 // 5 minutes
});

// ============================================================
// Main Hook
// ============================================================

export function useDashboard() {
	return useQuery(dashboardQueryOptions());
}

// ============================================================
// Specific Query Hooks
// ============================================================

export function useDashboardStats() {
	return useQuery({
		queryKey: queryKeys.dashboard.stats(),
		queryFn: fetchDashboardStats,
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});
}

export function useTodayAppointments() {
	return useQuery({
		queryKey: queryKeys.dashboard.appointments(),
		queryFn: fetchTodayAppointments,
		staleTime: 1000 * 60 * 1,
		refetchInterval: 1000 * 60 * 5 // Refetch every 5 minutes
	});
}

export function useRecentPatients() {
	return useQuery({
		queryKey: queryKeys.dashboard.patients(),
		queryFn: fetchRecentPatients,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10
	});
}

export function useGrowthAlerts() {
	return useQuery({
		queryKey: queryKeys.dashboard.growth(),
		queryFn: fetchGrowthAlerts,
		staleTime: 1000 * 60 * 3,
		gcTime: 1000 * 60 * 5
	});
}

// ============================================================
// Patient-specific Hooks
// ============================================================

export function usePatientDetails(patientId: string) {
	return useQuery({
		queryKey: queryKeys.patients.details(patientId),
		queryFn: async () => {
			await new Promise(resolve => setTimeout(resolve, 300));
			const patient = mockPatients.find(p => p.id === patientId);
			if (!patient) {
				throw new Error("Patient not found");
			}
			return patient;
		},
		enabled: !!patientId,
		staleTime: 1000 * 60 * 5
	});
}

export function usePatientGrowthData(patientId: string) {
	return useQuery({
		queryKey: queryKeys.patients.growth(patientId),
		queryFn: async () => {
			await new Promise(resolve => setTimeout(resolve, 300));
			const patient = mockPatients.find(p => p.id === patientId);
			if (!patient) {
				throw new Error("Patient not found");
			}
			return patient.growthData || [];
		},
		enabled: !!patientId,
		staleTime: 1000 * 60 * 5
	});
}

export function usePatientAppointments(patientId: string) {
	return useQuery({
		queryKey: queryKeys.patients.appointments(patientId),
		queryFn: async () => {
			await new Promise(resolve => setTimeout(resolve, 300));
			return mockAppointments.filter(a => a.patientId === patientId);
		},
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2
	});
}

// ============================================================
// All Patients Hook
// ============================================================

export function useAllPatients(filters?: Record<string, unknown>) {
	return useQuery({
		queryKey: queryKeys.patients.list(filters),
		queryFn: async () => {
			await new Promise(resolve => setTimeout(resolve, 300));
			return mockPatients;
		},
		staleTime: 1000 * 60 * 5
	});
}

// ============================================================
// Type Exports
// ============================================================

export type { Appointment, DashboardStats, GrowthAlert, GrowthData, Patient };
