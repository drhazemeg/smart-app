// products/doctors/components/doctor-form.tsx
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";

import { createDoctorMutation, updateDoctorMutation } from "../api/mutations";
import type { Doctor, DoctorMutationPayload } from "../api/types";
import {
	availabilityStatusOptions,
	departmentOptions,
	doctorTypeOptions,
	specialtyOptions
} from "../constants/doctor-options";
import { createDoctorSchema } from "../schemas";

type DoctorFormValues = Omit<z.input<typeof createDoctorSchema>, "clinicId">;

interface DoctorFormProps {
	initialData: Doctor | null;
	pageTitle: string;
}

export default function DoctorForm({ initialData, pageTitle }: DoctorFormProps) {
	const router = useRouter();
	const isEdit = !!initialData;

	const createMutation = useMutation({
		...createDoctorMutation,
		onSuccess: () => {
			toast.success("Doctor created successfully");
			router.navigate({ to: "/auth/dashboard/doctors" });
		},
		onError: () => {
			toast.error("Failed to create doctor");
		}
	});

	const updateMutation = useMutation({
		...updateDoctorMutation,
		onSuccess: () => {
			toast.success("Doctor updated successfully");
			router.navigate({ to: "/auth/dashboard/doctors" });
		},
		onError: () => {
			toast.error("Failed to update doctor");
		}
	});

	const form = useAppForm({
		defaultValues: {
			name: initialData?.name ?? "",
			specialty: initialData?.specialty ?? "",
			email: initialData?.email ?? "",
			phone: initialData?.phone ?? "",
			address: initialData?.address ?? "",
			department: initialData?.department ?? "",
			licenseNumber: initialData?.licenseNumber ?? "",
			img: initialData?.img ?? "",
			colorCode: initialData?.colorCode ?? "",
			appointmentPrice: initialData?.appointmentPrice ?? undefined,
			yearsOfExperience: initialData?.yearsOfExperience ?? 0,
			availabilityStatus: initialData?.availabilityStatus ?? "AVAILABLE",
			availableFromTime: initialData?.availableFromTime ?? "",
			availableToTime: initialData?.availableToTime ?? "",
			availableFromWeekDay: initialData?.availableFromWeekDay ?? "",
			availableToWeekDay: initialData?.availableToWeekDay ?? "",
			type: initialData?.type ?? "FULL",
			isActive: initialData?.isActive ?? true
		} as DoctorFormValues,
		validators: {
			onSubmit: createDoctorSchema.omit({ clinicId: true })
		},
		onSubmit: ({ value }) => {
			const payload: DoctorMutationPayload = {
				name: value.name,
				specialty: value.specialty,
				email: value.email || null,
				phone: value.phone || null,
				address: value.address || null,
				department: value.department || null,
				licenseNumber: value.licenseNumber || null,
				img: value.img || null,
				colorCode: value.colorCode || null,
				appointmentPrice: value.appointmentPrice || null,
				yearsOfExperience: value.yearsOfExperience || 0,
				availabilityStatus: value.availabilityStatus as "AVAILABLE" | "UNAVAILABLE" | "ON_LEAVE",
				availableFromTime: value.availableFromTime || null,
				availableToTime: value.availableToTime || null,
				availableFromWeekDay: value.availableFromWeekDay || null,
				availableToWeekDay: value.availableToWeekDay || null,
				type: value.type as "FULL" | "PART_TIME" | "CONSULTANT" | "VISITING",
				isActive: value.isActive
			};

			if (isEdit && initialData.id) {
				updateMutation.mutate({ id: initialData.id, values: payload });
			} else {
				createMutation.mutate(payload);
			}
		}
	});

	const { FormTextField, FormSelectField, FormColorField, FormSwitchField } = useFormFields<DoctorFormValues>();

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
								label='Full Name'
								name='name'
								placeholder="Enter doctor's full name"
								required
								validators={{
									onBlur: z.string().min(2, "Name must be at least 2 characters")
								}}
							/>

							<FormSelectField
								label='Specialty'
								name='specialty'
								options={specialtyOptions}
								placeholder='Select specialty'
								required
								validators={{
									onBlur: z.string().min(1, "Please select a specialty")
								}}
							/>

							<FormTextField
								label='Email'
								name='email'
								placeholder='doctor@clinic.com'
								type='email'
								validators={{
									onBlur: z.email("Invalid email format").optional().or(z.literal(""))
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
								label='Department'
								name='department'
								options={departmentOptions}
								placeholder='Select department'
							/>

							<FormTextField
								label='License Number'
								name='licenseNumber'
								placeholder='Enter license number'
							/>

							<FormTextField
								label='Years of Experience'
								min={0}
								name='yearsOfExperience'
								placeholder='0'
								type='number'
								validators={{
									onBlur: z.number().min(0, "Experience must be non-negative")
								}}
							/>

							<FormTextField
								label='Appointment Price ($)'
								min={0}
								name='appointmentPrice'
								placeholder='0'
								step={0.01}
								type='number'
								validators={{
									onBlur: z.number().min(0, "Price must be non-negative").optional()
								}}
							/>

							<FormSelectField
								label='Availability Status'
								name='availabilityStatus'
								options={availabilityStatusOptions}
								placeholder='Select status'
							/>

							<FormSelectField
								label='Doctor Type'
								name='type'
								options={doctorTypeOptions}
								placeholder='Select type'
							/>

							<FormColorField
								label='Color Code'
								name='colorCode'
								placeholder='#000000'
							/>
						</div>

						<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
							<FormSelectField
								label='Available From Day'
								name='availableFromWeekDay'
								options={[
									{ value: "", label: "Not specified" },
									...[
										{ value: "MONDAY", label: "Monday" },
										{ value: "TUESDAY", label: "Tuesday" },
										{ value: "WEDNESDAY", label: "Wednesday" },
										{ value: "THURSDAY", label: "Thursday" },
										{ value: "FRIDAY", label: "Friday" },
										{ value: "SATURDAY", label: "Saturday" },
										{ value: "SUNDAY", label: "Sunday" }
									]
								]}
								placeholder='Select day'
							/>

							<FormTextField
								label='Available From Time'
								name='availableFromTime'
								placeholder='09:00'
								type='time'
							/>

							<FormTextField
								label='Available To Time'
								name='availableToTime'
								placeholder='17:00'
								type='time'
							/>

							<FormSelectField
								label='Available To Day'
								name='availableToWeekDay'
								options={[
									{ value: "", label: "Not specified" },
									...[
										{ value: "MONDAY", label: "Monday" },
										{ value: "TUESDAY", label: "Tuesday" },
										{ value: "WEDNESDAY", label: "Wednesday" },
										{ value: "THURSDAY", label: "Thursday" },
										{ value: "FRIDAY", label: "Friday" },
										{ value: "SATURDAY", label: "Saturday" },
										{ value: "SUNDAY", label: "Sunday" }
									]
								]}
								placeholder='Select day'
							/>
						</div>

						<FormTextField
							label='Address'
							name='address'
							placeholder='Enter address'
						/>

						<FormSwitchField
							description='Enable to make this doctor available for appointments'
							label='Active'
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
								{isEdit ? "Update Doctor" : "Add Doctor"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
