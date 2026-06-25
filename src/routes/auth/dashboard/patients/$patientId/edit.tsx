// routes/dashboard/patients/$patientId.edit.tsx

import { useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import type { BloodGroup } from "#/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UpdatePatientSchema } from "@/db/zod";
import { updatePatient } from "@/functions/patient";
import { getPatientOptions } from "@/functions/queries";

const editPatientSchema = UpdatePatientSchema;
type EditPatientFormValues = z.infer<typeof editPatientSchema>;
const allowedBloodGroups = [
	"A_POSITIVE",
	"A_NEGATIVE",
	"B_POSITIVE",
	"B_NEGATIVE",
	"O_POSITIVE",
	"O_NEGATIVE",
	"AB_POSITIVE",
	"AB_NEGATIVE"
] as const;

type BloodGroupValue = (typeof allowedBloodGroups)[number];

type EditPatientFormInputValues = Omit<EditPatientFormValues, "dateOfBirth" | "bloodGroup"> & {
	dateOfBirth?: string;
	bloodGroup?: BloodGroupValue | "" | null;
};

export const Route = createFileRoute("/auth/dashboard/patients/$patientId/edit")({
	component: EditPatientPage,
	pendingComponent: () => <EditPatientSkeleton />,
	loader: ({ params }) => getPatientOptions(params.patientId)
});

function EditPatientPage() {
	const { patientId } = Route.useParams();
	const navigate = useNavigate();
	const patientQuery = useSuspenseQuery(getPatientOptions(patientId));
	const data = patientQuery.data;

	if (!data) {
		throw notFound();
	}

	const isBloodGroupValue = (value: unknown): value is BloodGroupValue =>
		typeof value === "string" && (allowedBloodGroups as readonly string[]).includes(value);

	const parseBloodGroup = (value: EditPatientFormInputValues["bloodGroup"]): EditPatientFormValues["bloodGroup"] => {
		if (isBloodGroupValue(value)) {
			return value;
		}
		return;
	};

	const updateMutation = useMutation({
		mutationFn: async (values: EditPatientFormInputValues) => {
			// Convert date string to Date object for the API
			const { bloodGroup, dateOfBirth, ...rest } = values;
			const updateData: EditPatientFormValues = {
				...rest,
				dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
				bloodGroup: parseBloodGroup(bloodGroup)
			};
			return await updatePatient({
				data: {
					id: patientId,
					data: updateData
				}
			});
		},
		onSuccess: () => {
			toast.success("Patient updated successfully");
			navigate({ to: "/auth/dashboard/patients/$patientId", params: { patientId } });
		},
		onError: error => {
			console.error("Update error:", error);
			toast.error("Failed to update patient");
		}
	});

	const form = useForm({
		defaultValues: {
			firstName: data.firstName || "",
			lastName: data.lastName || "",
			dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : undefined,
			gender: data.gender || "boy",
			email: data.email || "",
			phone: data.phone || "",
			address: data.address || "",
			bloodGroup: (data.bloodGroup as BloodGroupValue) ?? "",
			allergies: data.allergies || "",
			medicalConditions: data.medicalConditions || "",
			isActive: data.isActive ?? true
		},
		onSubmit: ({ value }) => {
			// Pass the form values directly - the mutation will handle date conversion
			updateMutation.mutate(value);
		}
	});

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link
					params={{ patientId }}
					to='/auth/dashboard/patients/$patientId'
				>
					<Button
						size='icon'
						variant='ghost'
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
				</Link>
				<div>
					<h1 className='font-bold font-serif text-2xl text-sea-ink'>Edit Patient</h1>
					<p className='text-sea-ink-soft text-sm'>
						Update {data.firstName} {data.lastName}'s information
					</p>
				</div>
			</div>

			{/* Form */}
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
						{/* Name Fields */}
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

						{/* Date of Birth & Gender */}
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
										<Select
											onValueChange={value =>
												field.handleChange(value as "boy" | "girl" | "other")
											}
											value={field.state.value}
										>
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

						{/* Contact Info */}
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
									{field.state.meta.errors && (
										<p className='text-red-500 text-sm'>{field.state.meta.errors.join(", ")}</p>
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

						{/* Medical Information */}
						<form.Field name='bloodGroup'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Blood Group</Label>
									<Select
										onValueChange={value => field.handleChange(value as BloodGroup)}
										value={field.state.value}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select blood group' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value=''>Not specified</SelectItem>
											<SelectItem value='A_POSITIVE'>A+</SelectItem>
											<SelectItem value='A_NEGATIVE'>A-</SelectItem>
											<SelectItem value='B_POSITIVE'>B+</SelectItem>
											<SelectItem value='B_NEGATIVE'>B-</SelectItem>
											<SelectItem value='O_POSITIVE'>O+</SelectItem>
											<SelectItem value='O_NEGATIVE'>O-</SelectItem>
											<SelectItem value='AB_POSITIVE'>AB+</SelectItem>
											<SelectItem value='AB_NEGATIVE'>AB-</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name='allergies'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Allergies</Label>
									<Input
										id={field.name}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='e.g., Penicillin, Peanuts'
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name='medicalConditions'>
							{field => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Medical Conditions</Label>
									<Input
										id={field.name}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='e.g., Asthma, Diabetes'
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						{/* Status */}
						<form.Field name='isActive'>
							{field => (
								<div className='flex items-center space-x-2 pt-2'>
									<input
										checked={field.state.value}
										className='h-4 w-4 rounded border-gray-300'
										id={field.name}
										onChange={e => field.handleChange(e.target.checked)}
										type='checkbox'
									/>
									<Label
										className='text-sm'
										htmlFor={field.name}
									>
										Patient is active
									</Label>
								</div>
							)}
						</form.Field>

						{/* Actions */}
						<div className='flex gap-2 border-t pt-4'>
							<Button
								className='bg-lagoon hover:bg-lagoon-deep'
								disabled={updateMutation.isPending}
								type='submit'
							>
								{updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Save Changes
							</Button>
							<Button
								onClick={() =>
									navigate({
										to: "/auth/dashboard/patients/$patientId",
										params: { patientId }
									})
								}
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

function EditPatientSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Skeleton className='h-10 w-10' />
				<div>
					<Skeleton className='h-7 w-48' />
					<Skeleton className='mt-1 h-4 w-32' />
				</div>
			</div>
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-32' />
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
					<Skeleton className='h-20 w-full' />
					<Skeleton className='h-20 w-full' />
					<Skeleton className='h-20 w-full' />
					<div className='grid gap-4 sm:grid-cols-2'>
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
					<Skeleton className='h-10 w-full max-w-xs' />
				</CardContent>
			</Card>
		</div>
	);
}
