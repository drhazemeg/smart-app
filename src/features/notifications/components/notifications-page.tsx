import { useRouter } from "@tanstack/react-router";

import { Icons } from "@/components/icons";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/ui/notification-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useNotificationStore } from "../utils/store";

const actionRoutes: Record<string, string> = {
	view: "/dashboard/overview",
	"view-product": "/dashboard/product",
	billing: "/dashboard/overview",
	open: "/dashboard/kanban",
	"open-chat": "/dashboard/chat"
};

export default function NotificationsPage() {
	const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
	const router = useRouter();
	const count = unreadCount();

	const unreadNotifications = notifications.filter(n => n.status === "unread");
	const readNotifications = notifications.filter(n => n.status === "read");

	const renderList = (items: typeof notifications) => {
		if (items.length === 0) {
			return (
				<div className='flex flex-col items-center justify-center py-16'>
					<Icons.notification className='mb-3 h-10 w-10 text-muted-foreground/40' />
					<p className='text-muted-foreground text-sm'>No notifications</p>
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
			pageDescription='View and manage all your notifications.'
			pageHeaderAction={
				count > 0 ? (
					<Button
						onClick={markAllAsRead}
						size='sm'
						variant='outline'
					>
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
