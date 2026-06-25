// components/notification-center.tsx

import { Link, useRouter } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/ui/notification-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type Notification, notificationActions, notificationStore } from "../utils/store";

const MAX_VISIBLE = 5;

// Updated routes for pediatric clinic app
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

export function NotificationCenter() {
	const notifications = useSelector(notificationStore, state => state.notifications);
	const router = useRouter();
	const { markAsRead, markAllAsRead, unreadCount } = notificationActions;
	const count = unreadCount();
	const visibleNotifications = notifications.slice(0, MAX_VISIBLE);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className='relative h-8 w-8'
					size='icon'
					variant='ghost'
				>
					<Icons.bell className='h-4 w-4' />
					{count > 0 && (
						<span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-medium text-[10px] text-destructive-foreground'>
							{count > 9 ? "9+" : count}
						</span>
					)}
					<span className='sr-only'>Notifications</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align='end'
				className='w-[calc(100vw-2rem)] p-0 sm:w-[380px]'
				sideOffset={8}
			>
				<div className='flex items-center justify-between px-4 py-3'>
					<Link
						className='group flex items-center gap-1'
						to='/auth/dashboard/notifications'
					>
						<h4 className='font-semibold text-sm group-hover:underline'>Notifications</h4>
						<Icons.chevronRight className='h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
					</Link>
					<div className='flex items-center gap-2'>
						{count > 0 && (
							<span className='rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs'>
								{count} new
							</span>
						)}
						{count > 0 && (
							<Button
								className='h-auto px-2 py-1 text-muted-foreground text-xs'
								onClick={markAllAsRead}
								size='sm'
								variant='ghost'
							>
								Mark all as read
							</Button>
						)}
					</div>
				</div>
				<Separator />
				<ScrollArea className='h-[400px]'>
					{notifications.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12'>
							<Icons.bell className='mb-2 h-8 w-8 text-muted-foreground/40' />
							<p className='text-muted-foreground text-sm'>No notifications yet</p>
							<p className='text-muted-foreground/60 text-xs'>Stay updated on patient care</p>
						</div>
					) : (
						<div className='flex flex-col gap-1 p-2'>
							{visibleNotifications.map((notification: Notification) => (
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
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
