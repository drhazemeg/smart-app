import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { getDoctorsQueryOptions } from "@/features/doctors/api/queries";
import { getPatientsQueryOptions } from "@/features/patients/api/queries";
import { getServicesQueryOptions } from "@/features/services/api/queries";
import type { Service } from "../../../db";
import { createAppointmentMutation } from "../api/mutations";
import { getAvailableTimeSlotsQueryOptions } from "../api/queries";

const appointmentFormSchema = z.object({
	patientId: z.string().min(1, "Please select a patient"),
	doctorId: z.string().min(1, "Please select a doctor"),
	patientName: z.string(),
	doctorName: z.string(),
	serviceId: z.string().nullable(),
	appointmentDate: z.date(),
	time: z.string().min(1, "Please select a time"),
	type: z.string().min(1, "Please select an appointment type"),
	reason: z.string().optional(),
	symptoms: z.string().optional(),
	note: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface CreateAppointmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const appointmentTypes = [
	{ value: "CHECKUP", label: "Checkup" },
	{ value: "FOLLOW_UP", label: "Follow-up" },
	{ value: "EMERGENCY", label: "Emergency" },
	{ value: "CONSULTATION", label: "Consultation" },
	{ value: "VACCINATION", label: "Vaccination" },
	{ value: "LAB_TEST", label: "Lab Test" }
];

export function CreateAppointmentDialog({ open, onOpenChange }: CreateAppointmentDialogProps) {
	const router = useRouter();
	const clinicId = "current-clinic-id";
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);

	const { data: patients } = useSuspenseQuery(getPatientsQueryOptions({ clinicId, limit: 100 }));
	const { data: doctors } = useSuspenseQuery(getDoctorsQueryOptions({ limit: 100 }));
	const { data: services } = useSuspenseQuery(getServicesQueryOptions({ clinicId, isAvailable: true }));

	const { data: availableSlots } = useQuery({
		...getAvailableTimeSlotsQueryOptions({
			doctorId: selectedDoctor || "",
			date: selectedDate || new Date(),
			durationMinutes: 30,
			clinicId
		}),
		enabled: !!selectedDoctor && !!selectedDate
	});

	const createMutation = useMutation({
		...createAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment created successfully");
			onOpenChange(false);
			form.reset();
			router.invalidate();
		},
		onError: () => {
			toast.error("Failed to create appointment");
		}
	});

	const form = useAppForm({
		defaultValues: {
			patientId: "",
			doctorId: "",
			serviceId: "",
			appointmentDate: new Date(),
			time: "",
			type: "",
			reason: "",
			patientName: "",
			doctorName: "",
			symptoms: "",
			note: ""
		} as AppointmentFormValues,
		validators: {
			onSubmit: appointmentFormSchema
		},
		onSubmit: ({ value }) => {
			createMutation.mutate({ ...value, clinicId });
		}
	});

	const { FormSelectField, FormTextareaField } = useFormFields<AppointmentFormValues>();

	const patientOptions = patients.patients.map(p => ({
		value: p.id || "",
		label: `${p.firstName} ${p.lastName}${p.mrn ? ` (${p.mrn})` : ""}`
	}));

	const doctorOptions = doctors.doctors.map(d => ({
		value: d.id || "",
		label: `Dr. ${d.name}${d.specialty ? ` - ${d.specialty}` : ""}`
	}));

	const serviceOptions = services.services.map((s: Service) => ({
		value: s.id,
		label: `${s.serviceName} - $${s.price}`
	}));

	const timeOptions = (availableSlots || []).map(slot => ({
		value: slot.startTime,
		label: `${slot.startTime} - ${slot.endTime}`
	}));

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent className='max-h-[90vh] max-w-2xl overflow-auto'>
				<DialogHeader>
					<DialogTitle>New Appointment</DialogTitle>
					<DialogDescription>Schedule a new appointment for a patient.</DialogDescription>
				</DialogHeader>

				<form.AppForm>
					<form.Form className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<FormSelectField
								label='Patient'
								name='patientId'
								options={patientOptions}
								placeholder='Select patient'
								required
							/>

							<FormSelectField
								label='Doctor'
								listeners={{
									onChange: ({ value }) => {
										setSelectedDoctor(value as string);
										form.setFieldValue("time", "");
									}
								}}
								name='doctorId'
								options={doctorOptions}
								placeholder='Select doctor'
								required
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<form.AppField name='appointmentDate'>
								{field => (
									<field.FieldSet>
										<field.FieldLabel>Date *</field.FieldLabel>
										<input
											className='w-full rounded-md border p-2'
											onChange={e => {
												const date = e.target.value ? new Date(e.target.value) : undefined;
												field.handleChange(date ?? new Date());
												setSelectedDate(date);
												form.setFieldValue("time", "");
											}}
											type='date'
											value={field.state.value ? format(field.state.value, "yyyy-MM-dd") : ""}
										/>
										<field.FieldError />
									</field.FieldSet>
								)}
							</form.AppField>

							<FormSelectField
								disabled={!selectedDoctor || !selectedDate || timeOptions.length === 0}
								label='Time'
								name='time'
								options={timeOptions}
								placeholder='Select time'
								required
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<FormSelectField
								label='Appointment Type'
								name='type'
								options={appointmentTypes}
								placeholder='Select type'
								required
							/>

							<FormSelectField
								label='Service'
								name='serviceId'
								options={serviceOptions}
								placeholder='Select service (optional)'
							/>
						</div>

						<FormTextareaField
							label='Reason'
							name='reason'
							placeholder='Why is the patient visiting?'
							rows={2}
						/>

						<FormTextareaField
							label='Symptoms'
							name='symptoms'
							placeholder='Describe any symptoms'
							rows={2}
						/>

						<FormTextareaField
							label='Internal Notes'
							name='note'
							placeholder='Additional notes for staff'
							rows={2}
						/>

						<DialogFooter>
							<Button
								onClick={() => onOpenChange(false)}
								type='button'
								variant='outline'
							>
								Cancel
							</Button>
							<form.SubmitButton disabled={createMutation.isPending}>
								Create Appointment
							</form.SubmitButton>
						</DialogFooter>
					</form.Form>
				</form.AppForm>
			</DialogContent>
		</Dialog>
	);
}
