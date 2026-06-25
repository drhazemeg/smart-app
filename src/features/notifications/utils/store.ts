import { Store } from "@tanstack/store";
import type { NotificationAction, NotificationStatus } from "@/components/ui/notification-card";

export type Notification = {
	id: string;
	title: string;
	body: string;
	status: NotificationStatus;
	createdAt: string;
	actions?: NotificationAction[];
};

// Initial mock notifications
const initialNotifications: Notification[] = [
	{
		id: "1",
		title: "New team member joined",
		body: "Sarah Connor has joined the Engineering workspace.",
		status: "unread",
		createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
		actions: [
			{
				id: "view",
				label: "View workspace",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "2",
		title: "New product added",
		body: 'A new product "Dashboard Pro" has been added to the catalog.',
		status: "unread",
		createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
		actions: [
			{
				id: "view-product",
				label: "View products",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "3",
		title: "Billing cycle updated",
		body: "Your Pro plan has been renewed. Next invoice on April 24, 2026.",
		status: "unread",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
		actions: [
			{
				id: "billing",
				label: "View billing",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "4",
		title: "Task assigned to you",
		body: 'You have been assigned "Update dashboard analytics" on the Kanban board.',
		status: "read",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
		actions: [
			{
				id: "open",
				label: "Open kanban",
				type: "redirect",
				style: "primary"
			}
		]
	},
	{
		id: "5",
		title: "New message from Alex",
		body: 'Alex sent you a message: "Hey, can we sync on the overview dashboard?"',
		status: "read",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
		actions: [
			{
				id: "open-chat",
				label: "Open chat",
				type: "redirect",
				style: "primary"
			}
		]
	}
];

// Notification store state type
interface NotificationState {
	notifications: Notification[];
}

// Create the store with initial state
export const notificationStore = new Store<NotificationState>({
	notifications: initialNotifications
});

// --- Actions ---
// These are functions that update the store state

export const notificationActions = {
	/**
	 * Mark a specific notification as read
	 */
	markAsRead: (id: string) => {
		notificationStore.setState(state => ({
			notifications: state.notifications.map(n => (n.id === id ? { ...n, status: "read" as const } : n))
		}));
	},

	/**
	 * Mark all notifications as read
	 */
	markAllAsRead: () => {
		notificationStore.setState(state => ({
			notifications: state.notifications.map(n => ({
				...n,
				status: "read" as const
			}))
		}));
	},

	/**
	 * Remove a notification by ID
	 */
	removeNotification: (id: string) => {
		notificationStore.setState(state => ({
			notifications: state.notifications.filter(n => n.id !== id)
		}));
	},

	/**
	 * Add a new notification (starts as unread)
	 */
	addNotification: (notification: Omit<Notification, "status">) => {
		notificationStore.setState(state => ({
			notifications: [{ ...notification, status: "unread" as const }, ...state.notifications]
		}));
	},

	/**
	 * Get the count of unread notifications
	 */
	getUnreadCount: (): number => {
		return notificationStore.state.notifications.filter(n => n.status === "unread").length;
	},

	/**
	 * Reset to initial mock notifications
	 */
	resetNotifications: () => {
		notificationStore.setState(() => ({
			notifications: initialNotifications
		}));
	},

	/**
	 * Clear all notifications
	 */
	clearAll: () => {
		notificationStore.setState(() => ({
			notifications: []
		}));
	}
};

// --- Selectors ---
// For derived state

export const notificationSelectors = {
	/**
	 * Get all notifications
	 */
	getNotifications: (): Notification[] => {
		return notificationStore.state.notifications;
	},

	/**
	 * Get only unread notifications
	 */
	getUnreadNotifications: (): Notification[] => {
		return notificationStore.state.notifications.filter(n => n.status === "unread");
	},

	/**
	 * Get only read notifications
	 */
	getReadNotifications: (): Notification[] => {
		return notificationStore.state.notifications.filter(n => n.status === "read");
	},

	/**
	 * Get a notification by ID
	 */
	getNotificationById: (id: string): Notification | undefined => {
		return notificationStore.state.notifications.find(n => n.id === id);
	},

	/**
	 * Get the count of all notifications
	 */
	getTotalCount: (): number => {
		return notificationStore.state.notifications.length;
	},

	/**
	 * Get the count of unread notifications
	 */
	getUnreadCount: (): number => {
		return notificationStore.state.notifications.filter(n => n.status === "unread").length;
	},

	/**
	 * Get notifications with pagination
	 */
	getNotificationsPaginated: (limit: number, offset: number): Notification[] => {
		return notificationStore.state.notifications.slice(offset, offset + limit);
	}
};

// --- React Hook for using the store ---
import { useStore } from "@tanstack/react-store";
import { useMemo } from "react";

/**
 * Hook to access the notification store with automatic re-rendering
 */
export function useNotificationStore() {
	const notifications = useStore(notificationStore, state => state.notifications);

	return useMemo(
		() => ({
			// State
			notifications,

			// Actions
			markAsRead: notificationActions.markAsRead,
			markAllAsRead: notificationActions.markAllAsRead,
			removeNotification: notificationActions.removeNotification,
			addNotification: notificationActions.addNotification,
			clearAll: notificationActions.clearAll,
			reset: notificationActions.resetNotifications,

			// Selectors
			getUnreadCount: notificationActions.getUnreadCount,
			getUnreadNotifications: notificationSelectors.getUnreadNotifications,
			getReadNotifications: notificationSelectors.getReadNotifications,
			getTotalCount: notificationSelectors.getTotalCount,

			// Computed values
			unreadCount: notificationSelectors.getUnreadCount(),
			totalCount: notificationSelectors.getTotalCount()
		}),
		[notifications]
	);
}

// --- Persistence helpers ---
// To persist across refreshes, you can use localStorage

export const notificationPersistence = {
	/**
	 * Save notifications to localStorage
	 */
	save: (key = "notifications") => {
		try {
			const notifications = notificationStore.state.notifications;
			localStorage.setItem(key, JSON.stringify(notifications));
		} catch (error) {
			console.error("Failed to save notifications to localStorage:", error);
		}
	},

	/**
	 * Load notifications from localStorage
	 */
	load: (key = "notifications") => {
		try {
			const data = localStorage.getItem(key);
			if (data) {
				const notifications = JSON.parse(data) as Notification[];
				notificationStore.setState(() => ({ notifications }));
				return true;
			}
			return false;
		} catch (error) {
			console.error("Failed to load notifications from localStorage:", error);
			return false;
		}
	},

	/**
	 * Clear notifications from localStorage
	 */
	clear: (key = "notifications") => {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error("Failed to clear notifications from localStorage:", error);
		}
	},

	/**
	 * Auto-save on changes
	 */
	autoSave: (key = "notifications", debounceMs = 1000) => {
		let timeoutId: ReturnType<typeof setTimeout>;

		const unsubscribe = notificationStore.subscribe(() => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				notificationPersistence.save(key);
			}, debounceMs);
		});

		// Return unsubscribe function
		return unsubscribe;
	},

	/**
	 * Initialize with auto-save
	 */
	initialize: (key = "notifications") => {
		const loaded = notificationPersistence.load(key);
		if (!loaded) {
			// If no data in localStorage, use initial notifications
			notificationStore.setState(() => ({
				notifications: initialNotifications
			}));
		}
		return notificationPersistence.autoSave(key);
	}
};
