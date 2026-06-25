// features/encounters/components/EncounterForm.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { getDoctorsQueryOptions } from "@/features/doctors/api/queries";
import { getPatientsQueryOptions } from "@/features/patients/api/queries";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { createEncounterMutation, updateEncounterMutation } from "../api/mutations";
import type { Encounter, EncounterMutationPayload } from "../api/type";
import {
	diagnosisStatusOptions,
	encounterStatusOptions,
	encounterTypeOptions,
	frequencyOptions
} from "../constants/encounter-options";

type EncounterFormValues = z.infer<typeof DiagnosisCreateSchema>;

interface EncounterFormProps {
	initialData: Encounter | null;
	pageTitle: string;
	patientId?: string;
}

export function EncounterForm({ initialData, pageTitle, patientId: initialPatientId }: EncounterFormProps) {
	const router = useRouter();
	const isEdit = !!initialData;
	const clinicId = "current-clinic-id";

	const [activeTab, setActiveTab] = useState("information");
	const [diagnoses, setDiagnoses] = useState<Array<{ description: string; isPrimary: boolean; status: string }>>(
		initialData?.diagnoses || [{ description: "", isPrimary: false, status: "ACTIVE" }]
	);
	const [prescriptions, setPrescriptions] = useState<
		Array<{
			medicationName: string;
			dosageValue: number;
			dosageUnit: string;
			frequency: string;
			duration: string;
			instructions: string;
		}>
	>(() => {
		const initialPrescriptions = initialData?.prescriptions?.map(p => ({
			...p,
			instructions: p.instructions ?? ""
		})) || [
			{
				medicationName: "",
				dosageValue: 0,
				dosageUnit: "mg",
				frequency: "ONCE_DAILY",
				duration: "7 days",
				instructions: ""
			}
		];
		return initialPrescriptions;
	});

	// Fetch dropdown data
	const { data: patientsData } = useSuspenseQuery(getPatientsQueryOptions({ clinicId, limit: 100 }));
	const { data: doctorsData } = useSuspenseQuery(getDoctorsQueryOptions({ limit: 100 }));

	const patients = patientsData?.patients || [];
	const doctors = doctorsData?.doctors || [];

	const patientOptions = patients
		.filter((patient): patient is typeof patient & { id: string } => !!patient.id)
		.map(patient => ({
			value: patient.id,
			label: `${patient.firstName} ${patient.lastName}${patient.mrn ? ` (${patient.mrn})` : ""}`
		}));

	const doctorOptions = doctors
		.filter((doctor): doctor is typeof doctor & { id: string } => !!doctor.id)
		.map(doctor => ({
			value: doctor.id,
			label: `Dr. ${doctor.name}${doctor.specialty ? ` - ${doctor.specialty}` : ""}`
		}));

	const createMutation = useMutation({
		...createEncounterMutation,
		onSuccess: () => {
			toast.success("Encounter created successfully");
			router.navigate({ to: "/auth/dashboard/encounters" });
		},
		onError: () => {
			toast.error("Failed to create encounter");
		}
	});

	const updateMutation = useMutation({
		...updateEncounterMutation,
		onSuccess: () => {
			toast.success("Encounter updated successfully");
			router.navigate({ to: "/auth/dashboard/encounters" });
		},
		onError: () => {
			toast.error("Failed to update encounter");
		}
	});

	const form = useAppForm({
		defaultValues: {
			patientId: initialData?.patientId || initialPatientId || "",
			doctorId: initialData?.doctorId || "",
			appointmentId: initialData?.appointmentId ?? null,
			encounterDate: initialData?.date ? new Date(initialData.date) : new Date(),
			type: initialData?.type || "CONSULTATION",
			status: initialData?.status || "PENDING",
			chiefComplaint: initialData?.symptoms || "",
			historyOfPresentIllness: initialData?.notes || "",
			diagnosis: initialData?.diagnoses?.[0]?.description || "",
			treatmentPlan: initialData?.treatment || "",
			notes: initialData?.notes || "",
			followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate) : undefined,
			durationMinutes: initialData?.durationMinutes || 30
		} as unknown as EncounterFormValues,
		validators: {
			onSubmit: DiagnosisCreateSchema
		},
		onSubmit: ({ value }) => {
			const payload: EncounterMutationPayload = {
				...value,
				medicalId: value.medicalId,
				clinicId,
				type: value.type ?? "CONSULTATION",
				status: value.status ?? "PENDING",
				durationMinutes: value.duration ?? 30,
				encounterDate: value.date ?? new Date(),
				followUpDate: value.followUpDate
			};

			if (isEdit && initialData) {
				updateMutation.mutate({ id: initialData.id, values: payload });
			} else {
				createMutation.mutate(payload);
			}
		}
	});

	const { FormTextField, FormSelectField, FormTextareaField, FormDateField } = useFormFields<EncounterFormValues>();

	const isPending = createMutation.isPending || updateMutation.isPending;

	const addDiagnosis = () => {
		setDiagnoses([...diagnoses, { description: "", isPrimary: false, status: "ACTIVE" }]);
	};

	const removeDiagnosis = (index: number) => {
		setDiagnoses(diagnoses.filter((_, i) => i !== index));
	};

	const updateDiagnosis = (index: number, field: string, value: string | boolean) => {
		const updated = [...diagnoses];
		updated[index] = { ...updated[index], [field]: value };
		setDiagnoses(updated);
	};

	const addPrescription = () => {
		setPrescriptions([
			...prescriptions,
			{
				medicationName: "",
				dosageValue: 0,
				dosageUnit: "mg",
				frequency: "ONCE_DAILY",
				duration: "7 days",
				instructions: ""
			}
		]);
	};

	const removePrescription = (index: number) => {
		setPrescriptions(prescriptions.filter((_, i) => i !== index));
	};

	const updatePrescription = (index: number, field: string, value: string | number) => {
		const updated = [...prescriptions];
		updated[index] = { ...updated[index], [field]: value };
		setPrescriptions(updated);
	};

	return (
		<Card className='mx-auto w-full max-w-4xl'>
			<CardHeader>
				<CardTitle className='text-left font-bold text-2xl'>{pageTitle}</CardTitle>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className='space-y-6'>
						<Tabs
							onValueChange={setActiveTab}
							value={activeTab}
						>
							<TabsList className='grid w-full grid-cols-4'>
								<TabsTrigger value='information'>Information</TabsTrigger>
								<TabsTrigger value='diagnosis'>Diagnosis</TabsTrigger>
								<TabsTrigger value='prescriptions'>Prescriptions</TabsTrigger>
								<TabsTrigger value='followup'>Follow-up</TabsTrigger>
							</TabsList>

							<TabsContent
								className='space-y-6 pt-4'
								value='information'
							>
								<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
									<FormSelectField
										disabled={!!initialPatientId}
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
										name='doctorId'
										options={doctorOptions}
										placeholder='Select doctor'
										required
										validators={{
											onBlur: z.string().min(1, "Please select a doctor")
										}}
									/>
								</div>

								<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
									<FormDateField
										label='Encounter Date'
										name='date'
										required
									/>

									<FormSelectField
										label='Type'
										name='type'
										options={encounterTypeOptions}
										placeholder='Select type'
										required
									/>

									<FormSelectField
										label='Status'
										name='status'
										options={encounterStatusOptions}
										placeholder='Select status'
										required
									/>

									<FormTextField
										label='Appointment ID (Optional)'
										name='appointmentId'
										placeholder='Enter appointment ID'
									/>
								</div>

								<FormTextareaField
									label='Chief Complaint'
									name='symptoms'
									placeholder='What brings the patient in today?'
									rows={2}
								/>

								<FormTextareaField
									label='History of Present Illness'
									name='notes'
									placeholder='Detailed history of the current condition...'
									rows={4}
								/>
							</TabsContent>

							<TabsContent
								className='space-y-6 pt-4'
								value='diagnosis'
							>
								<FormTextareaField
									label='Diagnosis Summary'
									name='diagnosis'
									placeholder='Primary diagnosis summary'
									rows={2}
								/>

								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h4 className='font-semibold'>Detailed Diagnoses</h4>
										<Button
											onClick={addDiagnosis}
											size='sm'
											variant='outline'
										>
											+ Add Diagnosis
										</Button>
									</div>

									{diagnoses.map((diagnosis, index) => (
										<div
											className='rounded-lg border p-4'
											key={index}
										>
											<div className='flex justify-between'>
												<h5 className='font-medium'>Diagnosis {index + 1}</h5>
												{diagnoses.length > 1 && (
													<Button
														className='text-destructive'
														onClick={() => removeDiagnosis(index)}
														size='sm'
														variant='ghost'
													>
														Remove
													</Button>
												)}
											</div>
											<div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-3'>
												<input
													className='col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm'
													onChange={e =>
														updateDiagnosis(index, "description", e.target.value)
													}
													placeholder='Diagnosis description'
													value={diagnosis.description}
												/>
												<select
													className='rounded-md border border-input bg-background px-3 py-2 text-sm'
													onChange={e => updateDiagnosis(index, "status", e.target.value)}
													value={diagnosis.status}
												>
													{diagnosisStatusOptions.map(opt => (
														<option
															key={opt.value}
															value={opt.value}
														>
															{opt.label}
														</option>
													))}
												</select>
											</div>
											<div className='mt-2 flex items-center gap-2'>
												<input
													checked={diagnosis.isPrimary}
													onChange={e =>
														updateDiagnosis(index, "isPrimary", e.target.checked)
													}
													type='checkbox'
												/>
												<label
													className='text-sm'
													htmlFor={`diagnosis-${index}-isPrimary`}
												>
													Primary Diagnosis
												</label>
											</div>
										</div>
									))}
								</div>

								<FormTextareaField
									label='Treatment Plan'
									name='treatment'
									placeholder='Detailed treatment plan...'
									rows={4}
								/>
							</TabsContent>

							<TabsContent
								className='space-y-6 pt-4'
								value='prescriptions'
							>
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h4 className='font-semibold'>Prescriptions</h4>
										<Button
											onClick={addPrescription}
											size='sm'
											variant='outline'
										>
											+ Add Prescription
										</Button>
									</div>

									{prescriptions.map((prescription, index) => (
										<div
											className='rounded-lg border p-4'
											key={index}
										>
											<div className='flex justify-between'>
												<h5 className='font-medium'>Prescription {index + 1}</h5>
												{prescriptions.length > 1 && (
													<Button
														className='text-destructive'
														onClick={() => removePrescription(index)}
														size='sm'
														variant='ghost'
													>
														Remove
													</Button>
												)}
											</div>
											<div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
												<input
													className='rounded-md border border-input bg-background px-3 py-2 text-sm'
													onChange={e =>
														updatePrescription(index, "medicationName", e.target.value)
													}
													placeholder='Medication name'
													value={prescription.medicationName}
												/>
												<div className='flex gap-2'>
													<input
														className='w-20 rounded-md border border-input bg-background px-3 py-2 text-sm'
														onChange={e =>
															updatePrescription(
																index,
																"dosageValue",
																Number.parseFloat(e.target.value) || 0
															)
														}
														placeholder='Dosage'
														type='number'
														value={prescription.dosageValue || ""}
													/>
													<select
														className='w-20 rounded-md border border-input bg-background px-3 py-2 text-sm'
														onChange={e =>
															updatePrescription(index, "dosageUnit", e.target.value)
														}
														value={prescription.dosageUnit}
													>
														<option value='mg'>mg</option>
														<option value='mcg'>mcg</option>
														<option value='g'>g</option>
														<option value='ml'>ml</option>
														<option value='IU'>IU</option>
													</select>
												</div>
												<select
													className='rounded-md border border-input bg-background px-3 py-2 text-sm'
													onChange={e =>
														updatePrescription(index, "frequency", e.target.value)
													}
													value={prescription.frequency}
												>
													{frequencyOptions.map(opt => (
														<option
															key={opt.value}
															value={opt.value}
														>
															{opt.label}
														</option>
													))}
												</select>
												<input
													className='rounded-md border border-input bg-background px-3 py-2 text-sm'
													onChange={e =>
														updatePrescription(index, "duration", e.target.value)
													}
													placeholder='Duration (e.g., 7 days)'
													value={prescription.duration}
												/>
											</div>
											<textarea
												className='mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
												onChange={e =>
													updatePrescription(index, "instructions", e.target.value)
												}
												placeholder='Additional instructions'
												rows={2}
												value={prescription.instructions || ""}
											/>
										</div>
									))}
								</div>
							</TabsContent>

							<TabsContent
								className='space-y-6 pt-4'
								value='followup'
							>
								<FormDateField
									label='Follow-up Date'
									name='followUpDate'
								/>

								<FormTextareaField
									label='Notes'
									name='notes'
									placeholder='Additional notes...'
									rows={4}
								/>
							</TabsContent>
						</Tabs>

						<div className='flex justify-end gap-2 border-t pt-4'>
							<Button
								onClick={() => router.history.back()}
								type='button'
								variant='outline'
							>
								Back
							</Button>
							<form.SubmitButton disabled={isPending}>
								{isEdit ? "Update Encounter" : "Create Encounter"}
							</form.SubmitButton>
						</div>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
