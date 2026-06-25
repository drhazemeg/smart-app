import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPatient } from "@/functions/patient";

const patientSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["boy", "girl", "other"]),
	email: z.email().optional(),
	phone: z.string().optional(),
	address: z.string().optional()
});

type PatientFormValues = z.infer<typeof patientSchema>;

export const Route = createFileRoute("/auth/dashboard/patients/new")({
	component: NewPatientPage
});

function NewPatientPage() {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			dateOfBirth: "",
			gender: "boy" as "boy" | "girl" | "other",
			email: "",
			phone: "",
			address: ""
		} as PatientFormValues,
		onSubmit: async ({ value }) => {
			try {
				await createPatient({
					data: {
						...value,
						userId: "current-user-id", // Replace with actual user ID
						dateOfBirth: new Date(value.dateOfBirth),
						gender: value.gender as "boy" | "girl" | "other",
						clinicId: "current-clinic-id" // Replace with actual clinic ID
					}
				});
				toast.success("Patient created successfully");
				navigate({ to: "/auth/dashboard/patients" });
			} catch {
				toast.error("Failed to create patient");
			}
		}
	});

	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Button
					onClick={() => navigate({ to: "/auth/dashboard/patients" })}
					size='icon'
					variant='ghost'
				>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink'>New Patient</h1>
					<p className='text-sea-ink-soft text-sm'>Register a new pediatric patient</p>
				</div>
			</div>

			<Card className='max-w-2xl'>
				<CardHeader>
					<CardTitle className='text-lg'>Patient Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						className='space-y-4'
						onSubmit={e => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<div className='grid gap-4 sm:grid-cols-2'>
							<form.Field name='firstName'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>First Name *</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter first name'
											value={field.state.value}
										/>
										{field.state.meta.errors && (
											<p className='text-red-500 text-sm'>{field.state.meta.errors.join(", ")}</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name='lastName'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Last Name *</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter last name'
											value={field.state.value}
										/>
										{field.state.meta.errors && (
											<p className='text-red-500 text-sm'>{field.state.meta.errors.join(", ")}</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<div className='grid gap-4 sm:grid-cols-2'>
							<form.Field name='dateOfBirth'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Date of Birth *</Label>
										<Input
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											type='date'
											value={field.state.value}
										/>
										{field.state.meta.errors && (
											<p className='text-red-500 text-sm'>{field.state.meta.errors.join(", ")}</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name='gender'>
								{field => (
									<div className='space-y-2'>
										<Label>Gender *</Label>
										<Select value={field.state.value}>
											<SelectTrigger>
												<SelectValue placeholder='Select gender' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='boy'>Boy</SelectItem>
												<SelectItem value='girl'>Girl</SelectItem>
												<SelectItem value='other'>Other</SelectItem>
											</SelectContent>
										</Select>
										{field.state.meta.errors && (
											<p className='text-red-500 text-sm'>{field.state.meta.errors.join(", ")}</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name='email'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='Enter email address'
										type='email'
										value={field.state.value}
									/>
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
										placeholder='Enter phone number'
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
										placeholder='Enter address'
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<div className='flex gap-2 pt-4'>
							<Button
								className='bg-lagoon hover:bg-lagoon-deep'
								type='submit'
							>
								Create Patient
							</Button>
							<Button
								onClick={() => navigate({ to: "/auth/dashboard/patients" })}
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
	);
}
