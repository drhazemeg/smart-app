import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/features/auth/client";

export const Route = createFileRoute("/auth/dashboard/settings")({
	component: SettingsPage,
	pendingComponent: () => <SettingsSkeleton />
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(8, "Password must be at least 8 characters"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(8, "Please confirm your password")
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	});

type PasswordFormValues = z.infer<typeof passwordSchema>;

function SettingsPage() {
	const passwordForm = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: ""
		} as PasswordFormValues,
		validators: {
			onSubmit: passwordSchema
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.changePassword({
					currentPassword: value.currentPassword,
					newPassword: value.newPassword,
					revokeOtherSessions: true
				});
				toast.success("Password updated successfully");
				passwordForm.reset();
			} catch {
				toast.error("Failed to update password");
			}
		}
	});

	return (
		<div className='container mx-auto max-w-4xl space-y-6 py-8'>
			<div>
				<h1 className='font-bold text-3xl'>Settings</h1>
				<p className='text-muted-foreground'>Manage your account settings</p>
			</div>

			<Tabs defaultValue='security'>
				<TabsList>
					<TabsTrigger value='security'>Security</TabsTrigger>
					<TabsTrigger value='notifications'>Notifications</TabsTrigger>
					<TabsTrigger value='preferences'>Preferences</TabsTrigger>
				</TabsList>

				<TabsContent
					className='space-y-6'
					value='security'
				>
					<Card>
						<CardHeader>
							<CardTitle>Change Password</CardTitle>
							<CardDescription>Update your password to keep your account secure</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								className='space-y-4'
								onSubmit={e => {
									e.preventDefault();
									passwordForm.handleSubmit();
								}}
							>
								<passwordForm.Field name='currentPassword'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Current Password</Label>
											<Input
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Enter current password'
												type='password'
												value={field.state.value}
											/>
											{field.state.meta.errors && (
												<p className='text-destructive text-sm'>
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										</div>
									)}
								</passwordForm.Field>

								<passwordForm.Field name='newPassword'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>New Password</Label>
											<Input
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Enter new password'
												type='password'
												value={field.state.value}
											/>
											{field.state.meta.errors && (
												<p className='text-destructive text-sm'>
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										</div>
									)}
								</passwordForm.Field>

								<passwordForm.Field name='confirmPassword'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Confirm New Password</Label>
											<Input
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Confirm new password'
												type='password'
												value={field.state.value}
											/>
											{field.state.meta.errors && (
												<p className='text-destructive text-sm'>
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										</div>
									)}
								</passwordForm.Field>

								<Button type='submit'>Update Password</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Two-Factor Authentication</CardTitle>
							<CardDescription>Add an extra layer of security to your account</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Two-Factor Authentication</p>
									<p className='text-muted-foreground text-sm'>
										Require a code from your authenticator app
									</p>
								</div>
								<Switch />
							</div>
							<Button variant='outline'>Set Up 2FA</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='space-y-6'
					value='notifications'
				>
					<Card>
						<CardHeader>
							<CardTitle>Notification Preferences</CardTitle>
							<CardDescription>Choose what notifications you want to receive</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Appointment Reminders</p>
									<p className='text-muted-foreground text-sm'>
										Get notified about upcoming appointments
									</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Patient Updates</p>
									<p className='text-muted-foreground text-sm'>Get notified about patient activity</p>
								</div>
								<Switch defaultChecked />
							</div>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>System Alerts</p>
									<p className='text-muted-foreground text-sm'>
										Get notified about system updates and maintenance
									</p>
								</div>
								<Switch />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					className='space-y-6'
					value='preferences'
				>
					<Card>
						<CardHeader>
							<CardTitle>Preferences</CardTitle>
							<CardDescription>Customize your experience</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label>Theme</Label>
								<div className='flex gap-2'>
									<Button
										className='flex-1'
										variant='outline'
									>
										Light
									</Button>
									<Button
										className='flex-1'
										variant='outline'
									>
										Dark
									</Button>
									<Button
										className='flex-1'
										variant='outline'
									>
										System
									</Button>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Language</p>
									<p className='text-muted-foreground text-sm'>Choose your preferred language</p>
								</div>
								<select className='rounded-md border p-2'>
									<option value='en'>English</option>
									<option value='ar'>Arabic</option>
								</select>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className='container mx-auto max-w-4xl space-y-6 py-8'>
			<Skeleton className='h-8 w-32' />
			<Skeleton className='h-4 w-48' />
			<Skeleton className='h-10 w-64' />
			<Skeleton className='h-96 w-full' />
		</div>
	);
}
