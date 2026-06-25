// src/config/nav-config.ts
// Navigation configuration for the sidebar and Cmd+K bar.
// All URLs must match actual TanStack Router route paths.

import type { Icons } from "../components/ui/icons";
import type { Role } from "../db";

export interface NavItem {
	title: string;
	url: string;
	icon?: keyof typeof Icons;
	badge?: string | number;
	isActive?: boolean;
	shortcut?: [string, string];
	requiredRole?: Role | Role[];
	pageType?: string;
	patientId?: string;
	roles?: ("admin" | "doctor" | "staff" | "patient")[];
	children?: NavItem[];
	items?: NavSubItem[];
}

export interface NavSubItem {
	title: string;
	url: string;
	icon?: keyof typeof Icons;
	shortcut?: [string, string];
	isActive?: boolean;
	requiredRole?: Role | Role[];
	pageType?: string;
	patientId?: string | undefined;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const navGroups: NavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: "dashboard",
				shortcut: ["d", "d"],
				roles: ["admin", "doctor", "staff", "patient"]
			}
		]
	},
	{
		label: "Patient Management",
		items: [
			{
				title: "Patients",
				url: "/dashboard/patients",
				icon: "users",
				shortcut: ["p", "p"],
				pageType: "patients",
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "All Patients",
						url: "/dashboard/patients",
						pageType: "patients"
					},
					{
						title: "New Patient",
						url: "/dashboard/patients/new",
						icon: "add",
						pageType: "patients"
					}
				]
			},
			{
				title: "Appointments",
				url: "/dashboard/appointments",
				icon: "calendar",
				shortcut: ["a", "a"],
				roles: ["admin", "doctor", "staff", "patient"],
				items: [
					{
						title: "Schedule New",
						url: "/dashboard/appointments/new",
						icon: "add"
					},
					{
						title: "Today's Schedule",
						url: "/dashboard/appointments/today",
						icon: "clock"
					}
				]
			},
			{
				title: "Growth Tracking",
				url: "/dashboard/growth",
				icon: "charts",
				shortcut: ["g", "g"],
				pageType: "growth",
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "View Growth",
						url: "/dashboard/growth",
						icon: "charts"
					},
					{
						title: "Register Patient",
						url: "/dashboard/growth/register",
						icon: "add"
					}
				]
			}
		]
	},
	{
		label: "Management",
		items: [
			{
				title: "Medical Records",
				url: "/dashboard/medical-records",
				icon: "fileText",
				shortcut: ["m", "m"],
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "All Records",
						url: "/dashboard/medical-records",
						icon: "fileText"
					},
					{
						title: "New Record",
						url: "/dashboard/medical-records/new",
						icon: "add"
					}
				]
			},
			{
				title: "Services",
				url: "/dashboard/services",
				icon: "activity",
				shortcut: ["s", "s"],
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "All Services",
						url: "/dashboard/services",
						icon: "activity"
					},
					{
						title: "New Service",
						url: "/dashboard/services/new",
						icon: "add"
					}
				]
			},
			{
				title: "Doctors",
				url: "/dashboard/doctors",
				icon: "briefcase",
				shortcut: ["d", "c"],
				roles: ["admin", "staff"],
				items: [
					{
						title: "All Doctors",
						url: "/dashboard/doctors",
						icon: "briefcase"
					},
					{
						title: "New Doctor",
						url: "/dashboard/doctors/new",
						icon: "add"
					}
				]
			}
		]
	}
];

export const bottomNavItems: NavItem[] = [
	{
		title: "Support",
		url: "/support",
		icon: "help",
		roles: ["admin", "doctor", "staff", "patient"]
	},
	{
		title: "Privacy",
		url: "/privacy",
		icon: "shield",
		roles: ["admin", "doctor", "staff", "patient"]
	},
	{
		title: "Terms",
		url: "/terms",
		icon: "fileText",
		roles: ["admin", "doctor", "staff", "patient"]
	}
];

// Helper function to get role display name
export const getRoleDisplay = (role: string): string => {
	const roleMap: Record<string, string> = {
		admin: "Admin",
		doctor: "Doctor",
		staff: "Staff",
		patient: "Patient"
	};
	return roleMap[role] || role;
};

// Helper function to get role color
export const getRoleColor = (role: string): string => {
	const colorMap: Record<string, string> = {
		admin: "text-red-600 dark:text-red-400",
		doctor: "text-blue-600 dark:text-blue-400",
		staff: "text-green-600 dark:text-green-400",
		patient: "text-yellow-600 dark:text-yellow-400"
	};
	return colorMap[role] || "text-gray-600";
};
