// products/patients/components/patient-form.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";
import { createPatientMutation, updatePatientMutation } from "../api/mutations";
import type { Patient, PatientMutationPayload } from "../api/types";
import { bloodGroupOptions, genderOptions, maritalStatusOptions, relationOptions } from "../constants/patient-options";
import type { createPatientSchema } from "../schemas/patient";

type PatientFormValues = Omit<z.input<typeof createPatientSchema>, "clinicId" | "userId">;

interface PatientFormProps {
	initialData: Patient | null;
	pageTitle: string;
}

export default function PatientForm({ initialData, pageTitle }: PatientFormProps) {
	const router = useRouter();
	const isEdit = !!initialData;

	const createMutation = useMutation({
		...createPatientMutation,
		onSuccess: () => {
			toast.success("Patient created successfully");
			router.navigate({ to: "/auth/dashboard/patients" });
		},
		onError: () => {
			toast.error("Failed to create patient");
		}
	});

	const updateMutation = useMutation({
		...updatePatientMutation,
		onSuccess: () => {
			toast.success("Patient updated successfully");
			router.navigate({ to: "/auth/dashboard/patients" });
		},
		onError: () => {
			toast.error("Failed to update patient");
		}
	});

	const form = useAppForm({
		defaultValues: {
			firstName: initialData?.firstName ?? "",
			lastName: initialData?.lastName ?? "",
			dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
			gender: initialData?.gender ?? "boy",
			email: initialData?.email ?? "",
			phone: initialData?.phone ?? "",
			address: initialData?.address ?? "",
			emergencyContactName: initialData?.emergencyContactName ?? "",
			emergencyContactNumber: initialData?.emergencyContactNumber ?? "",
			relation: initialData?.relation ?? "",
			allergies: initialData?.allergies ?? "",
			medicalConditions: initialData?.medicalConditions ?? "",
			medicalHistory: initialData?.medicalHistory ?? "",
			bloodGroup: initialData?.bloodGroup ?? "",
			maritalStatus: initialData?.maritalStatus ?? "",
			image: initialData?.image ?? "",
			colorCode: initialData?.colorCode ?? "",
			isActive: initialData?.isActive ?? true
		} as PatientFormValues,
		validators: {
			onSubmit: PatientCreateSchema.omit({ clinicId: true, userId: true })
		},
		onSubmit: ({ value }) => {
			const payload: PatientMutationPayload = {
				firstName: value.firstName,
				lastName: value.lastName,
				dateOfBirth: value.dateOfBirth,
				gender: value.gender as "boy" | "girl" | "other",
				email: value.email || null,
				phone: value.phone || null,
				address: value.address || null,
				emergencyContactName: value.emergencyContactName || null,
				emergencyContactNumber: value.emergencyContactNumber || null,
				relation: value.relation || null,
				allergies: value.allergies || null,
				medicalConditions: value.medicalConditions || null,
				medicalHistory: value.medicalHistory || null,
				bloodGroup: value.bloodGroup || null,
				maritalStatus: value.maritalStatus || null,
				image: value.image || null,
				colorCode: value.colorCode || null,
				isActive: value.isActive
			};

			if (isEdit && initialData.id) {
				updateMutation.mutate({ id: initialData.id, values: payload });
			} else {
				createMutation.mutate(payload);
			}
		}
	});

	const { FormTextField, FormSelectField, FormTextareaField, FormColorField, FormSwitchField, FormDateField } =
		useFormFields<PatientFormValues>();

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<Card className='mx-auto w-full max-w-4xl'>
			<CardHeader>
				<CardTitle className='text-left font-bold text-2xl'>{pageTitle}</CardTitle>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className='space-y-6'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<FormTextField
								label='First Name'
								name='firstName'
								placeholder='Enter first name'
								required
								validators={{
									onBlur: z.string().min(1, "First name is required")
								}}
							/>

							<FormTextField
								label='Last Name'
								name='lastName'
								placeholder='Enter last name'
								required
								validators={{
									onBlur: z.string().min(1, "Last name is required")
								}}
							/>

							<FormDateField
								label='Date of Birth'
								name='dateOfBirth'
								required
								validators={{
									onBlur: z.date({
										error: "Date of birth is required"
									})
								}}
							/>

							<FormSelectField
								label='Gender'
								name='gender'
								options={genderOptions}
								placeholder='Select gender'
								required
								validators={{
									onBlur: z.string().min(1, "Gender is required")
								}}
							/>

							<FormTextField
								label='Email'
								name='email'
								placeholder='patient@example.com'
								type='email'
								validators={{
									onBlur: z.email("Invalid email").optional().or(z.literal(""))
								}}
							/>

							<FormTextField
								label='Phone'
								name='phone'
								placeholder='+20 123 456 7890'
								validators={{
									onBlur: z.string().optional().or(z.literal(""))
								}}
							/>

							<FormSelectField
								label='Blood Group'
								name='bloodGroup'
								options={bloodGroupOptions}
								placeholder='Select blood group'
							/>

							<FormSelectField
								label='Marital Status'
								name='maritalStatus'
								options={maritalStatusOptions}
								placeholder='Select marital status'
							/>

							<FormTextField
								label='Emergency Contact Name'
								name='emergencyContactName'
								placeholder='Full name'
							/>

							<FormTextField
								label='Emergency Contact Number'
								name='emergencyContactNumber'
								placeholder='+20 123 456 7890'
							/>

							<FormSelectField
								label='Relation'
								name='relation'
								options={relationOptions}
								placeholder='Select relation'
							/>

							<FormColorField
								label='Color Code'
								name='colorCode'
								placeholder='#000000'
							/>
						</div>

						<FormTextField
							label='Address'
							name='address'
							placeholder='Enter address'
						/>

						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<FormTextareaField
								label='Allergies'
								name='allergies'
								placeholder='List any allergies'
								rows={2}
							/>

							<FormTextareaField
								label='Medical Conditions'
								name='medicalConditions'
								placeholder='List any medical conditions'
								rows={2}
							/>
						</div>

						<FormTextareaField
							label='Medical History'
							name='medicalHistory'
							placeholder='Detailed medical history'
							rows={3}
						/>

						<FormSwitchField
							description='Enable to make this patient active'
							label='Active Status'
							name='isActive'
						/>

						<div className='flex justify-end gap-2'>
							<Button
								onClick={() => router.history.back()}
								type='button'
								variant='outline'
							>
								Back
							</Button>
							<form.SubmitButton disabled={isPending}>
								{isEdit ? "Update Patient" : "Add Patient"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
