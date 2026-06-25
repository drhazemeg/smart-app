import type { account, session, user } from "./auth";
import type {
	adverseEvent,
	appointment,
	clinic,
	clinicMember,
	clinicSetting,
	developmentalMilestones,
	diagnosis,
	doctor,
	doseGuideline,
	drug,
	feedingLog,
	growthAlert,
	growthChartCache,
	growthPercentileHistory,
	guardian,
	immunization,
	importBatch,
	labTest,
	lmsReference,
	measurement,
	medicalRecord,
	medicationDispense,
	notification,
	patient,
	patientBill,
	patientGuardian,
	payment,
	prescribedItem,
	prescription,
	prescriptionLog,
	service,
	staff,
	vaccineInventory,
	vaccineSchedule,
	velocityStandard,
	vitalSign,
	workingDay
} from "./clinic";
import type {
	alertSeverityEnum,
	alertTypeEnum,
	appointmentStatusEnum,
	availabilityStatusEnum,
	bloodGroupEnum,
	breastEnum,
	chartTypeEnum,
	doctorTypeEnum,
	drugRouteEnum,
	feedingTypeEnum,
	frequencyEnum,
	genderEnum,
	immunizationStatusEnum,
	importStatusEnum,
	labTestStatusEnum,
	maritalStatusEnum,
	measurementTypeEnum,
	metricEnum,
	notificationPriorityEnum,
	notificationStatusEnum,
	nutritionalClassificationEnum,
	nutritionalStatusEnum,
	paymentMethodEnum,
	paymentStatusEnum,
	prescriptionStatusEnum,
	recordStatusEnum,
	referenceSourceEnum,
	reminderMethodEnum,
	reminderStatusEnum,
	roleEnum,
	severityEnum,
	statusEnum,
	stuntingStatusEnum,
	syncStatusEnum,
	userStatusEnum,
	velocityParameterEnum,
	wastingStatusEnum,
	weekdayEnum
} from "./enum";

// Export types for common tables
export type User = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
export type Clinic = typeof clinic.$inferSelect;
export type InsertClinic = typeof clinic.$inferInsert;
export type Patient = typeof patient.$inferSelect;
export type InsertPatient = typeof patient.$inferInsert;
export type InsertMeasurement = typeof measurement.$inferInsert;
export type LMSReference = typeof lmsReference.$inferSelect;
export type InsertLMSReference = typeof lmsReference.$inferInsert;
export type GrowthAlert = typeof growthAlert.$inferSelect;
export type InsertGrowthAlert = typeof growthAlert.$inferInsert;
export type NewUser = typeof user.$inferInsert;
export type NewSession = typeof session.$inferInsert;
export type NewAccount = typeof account.$inferInsert;
export type NewClinic = typeof clinic.$inferInsert;
export type ClinicMember = typeof clinicMember.$inferSelect;
export type NewClinicMember = typeof clinicMember.$inferInsert;
export type ClinicSetting = typeof clinicSetting.$inferSelect;
export type NewClinicSetting = typeof clinicSetting.$inferInsert;
export type NewPatient = typeof patient.$inferInsert;
export type Guardian = typeof guardian.$inferSelect;
export type NewGuardian = typeof guardian.$inferInsert;
export type PatientGuardian = typeof patientGuardian.$inferSelect;
export type NewPatientGuardian = typeof patientGuardian.$inferInsert;
export type Doctor = typeof doctor.$inferSelect;
export type NewDoctor = typeof doctor.$inferInsert;
export type WorkingDay = typeof workingDay.$inferSelect;
export type NewWorkingDay = typeof workingDay.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type Service = typeof service.$inferSelect;
export type NewService = typeof service.$inferInsert;
export type Appointment = typeof appointment.$inferSelect;
export type NewAppointment = typeof appointment.$inferInsert;
export type MedicalRecord = typeof medicalRecord.$inferSelect;
export type NewMedicalRecord = typeof medicalRecord.$inferInsert;
export type Diagnosis = typeof diagnosis.$inferSelect;
export type NewDiagnosis = typeof diagnosis.$inferInsert;
export type VitalSign = typeof vitalSign.$inferSelect;
export type NewVitalSign = typeof vitalSign.$inferInsert;
export type Drug = typeof drug.$inferSelect;
export type NewDrug = typeof drug.$inferInsert;
export type DoseGuideline = typeof doseGuideline.$inferSelect;
export type NewDoseGuideline = typeof doseGuideline.$inferInsert;
export type Prescription = typeof prescription.$inferSelect;
export type NewPrescription = typeof prescription.$inferInsert;
export type PrescribedItem = typeof prescribedItem.$inferSelect;
export type NewPrescribedItem = typeof prescribedItem.$inferInsert;
export type MedicationDispense = typeof medicationDispense.$inferSelect;
export type NewMedicationDispense = typeof medicationDispense.$inferInsert;
export type PrescriptionLog = typeof prescriptionLog.$inferSelect;
export type NewPrescriptionLog = typeof prescriptionLog.$inferInsert;
export type Measurement = typeof measurement.$inferSelect;
export type NewMeasurement = typeof measurement.$inferInsert;
export type ReminderMethod = (typeof reminderMethodEnum.enumValues)[number];
export type ReminderStatus = (typeof reminderStatusEnum.enumValues)[number];
export type NutritionalStatus = (typeof nutritionalStatusEnum.enumValues)[number];
export type Status = (typeof statusEnum.enumValues)[number];
export type Role = (typeof roleEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
export type RecordStatus = (typeof recordStatusEnum.enumValues)[number];
export type PrescriptionStatus = (typeof prescriptionStatusEnum.enumValues)[number];
export type ImmunizationStatus = (typeof immunizationStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type LabTestStatus = (typeof labTestStatusEnum.enumValues)[number];
export type SyncStatus = (typeof syncStatusEnum.enumValues)[number];
export type BloodGroup = (typeof bloodGroupEnum.enumValues)[number];
export type MaritalStatus = (typeof maritalStatusEnum.enumValues)[number];
export type DoctorType = (typeof doctorTypeEnum.enumValues)[number];
export type AvailabilityStatus = (typeof availabilityStatusEnum.enumValues)[number];
export type Weekday = (typeof weekdayEnum.enumValues)[number];
export type MeasurementType = (typeof measurementTypeEnum.enumValues)[number];
export type ReferenceSource = (typeof referenceSourceEnum.enumValues)[number];
export type NutritionalClassification = (typeof nutritionalClassificationEnum.enumValues)[number];
export type StuntingStatus = (typeof stuntingStatusEnum.enumValues)[number];
export type WastingStatus = (typeof wastingStatusEnum.enumValues)[number];
export type FeedingType = (typeof feedingTypeEnum.enumValues)[number];
export type Breast = (typeof breastEnum.enumValues)[number];
export type DrugRoute = (typeof drugRouteEnum.enumValues)[number];
export type Frequency = (typeof frequencyEnum.enumValues)[number];
export type AlertType = (typeof alertTypeEnum.enumValues)[number];
export type AlertSeverity = (typeof alertSeverityEnum.enumValues)[number];
export type NotificationStatus = (typeof notificationStatusEnum.enumValues)[number];
export type NotificationPriority = (typeof notificationPriorityEnum.enumValues)[number];
export type Severity = (typeof severityEnum.enumValues)[number];
export type ImportStatus = (typeof importStatusEnum.enumValues)[number];
export type ChartType = (typeof chartTypeEnum.enumValues)[number];
export type Metric = (typeof metricEnum.enumValues)[number];
export type VelocityParameter = (typeof velocityParameterEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type NewNotification = typeof notification.$inferInsert;
export type NewGrowthAlert = typeof growthAlert.$inferInsert;
export type NewGrowthChartCache = typeof growthChartCache.$inferInsert;
export type NewGrowthPercentileHistory = typeof growthPercentileHistory.$inferInsert;
export type NewVelocityStandard = typeof velocityStandard.$inferInsert;
export type NewImportBatch = typeof importBatch.$inferInsert;
export type NewPayment = typeof payment.$inferInsert;
export type NewPatientBill = typeof patientBill.$inferInsert;
export type NewLabTest = typeof labTest.$inferInsert;
export type NewFeedingLog = typeof feedingLog.$inferInsert;
export type NewVaccineSchedule = typeof vaccineSchedule.$inferInsert;
export type NewVaccineInventory = typeof vaccineInventory.$inferInsert;
export type NewImmunization = typeof immunization.$inferInsert;
export type NewAdverseEvent = typeof adverseEvent.$inferInsert;
export type NewDevelopmentalMilestones = typeof developmentalMilestones.$inferInsert;
export type Slot = {
	startTime: string;
	endTime: string;
	isAvailable: boolean;
};
export type PatientSelect = {
	id: string;
	firstName: string;
	lastName: string;
	mrn: string | null;
	dateOfBirth: Date;
	gender: "boy" | "girl" | "other";
	isActive: boolean;
};
