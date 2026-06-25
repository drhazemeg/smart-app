import { Link, useLocation, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail
} from "@/components/ui/sidebar";
import { navGroups } from "@/config/nav-config";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useFilteredNavGroups } from "@/hooks/use-nav";
import { cn } from "@/lib/utils";
import type { NavGroup, NavItem, NavSubItem } from "@/types";
import { Icons } from "../icons";

// Helper function to get icon component
const getIconComponent = (iconName?: string) => {
	if (!iconName) return Icons.logo;
	// Safely check if the iconName exists in Icons before accessing
	if (iconName in Icons) {
		return Icons[iconName as keyof typeof Icons];
	}
	return Icons.logo; // Fallback to a default icon if not found
};

// Extracted navigation item component
const NavItem = React.memo(({ item, pathname }: { item: NavItem; pathname: string }) => {
	const Icon = getIconComponent(item.icon);
	const hasSubItems = item.items && item.items.length > 0;
	const isActive = pathname === item.url || item.items?.some(sub => pathname === sub.url);

	if (hasSubItems) {
		return (
			<Collapsible
				asChild
				className='group/collapsible'
				defaultOpen={isActive}
				key={item.title}
			>
				<SidebarMenuItem>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							className='hover:bg-sidebar-accent/50'
							isActive={isActive}
							tooltip={item.title}
						>
							{item.icon && <Icon className='shrink-0' />}
							<span className='truncate'>{item.title}</span>
							<Icons.chevronRight
								className={cn(
									"ml-auto shrink-0 transition-transform duration-200",
									"group-data-[state=open]/collapsible:rotate-90"
								)}
							/>
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.items?.map(subItem => (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton
										asChild
										className='hover:bg-sidebar-accent/50'
										isActive={pathname === subItem.url}
									>
										<Link
											to={
												subItem.url as
													| "/"
													| "/auth"
													| "/auth/forgot-password"
													| "/auth/dashboard"
													| "/auth/$path"
													| "/account/$path"
											}
										>
											{subItem.icon && <Icon className='mr-2 h-4 w-4 shrink-0' />}
											<span className='truncate'>{subItem.title}</span>
											{subItem.badge && (
												<span className='ml-auto rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground text-xs'>
													{subItem.badge}
												</span>
											)}
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);
	}

	return (
		<SidebarMenuItem key={item.title}>
			<SidebarMenuButton
				asChild
				className='hover:bg-sidebar-accent/50'
				isActive={isActive}
				tooltip={item.title}
			>
				<Link
					to={
						item.url as
							| "/"
							| "/auth"
							| "/auth/forgot-password"
							| "/auth/dashboard"
							| "/auth/$path"
							| "/account/$path"
					}
				>
					<Icon className='shrink-0' />
					<span className='truncate'>{item.title}</span>
					{item.badge && (
						<span className='ml-auto rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground text-xs'>
							{item.badge}
						</span>
					)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
});

NavItem.displayName = "NavItem";

// Extracted user menu component
const UserMenu = React.memo(() => {
	const router = useRouter();
	const { user, signOut } = useAuth();

	const handleSignOut = async () => {
		await signOut();
		router.navigate({ to: "/auth/$path", params: { path: "login" } });
	};

	if (!user) {
		return (
			<SidebarMenuButton
				asChild
				className='hover:bg-sidebar-accent/50'
				size='lg'
			>
				<Link
					params={{ path: "login" }}
					to='/auth/$path'
				>
					<Icons.account className='size-4' />
					<span>Sign In</span>
				</Link>
			</SidebarMenuButton>
		);
	}

	// Get unread notifications count - safely access if it exists
	const unreadNotifications = (user as { unreadNotifications?: number }).unreadNotifications ?? 0;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					className='hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
					size='lg'
				>
					<div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/10'>
						{user.image ? (
							<img
								alt={user.name}
								className='size-full rounded-full object-cover'
								src={user.image}
							/>
						) : (
							<Icons.account className='size-4' />
						)}
					</div>
					<div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
						<span className='truncate font-medium'>{user.name}</span>
						<span className='truncate text-muted-foreground text-xs'>{user.email}</span>
					</div>
					<Icons.chevronsDown className='ml-auto size-4 shrink-0' />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
				side='bottom'
				sideOffset={4}
			>
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => router.navigate({ to: "/auth/$path", params: { path: "dashboard" } })}
					>
						<Icons.user className='mr-2 h-4 w-4' />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.navigate({ to: "/auth/$path", params: { path: "settings" } })}
					>
						<Icons.settings className='mr-2 h-4 w-4' />
						Settings
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.navigate({ to: "/auth/$path", params: { path: "notifications" } })}
					>
						<div className='relative'>
							<Icons.notification className='mr-2 h-4 w-4' />
							{unreadNotifications > 0 && (
								<span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500' />
							)}
						</div>
						Notifications
						{unreadNotifications > 0 && (
							<span className='ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-white text-xs'>
								{unreadNotifications}
							</span>
						)}
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className='text-destructive focus:text-destructive'
					onClick={handleSignOut}
				>
					<Icons.logout className='mr-2 h-4 w-4' />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});

UserMenu.displayName = "UserMenu";

// Main component
export default function AppSidebar() {
	const { pathname } = useLocation();
	const filteredGroups = useFilteredNavGroups(navGroups as NavGroup[]); // FIX: Type assertion to resolve incompatibility between NavGroup types from config and types/index. The root cause is likely a mismatch in IconName definition between src/config/nav-config.ts and src/types/index.ts.
	const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

	// Auto-expand groups based on current route
	React.useEffect(() => {
		const newExpanded = new Set(expandedGroups);
		filteredGroups.forEach((group: NavGroup) => {
			const hasActiveItem = group.items.some(
				(item: NavItem) => pathname === item.url || item.items?.some((sub: NavSubItem) => pathname === sub.url)
			);
			if (hasActiveItem) {
				newExpanded.add(group.label || "ungrouped");
			}
		});
		setExpandedGroups(newExpanded);
	}, [pathname, filteredGroups, expandedGroups]);

	// Handle keyboard shortcuts
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+B or Cmd+B to toggle sidebar
			if ((e.metaKey || e.ctrlKey) && e.key === "b") {
				e.preventDefault();
				// Your sidebar toggle logic
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<Sidebar
			className='border-sidebar-border border-r'
			collapsible='icon'
			variant='inset'
		>
			<SidebarHeader className='border-sidebar-border/50 border-b pb-2'>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className='hover:bg-sidebar-accent/50'
							size='lg'
						>
							<Link to='/auth/dashboard'>
								<div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-sm'>
									<Icons.logo className='size-4' />
								</div>
								<div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-semibold'>Pedia Dashboard</span>
									<span className='truncate text-muted-foreground text-xs'>v2.0.0</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className='overflow-x-hidden py-2'>
				{filteredGroups.map((group: NavGroup) => (
					<SidebarGroup
						className='py-1'
						key={group.label || "ungrouped"}
					>
						{group.label && (
							<SidebarGroupLabel className='px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wider'>
								{group.label}
							</SidebarGroupLabel>
						)}
						<SidebarMenu>
							{group.items.map((item: NavItem) => (
								<NavItem
									item={item}
									key={item.title}
									pathname={pathname}
								/>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter className='border-sidebar-border/50 border-t pt-2'>
				<SidebarMenu>
					<SidebarMenuItem>
						<UserMenu />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
