import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { getDoctorsQueryOptions } from "@/features/doctors/api/queries";
import { getPatientsQueryOptions } from "@/features/patients/api/queries";
import { getServicesQueryOptions } from "@/features/services/api/queries";
import { createAppointmentMutation, updateAppointmentMutation } from "../api/mutations";
import { getAvailableTimeSlotsQueryOptions } from "../api/queries";
import type { Appointment } from "../api/types";

const appointmentFormSchema = z.object({
	patientId: z.string().min(1, "Please select a patient"),
	doctorId: z.string().min(1, "Please select a doctor"),
	serviceId: z.string().optional(),
	appointmentDate: z.date({ message: "Please select a date" }),
	time: z.string().min(1, "Please select a time"),
	type: z.string().min(1, "Please select an appointment type"),
	reason: z.string().optional(),
	symptoms: z.string().optional(),
	patientName: z.string(),
	doctorName: z.string(),
	note: z.string().optional(),
	appointmentPrice: z.number().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const appointmentTypes = [
	{ value: "CHECKUP", label: "Checkup" },
	{ value: "FOLLOW_UP", label: "Follow-up" },
	{ value: "EMERGENCY", label: "Emergency" },
	{ value: "CONSULTATION", label: "Consultation" },
	{ value: "VACCINATION", label: "Vaccination" },
	{ value: "LAB_TEST", label: "Lab Test" }
];

export default function AppointmentForm({
	initialData,
	pageTitle
}: {
	initialData: Appointment | null;
	pageTitle: string;
}) {
	const router = useRouter();
	const isEdit = !!initialData;
	const clinicId = "current-clinic-id"; // Replace with actual clinic ID from context/auth

	const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(initialData?.doctorId);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		initialData?.appointmentDate ? new Date(initialData.appointmentDate) : undefined
	);

	// Fetch dropdown data
	const { data: patientsData } = useSuspenseQuery(getPatientsQueryOptions({ clinicId, limit: 100 }));
	const { data: doctorsData } = useSuspenseQuery(getDoctorsQueryOptions({ limit: 100 }));
	const { data: servicesData } = useSuspenseQuery(getServicesQueryOptions({ clinicId, isAvailable: true }));

	// FIX: Added clinicId to the query options
	const { data: availableSlots, isFetching: isFetchingSlots } = useSuspenseQuery(
		getAvailableTimeSlotsQueryOptions({
			doctorId: selectedDoctor || "",
			date: selectedDate || new Date(),
			durationMinutes: 30,
			clinicId
		})
	);

	const createMutation = useMutation({
		...createAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment created successfully");
			router.navigate({ to: "/auth/dashboard/appointments" });
		},
		onError: () => {
			toast.error("Failed to create appointment");
		}
	});

	const updateMutation = useMutation({
		...updateAppointmentMutation,
		onSuccess: () => {
			toast.success("Appointment updated successfully");
			router.navigate({ to: "/auth/dashboard/appointments" });
		},
		onError: () => {
			toast.error("Failed to update appointment");
		}
	});

	const form = useAppForm({
		defaultValues: {
			patientId: initialData?.patientId ?? "",
			doctorId: initialData?.doctorId ?? "",
			serviceId: initialData?.serviceId ?? "",
			appointmentDate: initialData?.appointmentDate ? new Date(initialData.appointmentDate) : new Date(),
			time: initialData?.time ?? "",
			type: initialData?.type ?? "",
			reason: initialData?.reason ?? "",
			symptoms: initialData?.symptoms ?? "",
			note: initialData?.note ?? "",
			appointmentPrice: initialData?.appointmentPrice
		} as AppointmentFormValues,
		validators: {
			onSubmit: appointmentFormSchema
		},
		onSubmit: ({ value }) => {
			const selectedPatient = patients.find(p => p.id === value.patientId);
			const patientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "";

			const selectedDoctorObj = doctors.find(d => d.id === value.doctorId);
			const doctorName = selectedDoctorObj ? selectedDoctorObj.name : "";

			const payload = {
				patientId: value.patientId,
				doctorId: value.doctorId,
				clinicId,
				serviceId: value.serviceId,
				appointmentDate: value.appointmentDate,
				time: value.time,
				type: value.type,
				reason: value.reason,
				note: value.note,
				symptoms: value.symptoms,
				appointmentPrice: value.appointmentPrice,
				patientName,
				doctorName
			};

			if (isEdit && initialData) {
				updateMutation.mutate({
					id: initialData.id,
					data: payload,
					clinicId
				});
			} else {
				createMutation.mutate(payload);
			}
		}
	});

	const { FormSelectField, FormTextField, FormTextareaField } = useFormFields<AppointmentFormValues>();

	// FIX: Extract the data arrays with proper typing
	const patients = (patientsData?.patients || []) as Array<{
		id: string;
		firstName: string;
		lastName: string;
		mrn?: string | null;
	}>;

	const doctors = (doctorsData?.doctors || []) as Array<{
		id: string;
		name: string;
		specialty?: string | null;
	}>;

	const services = (servicesData?.services || []) as Array<{
		id: string;
		serviceName: string;
		price: number;
	}>;

	const patientOptions = patients.map(patient => ({
		value: patient.id,
		label: `${patient.firstName} ${patient.lastName}${patient.mrn ? ` (${patient.mrn})` : ""}`
	}));

	const doctorOptions = doctors.map(doctor => ({
		value: doctor.id,
		label: `Dr. ${doctor.name}${doctor.specialty ? ` - ${doctor.specialty}` : ""}`
	}));

	const serviceOptions = services.map(service => ({
		value: service.id,
		label: `${service.serviceName} - $${service.price}`
	}));

	// FIX: Available slots have string startTime/endTime, not Dates
	const timeOptions = (availableSlots || []).map(
		(slot: { startTime: string; endTime: string; available: boolean }) => {
			// Parse the time strings into Date objects for formatting
			const [startHour, startMinute] = slot.startTime.split(":").map(Number);
			const [endHour, endMinute] = slot.endTime.split(":").map(Number);

			const startDate = new Date();
			startDate.setHours(startHour || 0, startMinute || 0, 0, 0);

			const endDate = new Date();
			endDate.setHours(endHour || 0, endMinute || 0, 0, 0);

			const formattedStart = format(startDate, "hh:mm a");
			const formattedEnd = format(endDate, "hh:mm a");

			return {
				value: slot.startTime,
				label: `${formattedStart} - ${formattedEnd}`
			};
		}
	);

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return (
		<Card className='mx-auto w-full'>
			<CardHeader>
				<CardTitle className='text-left font-bold text-2xl'>{pageTitle}</CardTitle>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className='space-y-8'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<FormSelectField
								label='Patient'
								name='patientId'
								options={patientOptions}
								placeholder='Select patient'
								required
								validators={{
									onBlur: z.string().min(1, "Please select a patient")
								}}
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
								validators={{
									onBlur: z.string().min(1, "Please select a doctor")
								}}
							/>
						</div>

						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<form.AppField name='appointmentDate'>
								{field => (
									<field.FieldSet>
										<field.FieldLabel>Appointment Date *</field.FieldLabel>
										<input
											className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
											onChange={e => {
												const date = e.target.value ? new Date(e.target.value) : new Date();
												field.handleChange(date);
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
								placeholder={
									!selectedDoctor
										? "Select a doctor first"
										: !selectedDate
											? "Select a date first"
											: isFetchingSlots
												? "Loading available slots..."
												: timeOptions.length === 0
													? "No available slots"
													: "Select time"
								}
								required
								validators={{
									onBlur: z.string().min(1, "Please select a time")
								}}
							/>
						</div>

						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<FormSelectField
								label='Appointment Type'
								name='type'
								options={appointmentTypes}
								placeholder='Select type'
								required
								validators={{
									onBlur: z.string().min(1, "Please select an appointment type")
								}}
							/>

							<FormSelectField
								label='Service (Optional)'
								name='serviceId'
								options={serviceOptions}
								placeholder='Select service'
							/>

							<FormTextField
								label='Appointment Price'
								min={0}
								name='appointmentPrice'
								placeholder='Enter price'
								step={0.01}
								type='number'
							/>
						</div>

						<FormTextareaField
							label='Reason for Visit'
							name='reason'
							placeholder='Why is the patient visiting?'
							rows={3}
							validators={{
								onBlur: z.string().optional()
							}}
						/>

						<FormTextareaField
							label='Symptoms'
							name='symptoms'
							placeholder='Describe any symptoms'
							rows={3}
						/>

						<FormTextareaField
							label='Internal Notes'
							name='note'
							placeholder='Additional notes for staff'
							rows={2}
						/>

						<div className='flex justify-end gap-2'>
							<Button
								onClick={() => router.history.back()}
								type='button'
								variant='outline'
							>
								Back
							</Button>
							<form.SubmitButton disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : isEdit ? "Update Appointment" : "Create Appointment"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
