// src/routes/_auth/dashboard.tsx

import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
	Activity,
	Calendar,
	ClipboardList,
	CreditCard,
	FileText,
	FlaskConical,
	LanguagesIcon,
	LayoutDashboard,
	LogOut,
	Settings,
	Syringe,
	Users
} from "lucide-react";
import React from "react";
import LanguageDropdown from "@/components/dashboard/dropdown-language";
import ProfileDropdown from "@/components/dashboard/dropdown-profile";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/auth/dashboard")({
	component: DashboardLayout
});

function DashboardLayout() {
	const location = useLocation();
	const pathSegments = location.pathname.split("/").filter(Boolean);

	// Define navigation items for the sidebar
	const navItems = [
		{
			group: "Overview",
			items: [
				{ title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
				{ title: "Patients", icon: Users, path: "/dashboard/patients" },
				{
					title: "Appointments",
					icon: Calendar,
					path: "/dashboard/appointments"
				},
				{ title: "Growth Tracking", icon: Activity, path: "/dashboard/growth" }
			]
		},
		{
			group: "Clinical",
			items: [
				{
					title: "Medical Records",
					icon: FileText,
					path: "/dashboard/records"
				},
				{
					title: "Prescriptions",
					icon: ClipboardList,
					path: "/dashboard/prescriptions"
				},
				{
					title: "Immunizations",
					icon: Syringe,
					path: "/dashboard/immunizations"
				},
				{ title: "Lab Results", icon: FlaskConical, path: "/dashboard/labs" }
			]
		},
		{
			group: "Administration",
			items: [
				{ title: "Staff", icon: Users, path: "/dashboard/staff" },
				{ title: "Billing", icon: CreditCard, path: "/dashboard/billing" },
				{ title: "Settings", icon: Settings, path: "/dashboard/settings" }
			]
		}
	];

	return (
		<div className='flex min-h-dvh w-full'>
			<SidebarProvider>
				<Sidebar>
					<SidebarContent>
						<SidebarHeader>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										size='lg'
									>
										<Link to='/auth/dashboard'>
											<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
												<Activity className='size-4' />
											</div>
											<div className='grid flex-1 text-left text-sm leading-tight'>
												<span className='truncate font-semibold'>Smart Clinic</span>
												<span className='truncate text-xs'>Pediatric Center</span>
											</div>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarHeader>

						{navItems.map(group => (
							<SidebarGroup key={group.group}>
								<SidebarGroupLabel>{group.group}</SidebarGroupLabel>
								<SidebarGroupContent>
									<SidebarMenu>
										{group.items.map(item => {
											const isActive =
												location.pathname === item.path ||
												(item.path !== "/dashboard" && location.pathname.startsWith(item.path));
											return (
												<SidebarMenuItem key={item.path}>
													<SidebarMenuButton
														asChild
														isActive={isActive}
													>
														<Link to={item.path}>
															<item.icon />
															<span>{item.title}</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											);
										})}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						))}

						<SidebarGroup className='mt-auto'>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild>
											<Link
												className='transition-colors hover:text-sea-ink'
												params={{ path: "sign-out" }}
												to='/auth/$path'
											>
												<LogOut />
												<span>Sign Out</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>

				<div className='flex flex-1 flex-col'>
					<header className='sticky top-0 z-50 border-b bg-card'>
						<div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6'>
							<div className='flex items-center gap-4'>
								<SidebarTrigger className='[&_svg]:h-5 [&_svg]:w-5' />
								<Separator
									className='hidden h-4 sm:block'
									orientation='vertical'
								/>
								<Breadcrumb className='hidden sm:block'>
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink asChild>
												<Link to='/auth/dashboard'>Home</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										{pathSegments.map((segment, index) => {
											const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
											const isLast = index === pathSegments.length - 1;
											const title = segment.charAt(0).toUpperCase() + segment.slice(1);

											return (
												<React.Fragment key={path}>
													<BreadcrumbItem>
														{isLast ? (
															<BreadcrumbPage>{title}</BreadcrumbPage>
														) : (
															<BreadcrumbLink asChild>
																<Link to={path}>{title}</Link>
															</BreadcrumbLink>
														)}
													</BreadcrumbItem>
													{!isLast && <BreadcrumbSeparator />}
												</React.Fragment>
											);
										})}
									</BreadcrumbList>
								</Breadcrumb>
							</div>
							<div className='flex items-center gap-1.5'>
								<LanguageDropdown
									trigger={
										<Button
											size='icon'
											variant='ghost'
										>
											<LanguagesIcon />
										</Button>
									}
								/>
								<ProfileDropdown
									trigger={
										<Button
											className='h-10 w-10'
											size='icon'
											variant='ghost'
										>
											<Avatar className='h-10 w-10 rounded-md'>
												<AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
											</Avatar>
										</Button>
									}
								/>
							</div>
						</div>
					</header>

					<main className='mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
						<Outlet />
					</main>

					<footer>
						<div className='mx-auto flex w-full flex-col items-center justify-between gap-3 px-4 py-3 text-muted-foreground sm:flex-row sm:gap-6 sm:px-6'>
							<p className='text-center text-sm sm:text-left'>
								{`©${new Date().getFullYear()}`}{" "}
								<a
									className='text-primary'
									href='/#'
								>
									Smart Clinic
								</a>
								, Pediatric Growth Tracking System
							</p>
							<div className='flex items-center gap-5'>
								<a href='/#'>
									<Icons.facebook className='h-4 w-4' />
								</a>
								<a href='/#'>
									<Icons.instagram className='h-4 w-4' />
								</a>
								<a href='/#'>
									<Icons.linkedin className='h-4 w-4' />
								</a>
								<a href='/#'>
									<Icons.twitter className='h-4 w-4' />
								</a>
							</div>
						</div>
					</footer>
				</div>
			</SidebarProvider>
		</div>
	);
}
