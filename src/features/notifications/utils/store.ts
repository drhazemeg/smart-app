// utils/store.ts

import { useSelector } from "@tanstack/react-store";
import { createStore } from "@tanstack/store";
import type { NotificationAction, NotificationStatus } from "@/components/ui/notification-card";

export type Notification = {
	id: string;
	title: string;
	body: string;
	status: NotificationStatus;
	createdAt: string;
	actions?: NotificationAction[];
};

type NotificationState = {
	notifications: Notification[];
};

type NotificationActions = {
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	removeNotification: (id: string) => void;
	addNotification: (notification: Omit<Notification, "status">) => void;
	unreadCount: () => number;
	getNotifications: () => Notification[];
};

// Mock notifications for pediatric clinic
const mockNotifications: Notification[] = [
	{
		id: "1",
		title: "New patient registered",
		body: "Emma Johnson (4y) has been registered for a well-child visit.",
		status: "unread",
		createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
		actions: [
			{
				id: "view-patient",
				label: "View Patient",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "2",
		title: "Lab results ready",
		body: "Blood work results for Liam Smith (2y) are ready for review.",
		status: "unread",
		createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
		actions: [
			{
				id: "view-lab-results",
				label: "View Results",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "3",
		title: "Immunization due",
		body: "Sophia Brown (6m) has vaccines due tomorrow - MMR and DTaP.",
		status: "unread",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
		actions: [
			{
				id: "view-immunizations",
				label: "View Schedule",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "4",
		title: "Appointment reminder",
		body: "Dr. Patel has a telemedicine appointment with Noah Garcia (7y) at 3:00 PM.",
		status: "read",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
		actions: [
			{
				id: "view-appointment",
				label: "View Appointment",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "5",
		title: "Prescription refill request",
		body: "Parent requested refill for Isabella Martinez (3y) - Albuterol inhaler.",
		status: "read",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
		actions: [
			{
				id: "view-prescription",
				label: "Review Request",
				type: "redirect",
				style: "primary"
			}
		]
	}
];

// Create store with TanStack Store
export const notificationStore = createStore<NotificationState>({
	notifications: mockNotifications
});

// Hook to access notifications from the store
export const useNotificationStore = () => useSelector(notificationStore, state => state.notifications);

// Adding the hook as instructed, note the potential typo in the name 'useNotificionStore'
export const useNotificionStore = () => useSelector(notificationStore, state => state.notifications);

// Actions and selectors
export const notificationActions: NotificationActions = {
	markAsRead: (id: string) => {
		notificationStore.setState(state => ({
			notifications: state.notifications.map(n => (n.id === id ? { ...n, status: "read" as const } : n))
		}));
	},

	markAllAsRead: () => {
		notificationStore.setState(state => ({
			notifications: state.notifications.map(n => ({
				...n,
				status: "read" as const
			}))
		}));
	},

	removeNotification: (id: string) => {
		notificationStore.setState(state => ({
			notifications: state.notifications.filter(n => n.id !== id)
		}));
	},

	addNotification: (notification: Omit<Notification, "status">) => {
		notificationStore.setState(state => ({
			notifications: [{ ...notification, status: "unread" as const }, ...state.notifications]
		}));
	},

	unreadCount: () => {
		return notificationStore.state.notifications.filter(n => n.status === "unread").length;
	},

	getNotifications: () => {
		return notificationStore.state.notifications;
	}
};
