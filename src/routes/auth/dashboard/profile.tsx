import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/auth/dashboard/profile")({
	component: ProfilePage,
	pendingComponent: () => <ProfileSkeleton />
});

const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	address: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePage() {
	const { user, updateProfile, isUpdatingProfile } = useAuth();

	const form = useForm({
		defaultValues: {
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			address: user?.address || ""
		} as ProfileFormValues,
		validators: {
			onSubmit: profileSchema
		},
		onSubmit: async ({ value }) => {
			try {
				await updateProfile(value);
				toast.success("Profile updated successfully");
			} catch {
				toast.error("Failed to update profile");
			}
		}
	});

	if (!user) return null;

	return (
		<div className='container mx-auto max-w-4xl space-y-6 py-8'>
			<div>
				<h1 className='font-bold text-3xl'>Profile</h1>
				<p className='text-muted-foreground'>Manage your personal information</p>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				{/* Profile Card */}
				<Card className='md:col-span-1'>
					<CardContent className='pt-6'>
						<div className='flex flex-col items-center text-center'>
							<Avatar className='h-24 w-24'>
								<AvatarImage src={user.image || undefined} />
								<AvatarFallback className='text-2xl'>
									{user.name
										?.split(" ")
										.map(n => n[0])
										.join("")
										.toUpperCase()
										.slice(0, 2) || "U"}
								</AvatarFallback>
							</Avatar>
							<h2 className='mt-3 font-semibold text-xl'>{user.name}</h2>
							<p className='text-muted-foreground text-sm'>{user.email}</p>
							{user.role && (
								<span className='mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs'>
									{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
								</span>
							)}
						</div>

						<Separator className='my-4' />

						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Member since</span>
								<span>{new Date(user.createdAt).toLocaleDateString()}</span>
							</div>
							{user.clinicId && (
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Clinic</span>
									<span>Active</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Edit Form */}
				<Card className='md:col-span-2'>
					<CardHeader>
						<CardTitle>Edit Profile</CardTitle>
						<CardDescription>Update your personal information</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							className='space-y-4'
							onSubmit={e => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<form.Field name='name'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Full Name</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter your full name'
											value={field.state.value}
										/>
										{field.state.meta.errors && (
											<p className='text-destructive text-sm'>
												{field.state.meta.errors.join(", ")}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name='email'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter your email'
											type='email'
											value={field.state.value}
										/>
										{field.state.meta.errors && (
											<p className='text-destructive text-sm'>
												{field.state.meta.errors.join(", ")}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name='phone'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Phone</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter your phone number'
											type='tel'
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name='address'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Address</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter your address'
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

							<div className='flex gap-2 pt-4'>
								<Button
									className='bg-primary hover:bg-primary/90'
									disabled={isUpdatingProfile}
									type='submit'
								>
									{isUpdatingProfile ? "Saving..." : "Save Changes"}
								</Button>
								<Button
									type='button'
									variant='outline'
								>
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<div className='container mx-auto max-w-4xl space-y-6 py-8'>
			<Skeleton className='h-8 w-32' />
			<Skeleton className='h-4 w-64' />
			<div className='grid gap-6 md:grid-cols-3'>
				<Skeleton className='h-80' />
				<Skeleton className='h-96 md:col-span-2' />
			</div>
		</div>
	);
}
