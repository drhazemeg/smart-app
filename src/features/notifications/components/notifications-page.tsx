// components/notifications-page.tsx

import { Icons } from "@/components/icons";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/ui/notification-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@tanstack/react-router"; // Keep this line
import { notificationActions, notificationStore } from "../utils/store";
import { useSelector } from "@tanstack/react-store";

// Updated routes for pediatric clinic
const actionRoutes: Record<string, string> = {
	"view-patient": "/auth/dashboard/patients",
	"view-lab-results": "/auth/dashboard/lab-results",
	"view-immunizations": "/auth/dashboard/immunizations",
	"view-appointment": "/auth/dashboard/appointments",
	"view-prescription": "/auth/dashboard/prescriptions",
	"view-all": "/auth/dashboard/overview",
	"add-vaccination": "/auth/dashboard/vaccinations",
	"view-growth": "/auth/dashboard/growth-charts",
	"view-medical-records": "/auth/dashboard/medical-records"
};

export default function NotificationsPage() {
	const notifications = useSelector(notificationStore, state => state.notifications);
	const router = useRouter();
	const { markAsRead, markAllAsRead, unreadCount } = notificationActions;
	const count = unreadCount();

	const unreadNotifications = notifications.filter(n => n.status === "unread");
	const readNotifications = notifications.filter(n => n.status === "read");

	const renderList = (items: typeof notifications) => {
		if (items.length === 0) {
			return (
				<div className='flex flex-col items-center justify-center py-16'>
					<Icons.bell className='mb-3 h-10 w-10 text-muted-foreground/40' />
					<p className='text-muted-foreground text-sm'>No notifications</p>
					<p className='mt-1 text-muted-foreground/60 text-xs'>
						{items === unreadNotifications ? "All caught up! 🎉" : "Check back later"}
					</p>
				</div>
			);
		}

		return (
			<div className='flex flex-col gap-2'>
				{items.map(notification => (
					<NotificationCard
						actions={notification.actions}
						body={notification.body}
						createdAt={notification.createdAt}
						id={notification.id}
						key={notification.id}
						onAction={(notifId, actionId) => {
							const route = actionRoutes[actionId];
							if (route) {
								markAsRead(notifId);
								router.navigate({ to: route });
							}
						}}
						onMarkAsRead={markAsRead}
						status={notification.status}
						title={notification.title}
					/>
				))}
			</div>
		);
	};

	return (
		<PageContainer
			pageDescription='Stay updated on patient care, appointments, and clinical tasks.'
			pageHeaderAction={
				count > 0 ? (
					<Button
						onClick={markAllAsRead}
						size='sm'
						variant='outline'
					>
						<Icons.check className='mr-2 h-4 w-4' />
						Mark all as read
					</Button>
				) : undefined
			}
			pageTitle='Notifications'
		>
			<Tabs defaultValue='all'>
				<TabsList>
					<TabsTrigger value='all'>All ({notifications.length})</TabsTrigger>
					<TabsTrigger value='unread'>Unread ({unreadNotifications.length})</TabsTrigger>
					<TabsTrigger value='read'>Read ({readNotifications.length})</TabsTrigger>
				</TabsList>
				<TabsContent
					className='mt-4'
					value='all'
				>
					{renderList(notifications)}
				</TabsContent>
				<TabsContent
					className='mt-4'
					value='unread'
				>
					{renderList(unreadNotifications)}
				</TabsContent>
				<TabsContent
					className='mt-4'
					value='read'
				>
					{renderList(readNotifications)}
				</TabsContent>
			</Tabs>
		</PageContainer>
	);
}
