import { createFileRoute, redirect } from "@tanstack/react-router";
import { Activity, Shield, UserCog, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export const Route = createFileRoute("/auth/dashboard/admin")({
	component: AdminPanel,
	pendingComponent: () => <AdminSkeleton />,
	beforeLoad: async () => {
		// Redirect if not admin
		// This would be checked in the actual implementation
		const user = { role: "admin" }; // Mock check
		if (user.role !== "admin") {
			throw redirect({ to: "/auth/dashboard" });
		}
	}
});

const mockUsers = [
	{
		id: "1",
		name: "Dr. Sarah Chen",
		email: "sarah@clinic.com",
		role: "doctor",
		status: "active",
		lastActive: "2 min ago"
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@clinic.com",
		role: "staff",
		status: "active",
		lastActive: "1 hour ago"
	},
	{
		id: "3",
		name: "Mark Johnson",
		email: "mark@clinic.com",
		role: "doctor",
		status: "inactive",
		lastActive: "2 days ago"
	}
];

function AdminPanel() {
	const stats = [
		{ title: "Total Users", value: "24", icon: Users, color: "text-blue-500" },
		{ title: "Active Today", value: "12", icon: Activity, color: "text-green-500" },
		{ title: "Pending Invites", value: "3", icon: UserCog, color: "text-amber-500" },
		{ title: "System Health", value: "Healthy", icon: Shield, color: "text-emerald-500" }
	];

	return (
		<div className='container mx-auto space-y-6 py-8'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='font-bold text-3xl'>Admin Panel</h1>
					<p className='text-muted-foreground'>Manage your clinic's users and settings</p>
				</div>
				<Badge
					className='gap-1'
					variant='outline'
				>
					<Shield className='h-3 w-3' />
					Admin
				</Badge>
			</div>

			{/* Stats Grid */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{stats.map(stat => {
					const Icon = stat.icon;
					return (
						<Card key={stat.title}>
							<CardContent className='flex items-center gap-3 p-4'>
								<div className={`rounded-lg bg-primary/10 p-2 ${stat.color}`}>
									<Icon className='h-5 w-5' />
								</div>
								<div>
									<p className='font-bold text-2xl'>{stat.value}</p>
									<p className='text-muted-foreground text-sm'>{stat.title}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Admin Tabs */}
			<Tabs defaultValue='users'>
				<TabsList>
					<TabsTrigger value='users'>Users</TabsTrigger>
					<TabsTrigger value='invites'>Invites</TabsTrigger>
					<TabsTrigger value='settings'>Settings</TabsTrigger>
					<TabsTrigger value='logs'>Activity Logs</TabsTrigger>
				</TabsList>

				<TabsContent
					className='mt-6'
					value='users'
				>
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<div>
									<CardTitle>User Management</CardTitle>
									<CardDescription>Manage users and their roles</CardDescription>
								</div>
								<Button className='gap-2'>
									<UserCog className='h-4 w-4' />
									Add User
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Last Active</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{mockUsers.map(user => (
										<TableRow key={user.id}>
											<TableCell>
												<div>
													<p className='font-medium'>{user.name}</p>
													<p className='text-muted-foreground text-sm'>{user.email}</p>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant='outline'>{user.role}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={user.status === "active" ? "default" : "secondary"}>
													{user.status}
												</Badge>
											</TableCell>
											<TableCell className='text-muted-foreground text-sm'>
												{user.lastActive}
											</TableCell>
											<TableCell className='text-right'>
												<Button
													size='sm'
													variant='ghost'
												>
													Edit
												</Button>
												<Button
													className='text-destructive hover:text-destructive'
													size='sm'
													variant='ghost'
												>
													Remove
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='mt-6'
					value='invites'
				>
					<Card>
						<CardHeader>
							<CardTitle>Invite Users</CardTitle>
							<CardDescription>Send invites to new team members</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex gap-2'>
								<Input placeholder='Enter email address' />
								<Button>Send Invite</Button>
							</div>
							<div className='space-y-2'>
								<p className='font-medium text-sm'>Pending Invites</p>
								<div className='flex items-center justify-between rounded-lg border p-3'>
									<div>
										<p className='font-medium text-sm'>john.doe@example.com</p>
										<p className='text-muted-foreground text-xs'>Sent 2 days ago</p>
									</div>
									<Badge variant='secondary'>Pending</Badge>
									<Button
										className='text-destructive'
										size='sm'
										variant='ghost'
									>
										Cancel
									</Button>
								</div>
								<div className='flex items-center justify-between rounded-lg border p-3'>
									<div>
										<p className='font-medium text-sm'>mary.wilson@example.com</p>
										<p className='text-muted-foreground text-xs'>Sent 5 days ago</p>
									</div>
									<Badge variant='secondary'>Pending</Badge>
									<Button
										className='text-destructive'
										size='sm'
										variant='ghost'
									>
										Cancel
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='mt-6'
					value='settings'
				>
					<Card>
						<CardHeader>
							<CardTitle>System Settings</CardTitle>
							<CardDescription>Configure system-wide settings</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label>Clinic Name</Label>
									<Input defaultValue='Sunshine Pediatric Clinic' />
								</div>
								<div className='space-y-2'>
									<Label>Default Appointment Duration</Label>
									<Input
										defaultValue='30'
										type='number'
									/>
								</div>
								<div className='space-y-2'>
									<Label>Working Hours Start</Label>
									<Input
										defaultValue='09:00'
										type='time'
									/>
								</div>
								<div className='space-y-2'>
									<Label>Working Hours End</Label>
									<Input
										defaultValue='17:00'
										type='time'
									/>
								</div>
							</div>
							<Button>Save Settings</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='mt-6'
					value='logs'
				>
					<Card>
						<CardHeader>
							<CardTitle>Activity Logs</CardTitle>
							<CardDescription>Recent system activity</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								{[1, 2, 3, 4, 5].map(i => (
									<div
										className='flex items-center justify-between border-b pb-2'
										key={i}
									>
										<div>
											<p className='font-medium text-sm'>User {i} performed action</p>
											<p className='text-muted-foreground text-xs'>2 hours ago</p>
										</div>
										<Badge variant='outline'>Info</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function AdminSkeleton() {
	return (
		<div className='container mx-auto space-y-6 py-8'>
			<Skeleton className='h-8 w-48' />
			<Skeleton className='h-4 w-64' />
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map(i => (
					<Skeleton
						className='h-24'
						key={i}
					/>
				))}
			</div>
			<Skeleton className='h-10 w-64' />
			<Skeleton className='h-96 w-full' />
		</div>
	);
}
