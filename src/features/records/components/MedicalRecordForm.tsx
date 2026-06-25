import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { MedicalRecordCreateSchema } from "@/db/zod";
import { createMedicalRecordMutation, updateMedicalRecordMutation } from "../api/mutations";
import type { MedicalRecord, MedicalRecordMutationPayload } from "../api/types";

// import { createMedicalRecordSchema } from "../schemas";

type MedicalRecordFormValues = z.infer<typeof MedicalRecordCreateSchema>;

interface MedicalRecordFormProps {
	initialData: MedicalRecord | null;
	pageTitle: string;
	patientId?: string;
}

export function MedicalRecordForm({ initialData, pageTitle, patientId }: MedicalRecordFormProps) {
	const router = useRouter();
	const isEdit = !!initialData;

	const createMutation = useMutation({
		...createMedicalRecordMutation,
		onSuccess: () => {
			toast.success("Medical record created successfully");
			router.navigate({ to: "/auth/dashboard/medical-records" });
		},
		onError: () => {
			toast.error("Failed to create medical record");
		}
	});

	const updateMutation = useMutation({
		...updateMedicalRecordMutation,
		onSuccess: () => {
			toast.success("Medical record updated successfully");
			router.navigate({
				to: "/auth/dashboard/medical-records/$recordId",
				params: { recordId: initialData?.id || "" }
			});
		},
		onError: () => {
			toast.error("Failed to update medical record");
		}
	});

	const form = useAppForm({
		defaultValues: {
			patientId: initialData?.patientId || patientId || "",
			doctorId: initialData?.doctorId || "",
			appointmentId: initialData?.appointmentId || "",
			diagnosis: initialData?.diagnosis || "",
			symptoms: initialData?.symptoms || "",
			treatmentPlan: initialData?.treatmentPlan || "",
			labRequest: initialData?.labRequest || "",
			medications: initialData?.medications || "",
			notes: initialData?.notes || "",
			attachments: initialData?.attachments || "",
			diagnosisDate: initialData?.diagnosisDate ? new Date(initialData.diagnosisDate) : undefined,
			followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate) : undefined,
			status: initialData?.status || "ACTIVE"
		} as MedicalRecordFormValues,
		validators: {
			onSubmit: MedicalRecordCreateSchema
		},
		onSubmit: ({ value }) => {
			const payload: MedicalRecordMutationPayload = {
				patientId: value.patientId,
				doctorId: value.doctorId,
				clinicId: "current-clinic-id", // Replace with actual clinic ID
				appointmentId: value.appointmentId,
				diagnosis: value.diagnosis,
				symptoms: value.symptoms,
				treatmentPlan: value.treatmentPlan,
				labRequest: value.labRequest,
				medications: value.medications,
				notes: value.notes,
				attachments: value.attachments,
				diagnosisDate: value.diagnosisDate || new Date(),
				followUpDate: value.followUpDate,
				status: value.status as "ACTIVE" | "INACTIVE" | "ARCHIVED"
			};

			if (isEdit && initialData.id) {
				updateMutation.mutate({ id: initialData.id, values: payload });
			} else {
				createMutation.mutate(payload);
			}
		}
	});

	const { FormTextField, FormSelectField, FormTextareaField, FormDateField } =
		useFormFields<MedicalRecordFormValues>();

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
								disabled={!!patientId}
								label='Patient ID'
								name='patientId'
								placeholder='Enter patient ID'
								required
								validators={{
									onBlur: z.string().min(1, "Patient ID is required")
								}}
							/>
							<FormTextField
								label='Doctor ID'
								name='doctorId'
								placeholder='Enter doctor ID'
								required
								validators={{
									onBlur: z.string().min(1, "Doctor ID is required")
								}}
							/>
							<FormTextField
								label='Appointment ID'
								name='appointmentId'
								placeholder='Enter appointment ID'
							/>
							<FormSelectField
								label='Status'
								name='status'
								options={[
									{ value: "ACTIVE", label: "Active" },
									{ value: "INACTIVE", label: "Inactive" },
									{ value: "ARCHIVED", label: "Archived" }
								]}
								placeholder='Select status'
							/>
							<FormDateField
								label='Diagnosis Date'
								name='diagnosisDate'
								required
							/>
							<FormDateField
								label='Follow-up Date'
								name='followUpDate'
							/>
						</div>

						<FormTextField
							label='Diagnosis'
							name='diagnosis'
							placeholder='Enter diagnosis'
							required
							validators={{
								onBlur: z.string().min(1, "Diagnosis is required")
							}}
						/>
						<FormTextareaField
							label='Symptoms'
							name='symptoms'
							placeholder='Describe symptoms'
							rows={3}
						/>
						<FormTextareaField
							label='Treatment Plan'
							name='treatmentPlan'
							placeholder='Describe the treatment plan'
							rows={4}
						/>
						<FormTextField
							label='Medications'
							name='medications'
							placeholder='List prescribed medications'
						/>
						<FormTextField
							label='Lab Request'
							name='labRequest'
							placeholder='List lab tests requested'
						/>
						<FormTextareaField
							label='Notes'
							name='notes'
							placeholder='Additional notes'
							rows={3}
						/>
						<FormTextField
							label='Attachments'
							name='attachments'
							placeholder='File paths or references'
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
								{isEdit ? "Update Record" : "Create Record"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
