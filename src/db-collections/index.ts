import { createCollection, localOnlyCollectionOptions } from "@tanstack/react-db";
import { z } from "zod";
import {
	AdverseEventSchema,
	AppointmentSchema,
	ClinicMemberSchema,
	ClinicSchema,
	ClinicSettingSchema,
	DevelopmentalMilestonesSchema,
	DiagnosisSchema,
	DoctorSchema,
	DoseGuidelineSchema,
	DrugSchema,
	FeedingLogSchema,
	GuardianSchema,
	ImmunizationSchema,
	LabTestSchema,
	MedicalRecordSchema,
	MedicationDispenseSchema,
	NotificationSchema,
	PatientBillSchema,
	PatientSchema,
	PaymentSchema,
	PrescribedItemSchema,
	PrescriptionLogSchema,
	PrescriptionSchema,
	ServiceSchema,
	StaffSchema,
	VaccineInventorySchema,
	VaccineScheduleSchema,
	VitalSignSchema,
	WorkingDaySchema
} from "#/db/zod";

const MessageSchema = z.object({
	id: z.number(),
	text: z.string(),
	user: z.string()
});

export type Message = z.infer<typeof MessageSchema>;

export const messagesCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: message => message.id,
		schema: MessageSchema
	})
);

export type Clinic = z.infer<typeof ClinicSchema>;
export const clinicCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: clinic => clinic.id,
		schema: ClinicSchema
	})
);
export type ClinicMember = z.infer<typeof ClinicMemberSchema>;
export const clinicMemberCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: clinicMember => clinicMember.userId,
		schema: ClinicMemberSchema
	})
);
export type ClinicSetting = z.infer<typeof ClinicSettingSchema>;
export const clinicSettingCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: clinicSetting => clinicSetting.id,
		schema: ClinicSettingSchema
	})
);
export type Doctor = z.infer<typeof DoctorSchema>;
export const doctorCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: doctor => doctor.id,
		schema: DoctorSchema
	})
);
export type Staff = z.infer<typeof StaffSchema>;
export const staffCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: staff => staff.id,
		schema: StaffSchema
	})
);
export type WorkingDay = z.infer<typeof WorkingDaySchema>;
export const workingDayCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: workingDay => workingDay.id,
		schema: WorkingDaySchema
	})
);
export type Patient = z.infer<typeof PatientSchema>;
export const patientCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: patient => patient.id,
		schema: PatientSchema
	})
);
export type Guardian = z.infer<typeof GuardianSchema>;
export const guardianCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: guardian => guardian.id,
		schema: GuardianSchema
	})
);
export type Appointment = z.infer<typeof AppointmentSchema>;
export const appointmentCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: appointment => appointment.id,
		schema: AppointmentSchema
	})
);
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export const medicalRecordCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: medicalRecord => medicalRecord.id,
		schema: MedicalRecordSchema
	})
);
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
export const diagnosisCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: diagnosis => diagnosis.id,
		schema: DiagnosisSchema
	})
);
export type VitalSign = z.infer<typeof VitalSignSchema>;
export const vitalSignCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: vitalSign => vitalSign.id,
		schema: VitalSignSchema
	})
);
export type DevelopmentalMilestones = z.infer<typeof DevelopmentalMilestonesSchema>;
export const developmentalMilestonesCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: developmentalMilestones => developmentalMilestones.id,
		schema: DevelopmentalMilestonesSchema
	})
);
export type FeedingLog = z.infer<typeof FeedingLogSchema>;
export const feedingLogCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: feedingLog => feedingLog.id,
		schema: FeedingLogSchema
	})
);
export type Immunization = z.infer<typeof ImmunizationSchema>;
export const immunizationCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: immunization => immunization.id,
		schema: ImmunizationSchema
	})
);
export type VaccineSchedule = z.infer<typeof VaccineScheduleSchema>;
export const vaccineScheduleCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: vaccineSchedule => vaccineSchedule.id,
		schema: VaccineScheduleSchema
	})
);
export type VaccineInventory = z.infer<typeof VaccineInventorySchema>;
export const vaccineInventoryCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: vaccineInventory => vaccineInventory.id,
		schema: VaccineInventorySchema
	})
);
export type AdverseEvent = z.infer<typeof AdverseEventSchema>;
export const adverseEventCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: adverseEvent => adverseEvent.id,
		schema: AdverseEventSchema
	})
);
export type Drug = z.infer<typeof DrugSchema>;
export const drugCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: drug => drug.id,
		schema: DrugSchema
	})
);
export type DoseGuideline = z.infer<typeof DoseGuidelineSchema>;
export const doseGuidelineCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: doseGuideline => doseGuideline.id,
		schema: DoseGuidelineSchema
	})
);
export type Prescription = z.infer<typeof PrescriptionSchema>;
export const prescriptionCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: prescription => prescription.id,
		schema: PrescriptionSchema
	})
);
export type PrescribedItem = z.infer<typeof PrescribedItemSchema>;
export const prescribedItemCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: prescribedItem => prescribedItem.id,
		schema: PrescribedItemSchema
	})
);
export type MedicationDispense = z.infer<typeof MedicationDispenseSchema>;
export const medicationDispenseCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: medicationDispense => medicationDispense.id,
		schema: MedicationDispenseSchema
	})
);
export type PrescriptionLog = z.infer<typeof PrescriptionLogSchema>;
export const prescriptionLogCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: prescriptionLog => prescriptionLog.id,
		schema: PrescriptionLogSchema
	})
);
export type Service = z.infer<typeof ServiceSchema>;
export const serviceCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: service => service.id,
		schema: ServiceSchema
	})
);
export type LabTest = z.infer<typeof LabTestSchema>;
export const labTestCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: labTest => labTest.id,
		schema: LabTestSchema
	})
);
export type Payment = z.infer<typeof PaymentSchema>;
export const paymentCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: payment => payment.id,
		schema: PaymentSchema
	})
);
export type PatientBill = z.infer<typeof PatientBillSchema>;
export const patientBillCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: patientBill => patientBill.id,
		schema: PatientBillSchema
	})
);
export type Notification = z.infer<typeof NotificationSchema>;
export const notificationCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: notification => notification.id,
		schema: NotificationSchema
	})
);
