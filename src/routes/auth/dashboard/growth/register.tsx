import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Baby } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";

// ============================================================
// Schema
// ============================================================

const registrationSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.date({ message: "Date of birth is required" }),
	gender: z.enum(["boy", "girl", "other"]),
	email: z.email("Invalid email").optional().or(z.literal("")),
	phone: z.string().optional(),
	address: z.string().optional()
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

// ============================================================
// Route
// ============================================================

export const Route = createFileRoute("/auth/dashboard/growth/register")({
	component: GrowthRegistrationPage
});

// ============================================================
// Main Component
// ============================================================

function GrowthRegistrationPage() {
	const router = useRouter();

	const registrationMutation = useMutation({
		mutationFn: async (data: RegistrationFormValues) => {
			const response = await fetch("/api/growth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...data,
					dateOfBirth: data.dateOfBirth.toISOString()
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Registration failed");
			}

			return response.json();
		},
		onSuccess: data => {
			toast.success("Child registered successfully!");
			router.navigate({
				to: "/auth/dashboard/growth/$patientId", // Corrected path
				params: { patientId: data.data.id }
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to register child");
		}
	});

	const form = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			dateOfBirth: new Date(),
			gender: "boy" as const,
			email: "",
			phone: "",
			address: ""
		} as RegistrationFormValues,
		validators: {
			onSubmit: registrationSchema
		},
		onSubmit: ({ value }) => {
			registrationMutation.mutate(value);
		}
	});

	const { FormTextField, FormSelectField, FormTextareaField, FormDateField } =
		useFormFields<RegistrationFormValues>();

	const genderOptions = [
		{ value: "boy", label: "Boy" },
		{ value: "girl", label: "Girl" },
		{ value: "other", label: "Other" }
	];

	const isSubmitting = registrationMutation.isPending;

	return (
		<div className='mx-auto max-w-2xl space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link to='/auth/dashboard/growth'>
					<Button
						size='icon'
						variant='ghost'
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
				</Link>
				<div>
					<h1 className='font-bold text-2xl text-sea-ink'>Register Child</h1>
					<p className='text-sea-ink-soft text-sm'>Add a new child for growth tracking</p>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<Baby className='h-5 w-5 text-lagoon' />
						Child Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form.Form className='space-y-6'>
							<div className='grid gap-4 md:grid-cols-2'>
								<FormTextField
									label='First Name *'
									name='firstName'
									placeholder='Enter first name'
									required
								/>

								<FormTextField
									label='Last Name *'
									name='lastName'
									placeholder='Enter last name'
									required
								/>

								<FormDateField
									label='Date of Birth *'
									name='dateOfBirth'
									required
								/>

								<FormSelectField
									label='Gender *'
									name='gender'
									options={genderOptions}
									placeholder='Select gender'
									required
								/>

								<FormTextField
									label='Email'
									name='email'
									placeholder='parent@example.com'
									type='email'
								/>

								<FormTextField
									label='Phone'
									name='phone'
									placeholder='+20 123 456 7890'
								/>
							</div>

							<FormTextareaField
								label='Address'
								name='address'
								placeholder='Enter address'
								rows={3}
							/>

							<div className='flex justify-end gap-3 border-t pt-4'>
								<Link to='/auth/dashboard/growth'>
									<Button
										type='button'
										variant='outline'
									>
										Cancel
									</Button>
								</Link>
								<form.SubmitButton disabled={isSubmitting}>
									{isSubmitting ? "Registering..." : "Register Child"}
								</form.SubmitButton>
							</div>
						</form.Form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	);
}
