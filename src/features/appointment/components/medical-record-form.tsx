import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createMedicalRecordWithEncounter } from "@/functions";

interface MedicalRecordFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	appointment: {
		id: string;
		patientId: string;
		doctorId: string;
		clinicId: string;
		patient: { firstName: string; lastName: string };
	};
}

export function MedicalRecordForm({ open, onOpenChange, appointment }: MedicalRecordFormProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("diagnosis");
	const [diagnosis, setDiagnosis] = useState("");
	const [symptoms, setSymptoms] = useState("");
	const [treatmentPlan, setTreatmentPlan] = useState("");
	const [notes, setNotes] = useState("");
	const [followUpDate, setFollowUpDate] = useState("");
	const [vitals, setVitals] = useState({
		bodyTemperature: "",
		systolic: "",
		diastolic: "",
		heartRate: "",
		weight: "",
		height: ""
	});
	const [prescriptions, setPrescriptions] = useState([{ drugName: "", dosage: "", frequency: "", duration: "" }]);

	const createMedicalRecord = useMutation({
		mutationFn: async () => {
			const vitalsData = {
				bodyTemperature: vitals.bodyTemperature ? Number.parseFloat(vitals.bodyTemperature) : undefined,
				systolic: vitals.systolic ? Number.parseInt(vitals.systolic, 10) : undefined,
				diastolic: vitals.diastolic ? Number.parseInt(vitals.diastolic, 10) : undefined,
				heartRate: vitals.heartRate ? Number.parseInt(vitals.heartRate, 10) : undefined,
				weight: vitals.weight ? Number.parseFloat(vitals.weight) : undefined,
				height: vitals.height ? Number.parseFloat(vitals.height) : undefined
			};
			return createMedicalRecordWithEncounter({
				data: {
					patientId: appointment.patientId,
					doctorId: appointment.doctorId,
					clinicId: appointment.clinicId,
					appointmentId: appointment.id,
					diagnosis,
					symptoms,
					treatmentPlan,
					vitalSign: Object.values(vitalsData).some(v => v !== undefined) ? vitalsData : undefined,
					prescriptions: prescriptions
						.filter(p => p.drugName)
						.map(p => ({
							medicationName: p.drugName,
							dosageValue: Number.parseFloat(p.dosage) || 0,
							dosageUnit: "mg",
							frequency: p.frequency,
							duration: p.duration
						}))
				}
			});
		},
		onSuccess: () => {
			toast.success("Medical record created successfully");
			onOpenChange(false);
			router.invalidate();
		},
		onError: () => {
			toast.error("Failed to create medical record");
		}
	});

	const addPrescription = () => {
		setPrescriptions([...prescriptions, { drugName: "", dosage: "", frequency: "", duration: "" }]);
	};

	const removePrescription = (index: number) => {
		setPrescriptions(prescriptions.filter((_, i) => i !== index));
	};

	const updatePrescription = (index: number, field: string, value: string) => {
		const updated = [...prescriptions];
		updated[index] = { ...updated[index], [field]: value };
		setPrescriptions(updated);
	};

	const frequencyOptions = [
		"ONCE_DAILY",
		"TWICE_DAILY",
		"THREE_TIMES_DAILY",
		"FOUR_TIMES_DAILY",
		"EVERY_OTHER_DAY",
		"WEEKLY",
		"MONTHLY",
		"AS_NEEDED"
	];

	return (
		<Dialog
			onOpenChange={onOpenChange}
			open={open}
		>
			<DialogContent className='max-h-[90vh] max-w-2xl overflow-auto'>
				<DialogHeader>
					<DialogTitle>Medical Record</DialogTitle>
					<DialogDescription>
						Create medical record for {appointment.patient.firstName} {appointment.patient.lastName}
					</DialogDescription>
				</DialogHeader>

				<Tabs
					onValueChange={setActiveTab}
					value={activeTab}
				>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='diagnosis'>Diagnosis</TabsTrigger>
						<TabsTrigger value='vitals'>Vital Signs</TabsTrigger>
						<TabsTrigger value='prescriptions'>Prescriptions</TabsTrigger>
						<TabsTrigger value='followup'>Follow-up</TabsTrigger>
					</TabsList>

					<TabsContent
						className='space-y-4'
						value='diagnosis'
					>
						<div className='space-y-2'>
							<Label>Diagnosis</Label>
							<Textarea
								onChange={e => setDiagnosis(e.target.value)}
								placeholder='Enter diagnosis...'
								rows={3}
								value={diagnosis}
							/>
						</div>
						<div className='space-y-2'>
							<Label>Symptoms</Label>
							<Textarea
								onChange={e => setSymptoms(e.target.value)}
								placeholder='Enter symptoms...'
								rows={3}
								value={symptoms}
							/>
						</div>
						<div className='space-y-2'>
							<Label>Treatment Plan</Label>
							<Textarea
								onChange={e => setTreatmentPlan(e.target.value)}
								placeholder='Enter treatment plan...'
								rows={3}
								value={treatmentPlan}
							/>
						</div>
					</TabsContent>

					<TabsContent
						className='space-y-4'
						value='vitals'
					>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label>Temperature (°C)</Label>
								<Input
									onChange={e => setVitals({ ...vitals, bodyTemperature: e.target.value })}
									step='0.1'
									type='number'
									value={vitals.bodyTemperature}
								/>
							</div>
							<div className='space-y-2'>
								<Label>Heart Rate (bpm)</Label>
								<Input
									onChange={e => setVitals({ ...vitals, heartRate: e.target.value })}
									type='number'
									value={vitals.heartRate}
								/>
							</div>
							<div className='space-y-2'>
								<Label>Systolic (mmHg)</Label>
								<Input
									onChange={e => setVitals({ ...vitals, systolic: e.target.value })}
									type='number'
									value={vitals.systolic}
								/>
							</div>
							<div className='space-y-2'>
								<Label>Diastolic (mmHg)</Label>
								<Input
									onChange={e => setVitals({ ...vitals, diastolic: e.target.value })}
									type='number'
									value={vitals.diastolic}
								/>
							</div>
							<div className='space-y-2'>
								<Label>Weight (kg)</Label>
								<Input
									onChange={e => setVitals({ ...vitals, weight: e.target.value })}
									step='0.1'
									type='number'
									value={vitals.weight}
								/>
							</div>
							<div className='space-y-2'>
								<Label>Height (cm)</Label>
								<Input
									onChange={e => setVitals({ ...vitals, height: e.target.value })}
									step='0.1'
									type='number'
									value={vitals.height}
								/>
							</div>
						</div>
					</TabsContent>

					<TabsContent
						className='space-y-4'
						value='prescriptions'
					>
						{prescriptions.map((prescription, index) => (
							<div
								className='space-y-2 rounded-lg border p-4'
								key={index}
							>
								<div className='flex justify-between'>
									<Label>Prescription {index + 1}</Label>
									{prescriptions.length > 1 && (
										<Button
											onClick={() => removePrescription(index)}
											size='sm'
											variant='ghost'
										>
											Remove
										</Button>
									)}
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<Input
										onChange={e => updatePrescription(index, "drugName", e.target.value)}
										placeholder='Drug name'
										value={prescription.drugName}
									/>
									<Input
										onChange={e => updatePrescription(index, "dosage", e.target.value)}
										placeholder='Dosage'
										value={prescription.dosage}
									/>
									<Select
										onValueChange={v => updatePrescription(index, "frequency", v)}
										value={prescription.frequency}
									>
										<SelectTrigger>
											<SelectValue placeholder='Frequency' />
										</SelectTrigger>
										<SelectContent>
											{frequencyOptions.map(opt => (
												<SelectItem
													key={opt}
													value={opt}
												>
													{opt.replace(/_/g, " ").toLowerCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										onChange={e => updatePrescription(index, "duration", e.target.value)}
										placeholder='Duration (e.g., 7 days)'
										value={prescription.duration}
									/>
								</div>
							</div>
						))}
						<Button
							className='w-full'
							onClick={addPrescription}
							variant='outline'
						>
							+ Add Prescription
						</Button>
					</TabsContent>

					<TabsContent
						className='space-y-4'
						value='followup'
					>
						<div className='space-y-2'>
							<Label>Follow-up Date</Label>
							<Input
								onChange={e => setFollowUpDate(e.target.value)}
								type='date'
								value={followUpDate}
							/>
						</div>
						<div className='space-y-2'>
							<Label>Additional Notes</Label>
							<Textarea
								onChange={e => setNotes(e.target.value)}
								placeholder='Enter any additional notes...'
								rows={4}
								value={notes}
							/>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button
						onClick={() => onOpenChange(false)}
						variant='outline'
					>
						Cancel
					</Button>
					<Button
						disabled={createMedicalRecord.isPending}
						onClick={() => createMedicalRecord.mutate()}
					>
						Save Medical Record
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
