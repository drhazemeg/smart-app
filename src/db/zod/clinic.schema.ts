import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import { z } from "zod";
import {
	adverseEvent,
	appointment,
	appointmentStatusEnum,
	availabilityStatusEnum,
	bloodGroupEnum,
	breastEnum,
	clinic,
	clinicMember,
	clinicSetting,
	configStore,
	developmentalMilestones,
	diagnosis,
	doctor,
	doctorTypeEnum,
	doseGuideline,
	drug,
	drugRouteEnum,
	feedingLog,
	feedingTypeEnum,
	file,
	folder,
	frequencyEnum,
	genderEnum,
	growthAlert,
	growthChartCache,
	growthPercentileHistory,
	guardian,
	immunization,
	immunizationStatusEnum,
	importBatch,
	invite,
	labTest,
	labTestStatusEnum,
	lmsReference,
	maritalStatusEnum,
	measurement,
	measurementTypeEnum,
	medicalRecord,
	medicationDispense,
	notification,
	notificationPriorityEnum,
	notificationStatusEnum,
	nutritionalAssessment,
	nutritionalStatusEnum,
	patient,
	patientBill,
	payment,
	paymentMethodEnum,
	paymentStatusEnum,
	prescribedItem,
	prescription,
	prescriptionLog,
	prescriptionStatusEnum,
	type referenceSourceEnum,
	roleEnum,
	service,
	severityEnum,
	staff,
	statusEnum,
	type syncStatusEnum,
	type twoFactor,
	// user,
	vaccineInventory,
	vaccineSchedule,
	velocityStandard,
	type verification,
	vitalSign,
	weekdayEnum,
	workingDay
} from "../schema";

const REG = /^[0-9]{14}$/;
const REG2 = /^[A-Z]{2,4}[0-9]{6,8}$/;
const REG3 = /^(01[0-9]{9})$|^(\+20[0-9]{10})$/;
// System Schemas
export const FolderSchema = createSelectSchema(folder);
export const FolderCreateSchema = createInsertSchema(folder);
export const FolderUpdateSchema = createUpdateSchema(folder);

export const FileSchema = createSelectSchema(file);
export const FileCreateSchema = createInsertSchema(file);
export const FileUpdateSchema = createUpdateSchema(file);

export const ConfigStoreSchema = createSelectSchema(configStore);
export const ConfigStoreCreateSchema = createInsertSchema(configStore);
export const ConfigStoreUpdateSchema = createUpdateSchema(configStore);

export const InviteSchema = createSelectSchema(invite);
export const InviteCreateSchema = createInsertSchema(invite);
export const InviteUpdateSchema = createUpdateSchema(invite);

// Clinic Management Schemas
export const ClinicSchema = createSelectSchema(clinic);
export const ClinicCreateSchema = createInsertSchema(clinic);
export const ClinicUpdateSchema = createUpdateSchema(clinic);
export type ClinicCreateInput = z.infer<typeof ClinicCreateSchema>;
export type ClinicUpdateInput = z.infer<typeof ClinicUpdateSchema>;

export const ClinicMemberSchema = createSelectSchema(clinicMember);
export const ClinicMemberCreateSchema = createInsertSchema(clinicMember);
export const ClinicMemberUpdateSchema = createUpdateSchema(clinicMember);
export type ClinicMemberCreateInput = z.infer<typeof ClinicMemberCreateSchema>;
export type ClinicMemberUpdateInput = z.infer<typeof ClinicMemberUpdateSchema>;
export const ClinicSettingSchema = createSelectSchema(clinicSetting);
export const ClinicSettingCreateSchema = createInsertSchema(clinicSetting);
export const ClinicSettingUpdateSchema = createUpdateSchema(clinicSetting);

// Staff Schemas
export const DoctorSchema = createSelectSchema(doctor);
export const DoctorCreateSchema = createInsertSchema(doctor);
export const DoctorUpdateSchema = createUpdateSchema(doctor);
export type DoctorCreateInput = z.infer<typeof DoctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof DoctorUpdateSchema>;

export const StaffCreateSchema = createInsertSchema(staff);

export const StaffUpdateSchema = createUpdateSchema(staff);
export type StaffCreateInput = z.infer<typeof StaffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof StaffUpdateSchema>;
export const WorkingDayCreateSchema = createInsertSchema(workingDay);
export const WorkingDayUpdateSchema = createUpdateSchema(workingDay);
export type WorkingDayCreateInput = z.infer<typeof WorkingDayCreateSchema>;
export type WorkingDayUpdateInput = z.infer<typeof WorkingDayUpdateSchema>;
// Patient Schemas
export const PatientSchema = createSelectSchema(patient);
export const PatientCreateSchema = createInsertSchema(patient);
export const PatientUpdateSchema = createUpdateSchema(patient);
export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;

export const GuardianSchema = createSelectSchema(guardian);
export const GuardianCreateSchema = createInsertSchema(guardian);
export const GuardianUpdateSchema = createUpdateSchema(guardian);
export type GuardianCreateInput = z.infer<typeof GuardianCreateSchema>;
export type GuardianUpdateInput = z.infer<typeof GuardianUpdateSchema>;

// Appointment & Medical Schemas
export const AppointmentSchema = createSelectSchema(appointment);
export const AppointmentCreateSchema = createInsertSchema(appointment);
export const AppointmentUpdateSchema = createUpdateSchema(appointment);
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>;
export const MedicalRecordSchema = createSelectSchema(medicalRecord);
export const MedicalRecordCreateSchema = createInsertSchema(medicalRecord);
export const MedicalRecordUpdateSchema = createUpdateSchema(medicalRecord);
export type MedicalRecordCreateInput = z.infer<typeof MedicalRecordCreateSchema>;
export type MedicalRecordUpdateInput = z.infer<typeof MedicalRecordUpdateSchema>;

export const DiagnosisSchema = createSelectSchema(diagnosis);
export const DiagnosisCreateSchema = createInsertSchema(diagnosis);
export const DiagnosisUpdateSchema = createUpdateSchema(diagnosis);
export type DiagnosisCreateInput = z.infer<typeof DiagnosisCreateSchema>;
export type DiagnosisUpdateInput = z.infer<typeof DiagnosisUpdateSchema>;
export const VitalSignCreateSchema = createInsertSchema(vitalSign);
export const VitalSignUpdateSchema = createUpdateSchema(vitalSign);
export type VitalSignCreateInput = z.infer<typeof VitalSignCreateSchema>;
export type VitalSignUpdateInput = z.infer<typeof VitalSignUpdateSchema>;
// Growth & Development Schemas

export const FeedingLogSchema = createSelectSchema(feedingLog);
export const FeedingLogCreateSchema = createInsertSchema(feedingLog);
export const FeedingLogUpdateSchema = createUpdateSchema(feedingLog);
export type FeedingLogCreateInput = z.infer<typeof FeedingLogCreateSchema>;
export type FeedingLogUpdateInput = z.infer<typeof FeedingLogUpdateSchema>;

export const DevelopmentalMilestonesSchema = createSelectSchema(developmentalMilestones);
export const DevelopmentalMilestonesCreateSchema = createInsertSchema(developmentalMilestones);
export const DevelopmentalMilestonesUpdateSchema = createUpdateSchema(developmentalMilestones);
export type DevelopmentalMilestonesCreateInput = z.infer<typeof DevelopmentalMilestonesCreateSchema>;
export type DevelopmentalMilestonesUpdateInput = z.infer<typeof DevelopmentalMilestonesUpdateSchema>;
// Immunization Schemas
export const ImmunizationSchema = createSelectSchema(immunization);
export const ImmunizationCreateSchema = createInsertSchema(immunization);
export const ImmunizationUpdateSchema = createUpdateSchema(immunization);
export type ImmunizationCreateInput = z.infer<typeof ImmunizationCreateSchema>;
export type ImmunizationUpdateInput = z.infer<typeof ImmunizationUpdateSchema>;

export const VaccineScheduleSchema = createSelectSchema(vaccineSchedule);
export const VaccineScheduleCreateSchema = createInsertSchema(vaccineSchedule);
export const VaccineScheduleUpdateSchema = createUpdateSchema(vaccineSchedule);
export type VaccineScheduleCreateInput = z.infer<typeof VaccineScheduleCreateSchema>;
export type VaccineScheduleUpdateInput = z.infer<typeof VaccineScheduleUpdateSchema>;

export const VaccineInventoryCreateSchema = createInsertSchema(vaccineInventory);
export const VaccineInventoryUpdateSchema = createUpdateSchema(vaccineInventory);
export type VaccineInventoryUpdateInput = z.infer<typeof VaccineInventoryUpdateSchema>;
export type VaccineInventoryCreateInput = z.infer<typeof VaccineInventoryCreateSchema>;

export const AdverseEventCreateSchema = createInsertSchema(adverseEvent);
export const AdverseEventUpdateSchema = createUpdateSchema(adverseEvent);
export type AdverseEventCreateInput = z.infer<typeof AdverseEventCreateSchema>;
export type AdverseEventUpdateInput = z.infer<typeof AdverseEventUpdateSchema>;
// Medication Schemas
export const DrugSchema = createSelectSchema(drug);
export const DrugCreateSchema = createInsertSchema(drug);
export const DrugUpdateSchema = createUpdateSchema(drug);
export type DrugCreateInput = z.infer<typeof DrugCreateSchema>;
export type DrugUpdateInput = z.infer<typeof DrugUpdateSchema>;
export const DoseGuidelineSchema = createSelectSchema(doseGuideline);
export const DoseGuidelineCreateSchema = createInsertSchema(doseGuideline);
export const DoseGuidelineUpdateSchema = createUpdateSchema(doseGuideline);
export type DoseGuidelineCreateInput = z.infer<typeof DoseGuidelineCreateSchema>;
export type DoseGuidelineUpdateInput = z.infer<typeof DoseGuidelineUpdateSchema>;
export const PrescriptionSchema = createSelectSchema(prescription);
export const PrescriptionCreateSchema = createInsertSchema(prescription);
export const PrescriptionUpdateSchema = createUpdateSchema(prescription);
export type PrescriptionCreateInput = z.infer<typeof PrescriptionCreateSchema>;
export type PrescriptionUpdateInput = z.infer<typeof PrescriptionUpdateSchema>;
export const PrescribedItemSchema = createSelectSchema(prescribedItem);
export const PrescribedItemCreateSchema = createInsertSchema(prescribedItem);
export const PrescribedItemUpdateSchema = createUpdateSchema(prescribedItem);
export type PrescribedItemCreateInput = z.infer<typeof PrescribedItemCreateSchema>;
export type PrescribedItemUpdateInput = z.infer<typeof PrescribedItemUpdateSchema>;
export const MedicationDispenseSchema = createSelectSchema(medicationDispense);
export const MedicationDispenseCreateSchema = createInsertSchema(medicationDispense);
export const MedicationDispenseUpdateSchema = createUpdateSchema(medicationDispense);
export type MedicationDispenseCreateInput = z.infer<typeof MedicationDispenseCreateSchema>;
export type MedicationDispenseUpdateInput = z.infer<typeof MedicationDispenseUpdateSchema>;
export const PrescriptionLogSchema = createSelectSchema(prescriptionLog);
export const PrescriptionLogCreateSchema = createInsertSchema(prescriptionLog);
export const PrescriptionLogUpdateSchema = createUpdateSchema(prescriptionLog);
export type PrescriptionLogCreateInput = z.infer<typeof PrescriptionLogCreateSchema>;
export type PrescriptionLogUpdateInput = z.infer<typeof PrescriptionLogUpdateSchema>;
// Service & Billing Schemas
export const ServiceSchema = createSelectSchema(service);
export const ServiceCreateSchema = createInsertSchema(service);
export const ServiceUpdateSchema = createUpdateSchema(service);
export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;

export const LabTestCreateSchema = createInsertSchema(labTest);
export const LabTestUpdateSchema = createUpdateSchema(labTest);
export type LabTestCreateInput = z.infer<typeof LabTestCreateSchema>;
export type LabTestUpdateInput = z.infer<typeof LabTestUpdateSchema>;

export const PaymentSchema = createSelectSchema(payment);
export const PaymentCreateSchema = createInsertSchema(payment);
export const PaymentUpdateSchema = createUpdateSchema(payment);
export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>;
export const PatientBillSchema = createSelectSchema(patientBill);
export const PatientBillCreateSchema = createInsertSchema(patientBill);
export const PatientBillUpdateSchema = createUpdateSchema(patientBill);
export type PatientBillCreateInput = z.infer<typeof PatientBillCreateSchema>;
export type PatientBillUpdateInput = z.infer<typeof PatientBillUpdateSchema>;

// Communication Schemas
export const NotificationSchema = createSelectSchema(notification);
export const NotificationCreateSchema = createInsertSchema(notification);
export const NotificationUpdateSchema = createUpdateSchema(notification);
// =======================
// ENHANCED SCHEMAS WITH CUSTOM VALIDATION
// =======================

// Time validation regex
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Folder Schema with enhanced validation
export const FolderEnhancedCreateSchema = createInsertSchema(folder)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		userId: true,
		name: true,
		parentId: true
	})
	.extend({
		id: z.string().min(1, "Folder ID is required"),
		userId: z.string().min(1, "User ID is required"),
		name: z.string().min(1, "Folder name is required").max(255, "Folder name too long"),
		parentId: z.string().nullable().optional()
	});

export const FolderEnhancedUpdateSchema = FolderEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Folder ID is required")
});

// File Schema with enhanced validation
export const FileEnhancedCreateSchema = createInsertSchema(file)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		slug: true,
		userId: true,
		folderId: true,
		filename: true,
		searchText: true,
		size: true,
		mimeType: true
	})
	.extend({
		id: z.string().min(1, "File ID is required"),
		slug: z.string().min(1, "File slug is required"),
		userId: z.string().min(1, "User ID is required"),
		folderId: z.string().nullable().optional(),
		filename: z.string().min(1, "Filename is required"),
		searchText: z.string().default(""),
		size: z.number().int().min(0, "File size must be non-negative"),
		mimeType: z.string().min(1, "MIME type is required")
	});

export const FileEnhancedUpdateSchema = FileEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "File ID is required")
});

// Clinic Schema with enhanced validation
export const ClinicEnhancedCreateSchema = createInsertSchema(clinic)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		name: true,
		email: true,
		timezone: true,
		address: true,
		phone: true,
		deletedAt: true,
		isDeleted: true
	})
	.extend({
		id: z.string().min(1, "Clinic ID is required"),
		name: z.string().min(1, "Clinic name is required").max(255, "Clinic name too long"),
		email: z.email("Invalid email format").nullable().optional(),
		timezone: z.string().min(1, "Timezone is required"),
		address: z.string().nullable().optional(),
		phone: z.string().nullable().optional(),
		deletedAt: z.date().nullable().optional(),
		isDeleted: z.boolean().default(false)
	});

export const ClinicEnhancedUpdateSchema = ClinicEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Clinic ID is required")
});

// Doctor Schema with enhanced validation
export const DoctorEnhancedCreateSchema = createInsertSchema(doctor)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		name: true,
		specialty: true,
		email: true,
		userId: true,
		clinicId: true,
		licenseNumber: true,
		phone: true,
		address: true,
		department: true,
		img: true,
		colorCode: true,
		availabilityStatus: true,
		availableFromWeekDay: true,
		availableToWeekDay: true,
		isActive: true,
		availableFromTime: true,
		availableToTime: true,
		type: true,
		appointmentPrice: true,
		rating: true,
		deletedAt: true,
		isDeleted: true
	})
	.extend({
		id: z.string().min(1, "Doctor ID is required"),
		email: z.email("Invalid email format").nullable().optional(),
		name: z.string().min(1, "Doctor name is required"),
		userId: z.string().nullable().optional(),
		clinicId: z.string().nullable().optional(),
		specialty: z.string().min(1, "Specialty is required"),
		licenseNumber: z.string().nullable().optional(),
		phone: z.string().nullable().optional(),
		address: z.string().nullable().optional(),
		department: z.string().nullable().optional(),
		img: z.url("Invalid image URL").nullable().optional(),
		colorCode: z
			.string()
			.regex(/^#[0-9A-F]{6}$/i, "Invalid color code")
			.nullable()
			.optional(),
		availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).nullable().optional(),
		availableFromWeekDay: z
			.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
			.nullable()
			.optional(),
		availableToWeekDay: z
			.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
			.nullable()
			.optional(),
		isActive: z.boolean().nullable().optional(),
		status: z
			.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
			.nullable()
			.optional(),
		availableFromTime: z.string().regex(TIME_REGEX, "Invalid time format").nullable().optional(),
		availableToTime: z.string().regex(TIME_REGEX, "Invalid time format").nullable().optional(),
		type: z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]).default("FULL"),
		appointmentPrice: z.number().int().min(0, "Price must be non-negative").nullable().optional(),
		role: z.enum(["admin", "doctor", "staff", "patient"]).nullable().optional(),
		rating: z.number().int().min(0).max(5, "Rating must be between 0 and 5").nullable().optional(),
		deletedAt: z.date().nullable().optional(),
		isDeleted: z.boolean().default(false)
	});

export const DoctorEnhancedUpdateSchema = DoctorEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Doctor ID is required")
});

// Working Day Schema with enhanced validation
const WorkingDayBaseSchema = createInsertSchema(workingDay)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		doctorId: true,
		day: true,
		startTime: true,
		endTime: true
	})
	.extend({
		id: z.string().min(1, "Working day ID is required"),
		doctorId: z.string().min(1, "Doctor ID is required"),
		day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
		startTime: z.string().regex(TIME_REGEX, "Invalid start time format"),
		endTime: z.string().regex(TIME_REGEX, "Invalid end time format")
	});

export const WorkingDayEnhancedCreateSchema = WorkingDayBaseSchema.refine(data => data.startTime < data.endTime, {
	message: "Start time must be before end time",
	path: ["endTime"]
});

export const WorkingDayEnhancedUpdateSchema = WorkingDayEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Working day ID is required")
});

// =======================
// QUERY SCHEMAS FOR FILTERING AND PAGINATION
// =======================

export const PatientListQuerySchema = z.object({
	clinicId: z.string().optional(),
	search: z.string().optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
		.optional(),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
	bloodGroup: z
		.enum([
			"A_POSITIVE",
			"A_NEGATIVE",
			"B_POSITIVE",
			"B_NEGATIVE",
			"O_POSITIVE",
			"O_NEGATIVE",
			"AB_POSITIVE",
			"AB_NEGATIVE"
		])
		.optional(),
	ageMin: z.number().int().min(0).optional(),
	ageMax: z.number().int().min(0).optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["firstName", "lastName", "dateOfBirth", "createdAt"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export const AppointmentListQuerySchema = z.object({
	clinicId: z.string().optional(),
	doctorId: z.string().optional(),
	patientId: z.string().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
	appointmentDate: z.date().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	type: z.string().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["appointmentDate", "createdAt", "status"]).default("appointmentDate"),
	sortOrder: z.enum(["asc", "desc"]).default("asc")
});

export const DoctorListQuerySchema = z.object({
	clinicId: z.string().optional(),
	specialty: z.string().optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
		.optional(),
	availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).optional(),
	type: z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]).optional(),
	search: z.string().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["name", "specialty", "rating", "createdAt"]).default("name"),
	sortOrder: z.enum(["asc", "desc"]).default("asc")
});

export const PaymentListQuerySchema = z.object({
	clinicId: z.string().optional(),
	patientId: z.string().optional(),
	status: z.enum(["PAID", "UNPAID", "PENDING", "REFUNDED", "PARTIAL"]).optional(),
	paymentMethod: z.enum(["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"]).optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	minAmount: z.number().int().min(0).optional(),
	maxAmount: z.number().int().min(0).optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["billDate", "paymentDate", "amount", "status"]).default("billDate"),
	sortOrder: z.enum(["asc", "desc"]).default("desc")
});

// =======================
// BULK OPERATION SCHEMAS
// =======================

export const BulkPatientUpdateSchema = z.object({
	patientIds: z.array(z.string().min(1)).min(1, "At least one patient ID is required"),
	updates: z
		.object({
			status: z
				.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
				.optional(),
			isActive: z.boolean().optional(),
			updatedById: z.string().optional()
		})
		.refine(data => Object.keys(data).length > 0, {
			message: "At least one field must be updated"
		})
});

export const BulkAppointmentUpdateSchema = z.object({
	appointmentIds: z.array(z.string().min(1)).min(1, "At least one appointment ID is required"),
	updates: z
		.object({
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
			doctorId: z.string().optional(),
			appointmentDate: z.date().optional()
		})
		.refine(data => Object.keys(data).length > 0, {
			message: "At least one field must be updated"
		})
});

export const PatientBillReorderSchema = z
	.array(
		z.object({
			id: z.string().min(1, "Bill ID is required"),
			order: z.number().int().min(0, "Order must be non-negative")
		})
	)
	.min(1, "At least one bill item is required");
// =======================
// TYPE EXPORTS (Inferred from schemas)
// =======================

// System Types
export type Folder = z.infer<typeof FolderSchema>;
export type File = z.infer<typeof FileSchema>;
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
// Enhanced Input Types
export type FolderEnhancedCreateInput = z.infer<typeof FolderEnhancedCreateSchema>;
export type FolderEnhancedUpdateInput = z.infer<typeof FolderEnhancedUpdateSchema>;
export type FileEnhancedCreateInput = z.infer<typeof FileEnhancedCreateSchema>;
export type FileEnhancedUpdateInput = z.infer<typeof FileEnhancedUpdateSchema>;
export type ClinicEnhancedCreateInput = z.infer<typeof ClinicEnhancedCreateSchema>;
export type ClinicEnhancedUpdateInput = z.infer<typeof ClinicEnhancedUpdateSchema>;
export type DoctorEnhancedCreateInput = z.infer<typeof DoctorEnhancedCreateSchema>;
export type DoctorEnhancedUpdateInput = z.infer<typeof DoctorEnhancedUpdateSchema>;
export type WorkingDayEnhancedCreateInput = z.infer<typeof WorkingDayEnhancedCreateSchema>;
export type WorkingDayEnhancedUpdateInput = z.infer<typeof WorkingDayEnhancedUpdateSchema>;

// Query Types
export type PatientListQuery = z.infer<typeof PatientListQuerySchema>;
export type AppointmentListQuery = z.infer<typeof AppointmentListQuerySchema>;
export type DoctorListQuery = z.infer<typeof DoctorListQuerySchema>;
export type PaymentListQuery = z.infer<typeof PaymentListQuerySchema>;

// Bulk Operation Types
export type BulkPatientUpdateInput = z.infer<typeof BulkPatientUpdateSchema>;
export type BulkAppointmentUpdateInput = z.infer<typeof BulkAppointmentUpdateSchema>;
export type PatientBillReorder = z.infer<typeof PatientBillReorderSchema>;
// Service & Billing Types

export const RoleSchema = z.enum(roleEnum.enumValues);
export const StatusSchema = z.enum(statusEnum.enumValues);
export const AppointmentStatusSchema = z.enum(appointmentStatusEnum.enumValues);
export const GenderSchema = z.enum(genderEnum.enumValues);
export const BloodGroupSchema = z.enum(bloodGroupEnum.enumValues);
export const MaritalStatusSchema = z.enum(maritalStatusEnum.enumValues);
export const NutritionalStatusSchema = z.enum(nutritionalStatusEnum.enumValues);
export const DoctorTypeSchema = z.enum(doctorTypeEnum.enumValues);
export const PaymentStatusSchema = z.enum(paymentStatusEnum.enumValues);
export const PaymentMethodSchema = z.enum(paymentMethodEnum.enumValues);
export const AvailabilityStatusSchema = z.enum(availabilityStatusEnum.enumValues);
export const NotificationStatusSchema = z.enum(notificationStatusEnum.enumValues);
export const NotificationPrioritySchema = z.enum(notificationPriorityEnum.enumValues);
export const ImmunizationStatusSchema = z.enum(immunizationStatusEnum.enumValues);
export const PrescriptionStatusSchema = z.enum(prescriptionStatusEnum.enumValues);
export const WeekdaySchema = z.enum(weekdayEnum.enumValues);
export const MeasurementTypeSchema = z.enum(measurementTypeEnum.enumValues);
export const FeedingTypeSchema = z.enum(feedingTypeEnum.enumValues);
export const BreastSchema = z.enum(breastEnum.enumValues);
export const DrugRouteSchema = z.enum(drugRouteEnum.enumValues);
export const FrequencySchema = z.enum(frequencyEnum.enumValues);
export const LabTestStatusSchema = z.enum(labTestStatusEnum.enumValues);
export const SeveritySchema = z.enum(severityEnum.enumValues);

export type Status = z.infer<typeof StatusSchema>;
export type NutritionalStatus = z.infer<typeof NutritionalStatusSchema>;
export type DoctorType = z.infer<typeof DoctorTypeSchema>;
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
export type MeasurementType = z.infer<typeof MeasurementTypeSchema>;
export type Breast = z.infer<typeof BreastSchema>;
export type DrugRoute = z.infer<typeof DrugRouteSchema>;
export type Frequency = z.infer<typeof FrequencySchema>;
export type LabTestStatus = z.infer<typeof LabTestStatusSchema>;

export type AdherenceItem = DbPrescribedItem & {
	prescription?: DbPrescription | null;
	dispenses?: {
		quantityDispensed: number;
	}[];
	dosageValue: number | null;
	frequency: string;
};

// Helper functions
export function calculateAdherenceMetrics(prescribedItems: AdherenceItem[]) {
	let totalAdherence = 0;
	let count = 0;

	for (const item of prescribedItems) {
		const expectedDoses = calculateExpectedDoses(
			item,
			item.prescription?.issuedDate ?? new Date(),
			item.prescription?.validUntil ?? new Date()
		);
		const dispensedDoses =
			item.dispenses?.reduce(
				(sum: number, dispense: { quantityDispensed: number }) =>
					sum + dispense.quantityDispensed / (item.dosageValue || 1),
				0
			) ?? 0;

		const adherence = expectedDoses > 0 ? (dispensedDoses / expectedDoses) * 100 : 0;
		totalAdherence += adherence;
		count++;
	}

	return {
		overallAdherence: count > 0 ? totalAdherence / count : 0,
		status: getAdherenceStatus(totalAdherence / count)
	};
}

function getAdherenceStatus(percentage: number): "GOOD" | "FAIR" | "POOR" {
	if (percentage >= 80) {
		return "GOOD";
	}
	if (percentage >= 50) {
		return "FAIR";
	}
	return "POOR";
}

export function calculateExpectedDoses(item: AdherenceItem, startDate: Date, endDate: Date) {
	const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
	const frequencyPerDay = parseFrequency(item.frequency);
	return days * frequencyPerDay * (item.dosageValue || 1);
}
export type PrescriptionWithItems = DbPrescription & {
	prescribedItems: (DbPrescribedItem & {
		drug?: DbDrug | null;
	})[];
};

function parseFrequency(frequency: string): number {
	const f = frequency.toUpperCase();
	if (f.includes("QD") || f.includes("ONCE")) {
		return 1;
	}
	if (f.includes("BID") || f.includes("TWICE")) {
		return 2;
	}
	if (f.includes("TID") || f.includes("THREE")) {
		return 3;
	}
	if (f.includes("QID") || f.includes("FOUR")) {
		return 4;
	}
	if (f.includes("QHS")) {
		return 1;
	}
	return 1;
}

export type createCompleteEncounterInput = z.infer<typeof createCompleteEncounterSchema>;

export interface AppointmentCount {
	count: number;
	status: string | null;
}

export interface AppointmentRecord {
	appointmentDate: Date;
	doctor?: {
		name: string;
	} | null;
	id: string;
	patient?: {
		firstName: string;
		lastName: string;
	} | null;
	status?: string | null;
	type?: string | null;
}

// Schema for admin dashboard stats response
export const AdminDashboardStatsSchema = z.object({
	availableDoctors: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			specialty: z.string().nullable(),
			available: z.boolean(),
			nextAvailableTime: z.string().nullable()
		})
	),
	last5Records: z.array(
		z.object({
			id: z.string(),
			patientName: z.string(),
			doctorName: z.string(),
			appointmentDate: z.date(),
			status: z.enum(["COMPLETED", "CANCELLED", "PENDING", "NO_SHOW", "CONFIRMED"]),
			type: z.string().nullable()
		})
	),
	appointmentCounts: z.object({
		COMPLETED: z.number(),
		CANCELLED: z.number(),
		PENDING: z.number(),
		CONFIRMED: z.number(),
		NO_SHOW: z.number()
	}),
	monthlyData: z.array(
		z.object({
			month: z.string(),
			appointments: z.number()
		})
	),
	totalDoctors: z.number(),
	totalPatient: z.number(),
	totalAppointments: z.number()
});

export const GetAppointmentsInRangeSchema = z.object({
	startDate: z.date(),
	endDate: z.date(),
	doctorId: z.string().optional()
});

export const GetAppointmentsSchema = z.object({
	page: z.number().default(1),
	limit: z.number().default(10),
	status: z.enum(appointmentStatusEnum.enumValues).optional(),
	doctorId: z.string().optional(),
	patientId: z.string().optional()
});

export const UpdateAppointmentStatusSchema = z.object({
	id: z.string(),
	status: z.enum(appointmentStatusEnum.enumValues)
});

export const CancelApstringpointmentSchema = z.object({
	id: z.string(),
	reason: z.string().optional()
});

export const RescheduleAppointmentSchema = z.object({
	id: z.string(),
	newDate: z.date(),
	newTime: z.string(),
	reason: z.string().optional()
});

export const BulkUpdateStatusSchema = z.object({
	appointmentIds: z.array(z.string()),
	status: z.enum(appointmentStatusEnum.enumValues),
	reason: z.string().optional()
});

export const ListAppointmentsSchema = z.object({
	page: z.number().default(1),
	limit: z.number().default(10),
	search: z.string().optional(),
	status: z.enum(appointmentStatusEnum.enumValues).optional(),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	doctorSpecialty: z.string().optional(),
	type: z.string().optional()
});

export const GetDoctorAvailabilitySchema = z.object({
	doctorId: z.string(),
	date: z.date()
});

export const GetAvailableTimeSlotsSchema = z.object({
	doctorId: z.string(),
	date: z.date(),
	durationMinutes: z.number().min(15).max(120).default(30)
});

export const UpdateUserInputSchema = z.object({
	id: z.string(),
	email: z.email().optional(),
	name: z.string().min(1).optional(),
	phone: z.string().optional(),
	clinicId: z.string().optional(),
	address: z.string().optional(),
	role: z.enum(roleEnum.enumValues).optional()
});

export const CancelAppointmentSchema = z.object({
	id: z.string(),
	reason: z.string().optional()
});

export const PatientWithRelationsSchema = PatientSchema.extend({
	appointments: z.array(z.any()).optional(),
	medicalRecords: z.array(z.any()).optional(),
	encounters: z.array(z.any()).optional(),
	immunizations: z.array(z.any()).optional(),
	vitalSigns: z.array(z.any()).optional(),
	prescriptions: z.array(z.any()).optional(),
	growthRecords: z.array(z.any()).optional(),
	payments: z.array(z.any()).optional(),
	guardians: z.array(z.any()).optional()
});

export const NeonatalAssessmentSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	clinicId: z.string(),
	weight: z.number(),
	height: z.number(),
	vitals: z
		.object({
			bodyTemperature: z.number(),
			heartRate: z.number(),
			respiratoryRate: z.number(),
			oxygenSaturation: z.number()
		})
		.nullable(),
	headCircumference: z.number(),
	apgarScore: z.number(),
	feedingType: z.enum(feedingTypeEnum.enumValues),
	createdAt: z.date(),
	updatedAt: z.date()
});
export const MeasurementCreateSchema = createInsertSchema(measurement);
export const MeasurementUpdateSchema = createUpdateSchema(measurement);
export type MeasurementCreateInput = z.infer<typeof MeasurementCreateSchema>;
export type MeasurementUpdateInput = z.infer<typeof MeasurementUpdateSchema>;

export const LmsReferenceSchema = createSelectSchema(lmsReference);
export const LmsReferenceCreateSchema = createInsertSchema(lmsReference);
export const LmsReferenceUpdateSchema = createUpdateSchema(lmsReference);
export type LmsReferenceCreateInput = z.infer<typeof LmsReferenceCreateSchema>;
export type LmsReferenceUpdateInput = z.infer<typeof LmsReferenceUpdateSchema>;

export const GrowthAlertSchema = createSelectSchema(growthAlert);
export const GrowthAlertCreateSchema = createInsertSchema(growthAlert);
export const GrowthAlertUpdateSchema = createUpdateSchema(growthAlert);
export type GrowthAlertCreateInput = z.infer<typeof GrowthAlertCreateSchema>;
export type GrowthAlertUpdateInput = z.infer<typeof GrowthAlertUpdateSchema>;

export const GrowthChartCacheSchema = createSelectSchema(growthChartCache);
export const GrowthChartCacheCreateSchema = createInsertSchema(growthChartCache);
export const GrowthChartCacheUpdateSchema = createUpdateSchema(growthChartCache);
export type GrowthChartCacheCreateInput = z.infer<typeof GrowthChartCacheCreateSchema>;
export type GrowthChartCacheUpdateInput = z.infer<typeof GrowthChartCacheUpdateSchema>;

export const GrowthPercentileHistorySchema = createSelectSchema(growthPercentileHistory);
export const GrowthPercentileHistoryCreateSchema = createInsertSchema(growthPercentileHistory);
export const GrowthPercentileHistoryUpdateSchema = createUpdateSchema(growthPercentileHistory);
export type GrowthPercentileHistoryCreateInput = z.infer<typeof GrowthPercentileHistoryCreateSchema>;
export type GrowthPercentileHistoryUpdateInput = z.infer<typeof GrowthPercentileHistoryUpdateSchema>;

export const VelocityStandardSchema = createSelectSchema(velocityStandard);
export const VelocityStandardCreateSchema = createInsertSchema(velocityStandard);
export const VelocityStandardUpdateSchema = createUpdateSchema(velocityStandard);
export type VelocityStandardCreateInput = z.infer<typeof VelocityStandardCreateSchema>;
export type VelocityStandardUpdateInput = z.infer<typeof VelocityStandardUpdateSchema>;

export const ImportBatchSchema = createSelectSchema(importBatch);
export const ImportBatchCreateSchema = createInsertSchema(importBatch);
export const ImportBatchUpdateSchema = createUpdateSchema(importBatch);
export type ImportBatchCreateInput = z.infer<typeof ImportBatchCreateSchema>;
export type ImportBatchUpdateInput = z.infer<typeof ImportBatchUpdateSchema>;

export const patientIdSchema = z.object({
	id: z.string().min(1)
});
export const patientByClinicSchema = z.object({
	clinicId: z.string().min(1)
});
export const patientMRNSchema = z.object({
	mrn: z.string().min(1)
});

export const patientIdsSchema = z.object({
	ids: z.array(z.string().min(1))
});

export const listPatientsSchema = z.object({
	clinicId: z.string().min(1),
	limit: z.number().min(1),
	offset: z.number().min(0),
	search: z.string().optional(),
	status: z.enum([...statusEnum.enumValues] as [string, ...string[]]).optional(),
	isActive: z.boolean().optional(),
	gender: z.enum([...genderEnum.enumValues] as [string, ...string[]]).optional(),
	bloodGroup: z.enum([...bloodGroupEnum.enumValues] as [string, ...string[]]).optional()
});

export const deletePatientSchema = z.object({
	id: z.string().min(1),
	permanent: z.boolean().default(false)
});

export const restorePatientSchema = z.object({
	id: z.string().min(1)
});
export const PrescribedItemsSchema = createSelectSchema(prescribedItem);
export const PrescribedItemsCreateSchema = createInsertSchema(prescribedItem);
export const PrescribedItemsUpdateSchema = createUpdateSchema(prescribedItem);
export type PrescribedItemsCreateInput = z.infer<typeof PrescribedItemsCreateSchema>;
export type PrescribedItemsUpdateInput = z.infer<typeof PrescribedItemsUpdateSchema>;

/**
 * Healthcare-specific validation utilities
 */
const HealthcareValidators = {
	/**
	 * Validates Egyptian National ID (14 digits)
	 */
	egyptianNationalId: () =>
		z.string().regex(REG, "Invalid Egyptian National ID format (must be 14 digits)").optional(),

	/**
	 * Validates MRN format (clinic prefix + 6-8 digits)
	 */
	mrn: () => z.string().regex(REG2, "MRN must be 2-4 uppercase letters followed by 6-8 digits").optional(),

	/**
	 * Validates phone numbers (Egyptian format)
	 */
	egyptianPhone: () => z.string().regex(REG3, "Invalid Egyptian phone number").optional(),

	/**
	 * Validates email with clinic domain restriction
	 */ clinicEmail: (allowedDomains?: string[]) =>
		z
			.string() // Ensure it's a string
			.email("Invalid email format")
			.refine(
				email => {
					if (!allowedDomains) {
						return true;
					}

					// Use optional chaining and nullish coalescing to ensure a string
					const domain = email.split("@")[1] ?? "";

					return allowedDomains.includes(domain);
				},
				{ message: "Email domain not authorized for this clinic" }
			)
			.optional(),
	/**
	 * Validates age in months (0-240 months for pediatric patients)
	 */
	ageInMonths: () =>
		z.number().min(0, "Age cannot be negative").max(240, "Age exceeds pediatric range (max 20 years)").optional(),

	/**
	 * Validates weight in kg (0.5-200 kg)
	 */
	weightKg: () =>
		z.number().min(0.5, "Weight below minimum viable range").max(200, "Weight exceeds maximum range").optional(),

	/**
	 * Validates height in cm (30-250 cm)
	 */
	heightCm: () =>
		z.number().min(30, "Height below minimum viable range").max(250, "Height exceeds maximum range").optional(),

	/**
	 * Validates BMI (8-80)
	 */
	bmi: () => z.number().min(8, "BMI below viable range").max(80, "BMI exceeds viable range").optional(),

	/**
	 * Validates Z-scores (-5 to +5)
	 */
	zScore: () =>
		z.number().min(-5, "Z-score below -5 SD (extreme)").max(5, "Z-score above +5 SD (extreme)").optional(),

	/**
	 * Validates percentile (0-100)
	 */
	percentile: () =>
		z.number().min(0, "Percentile cannot be below 0").max(100, "Percentile cannot exceed 100").optional(),

	/**
	 * Validates blood pressure systolic (70-250) and diastolic (40-160)
	 */
	bloodPressure: () =>
		z.object({
			systolic: z.number().min(70, "Systolic below viable range").max(250, "Systolic exceeds viable range"),
			diastolic: z.number().min(40, "Diastolic below viable range").max(160, "Diastolic exceeds viable range")
		})
};

// ============================================
// 2. CUSTOM SCHEMA EXTENSIONS
// ============================================

/**
 * Extend base schemas with healthcare-specific validation
 */
export const extendWithHealthcareValidation = <T extends z.ZodRawShape, O extends z.ZodRawShape>(
	baseSchema: z.ZodObject<T>,
	overrides: O
) => baseSchema.extend(overrides);
// ============================================
// 3. RUNTIME ZOD SCHEMAS WITH VALIDATION
// ============================================

// --- Core Tables ---

export const CreateFolderSchema = createInsertSchema(folder);
export const UpdateFolderSchema = createUpdateSchema(folder);

export const CreateFileSchema = createInsertSchema(file);
export const UpdateFileSchema = createUpdateSchema(file);

export const CreateConfigStoreSchema = createInsertSchema(configStore);
export const UpdateConfigStoreSchema = createUpdateSchema(configStore);

export const CreateInviteSchema = createInsertSchema(invite);
export const UpdateInviteSchema = createUpdateSchema(invite);

// --- Clinic & Organization ---

export const CreateClinicSchema = createInsertSchema(clinic).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone()
});
export const UpdateClinicSchema = createUpdateSchema(clinic).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone()
});

export const CreateClinicMemberSchema = createInsertSchema(clinicMember);
export const UpdateClinicMemberSchema = createUpdateSchema(clinicMember);

export const CreateClinicSettingSchema = createInsertSchema(clinicSetting);
export const UpdateClinicSettingSchema = createUpdateSchema(clinicSetting);

// --- Staff & Doctors ---
export const CreateDoctorSchema = createInsertSchema(doctor).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone(),
	appointmentPrice: z.number().min(0, "Price cannot be negative").optional(),
	rating: z.number().min(0, "Rating cannot be negative").max(5, "Rating cannot exceed 5").optional()
});
export const UpdateDoctorSchema = createUpdateSchema(doctor).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone(),
	appointmentPrice: z.number().min(0, "Price cannot be negative").optional()
});

export const WorkingDaySchema = createSelectSchema(workingDay);
export const CreateWorkingDaySchema = createInsertSchema(workingDay);
export const UpdateWorkingDaySchema = createUpdateSchema(workingDay);

export const StaffSchema = createSelectSchema(staff);
export const CreateStaffSchema = createInsertSchema(staff).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone(),
	salary: z.number().min(0, "Salary cannot be negative").optional()
});
export const UpdateStaffSchema = createUpdateSchema(staff).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone()
});

// --- Patients ---
export const CreatePatientSchema = createInsertSchema(patient)
	.extend({
		email: HealthcareValidators.clinicEmail(),
		phone: HealthcareValidators.egyptianPhone(),
		mrn: HealthcareValidators.mrn(),
		dateOfBirth: z.date({ error: "Date of birth is required" }),
		emergencyContactNumber: HealthcareValidators.egyptianPhone()
	})
	.refine(
		data => {
			// Validate that date of birth is not in the future
			if (data.dateOfBirth) {
				const age = Date.now() - new Date(data.dateOfBirth).getTime();
				const ageYears = age / (1000 * 60 * 60 * 24 * 365.25);
				if (ageYears < 0) {
					return false;
				}
				if (ageYears > 120) {
					return false; // Max age 120 years
				}
			}
			return true;
		},
		{
			message: "Invalid date of birth: must be valid and within 0-120 years",
			path: ["dateOfBirth"]
		}
	);
export const UpdatePatientSchema = createUpdateSchema(patient).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone(),
	mrn: HealthcareValidators.mrn()
});

// export const UserSchema = createSelectSchema(user);
// export const CreateUserSchema = createInsertSchema(user);
// export const UpdateUserSchema = createUpdateSchema(user);

// --- Appointments ---
export const CreateAppointmentSchema = createInsertSchema(appointment)
	.extend({
		appointmentDate: z.date({ error: "Appointment date is required" }),
		durationMinutes: z
			.number()
			.min(5, "Minimum duration 5 minutes")
			.max(120, "Maximum duration 120 minutes")
			.optional(),
		appointmentPrice: z.number().min(0, "Price cannot be negative").optional()
	})
	.refine(
		data => {
			if (data.appointmentDate) {
				return new Date(data.appointmentDate) > new Date();
			}
			return true;
		},
		{
			message: "Appointment must be scheduled in the future",
			path: ["appointmentDate"]
		}
	);
export const UpdateAppointmentSchema = createUpdateSchema(appointment).extend({
	appointmentDate: z.date().optional(),
	durationMinutes: z.number().min(5).max(120).optional()
});

// --- Medical Records ---
export const CreateMedicalRecordSchema = createInsertSchema(medicalRecord).extend({
	diagnosisDate: z.date({ error: "Diagnosis date is required" }),
	followUpDate: z.date().optional()
});
export const UpdateMedicalRecordSchema = createUpdateSchema(medicalRecord);

// --- Vital Signs ---
export const VitalSignSchema = createSelectSchema(vitalSign);
export const CreateVitalSignSchema = createInsertSchema(vitalSign)
	.extend({
		weight: HealthcareValidators.weightKg(),
		height: HealthcareValidators.heightCm(),
		bmi: HealthcareValidators.bmi(),
		bodyTemperature: z
			.number()
			.min(30, "Temperature below viable range")
			.max(45, "Temperature exceeds viable range")
			.optional(),
		systolic: z
			.number()
			.min(70, "Systolic below viable range")
			.max(250, "Systolic exceeds viable range")
			.optional(),
		diastolic: z
			.number()
			.min(40, "Diastolic below viable range")
			.max(160, "Diastolic exceeds viable range")
			.optional(),
		heartRate: z
			.number()
			.min(30, "Heart rate below viable range")
			.max(250, "Heart rate exceeds viable range")
			.optional(),
		respiratoryRate: z
			.number()
			.min(10, "Respiratory rate below viable range")
			.max(80, "Respiratory rate exceeds viable range")
			.optional(),
		oxygenSaturation: z
			.number()
			.min(70, "Oxygen saturation below viable range")
			.max(100, "Oxygen saturation must be ≤ 100%")
			.optional()
	})
	.refine(
		data => {
			// BMI validation: if both weight and height are provided, calculate BMI
			if (data.weight && data.height && data.height > 0) {
				const calculatedBmi = data.weight / (data.height / 100) ** 2;
				if (data.bmi && Math.abs(data.bmi - calculatedBmi) > 0.5) {
					return false;
				}
			}
			return true;
		},
		{
			message: "BMI does not match weight and height calculations",
			path: ["bmi"]
		}
	);
export const UpdateVitalSignSchema = createUpdateSchema(vitalSign);

// --- Immunizations ---
export const CreateImmunizationSchema = createInsertSchema(immunization).extend({
	date: z.date({ error: "Immunization date is required" })
});
export const UpdateImmunizationSchema = createUpdateSchema(immunization);

// --- Services ---
export const CreateServiceSchema = createInsertSchema(service).extend({
	price: z.number().min(0, "Price cannot be negative"),
	duration: z.number().min(5, "Minimum duration 5 minutes").max(480, "Maximum duration 8 hours").optional()
});
export const UpdateServiceSchema = createUpdateSchema(service);

// --- Lab Tests ---
export const LabTestSchema = createSelectSchema(labTest);
export const CreateLabTestSchema = createInsertSchema(labTest).extend({
	testDate: z.date({ error: "Test date is required" })
});
export const UpdateLabTestSchema = createUpdateSchema(labTest);

// --- Payments & Billing ---
export const CreatePaymentSchema = createInsertSchema(payment)
	.extend({
		totalAmount: z.number().min(0, "Total amount cannot be negative"),
		amountPaid: z.number().min(0, "Amount paid cannot be negative").optional(),
		discount: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").optional()
	})
	.refine(
		data => {
			if (data.amountPaid && data.totalAmount) {
				return data.amountPaid <= data.totalAmount;
			}
			return true;
		},
		{ message: "Amount paid cannot exceed total amount", path: ["amountPaid"] }
	);
export const UpdatePaymentSchema = createUpdateSchema(payment).extend({
	totalAmount: z.number().min(0).optional(),
	amountPaid: z.number().min(0).optional()
});

export const CreatePatientBillSchema = createInsertSchema(patientBill).extend({
	quantity: z.number().min(1, "Quantity must be at least 1"),
	unitCost: z.number().min(0, "Unit cost cannot be negative"),
	totalCost: z.number().min(0, "Total cost cannot be negative")
});
export const UpdatePatientBillSchema = createUpdateSchema(patientBill);

// --- Medications ---
export const CreatePrescriptionSchema = createInsertSchema(prescription).extend({
	issuedDate: z.date({ error: "Issue date is required" }),
	endDate: z.date().optional()
});
export const UpdatePrescriptionSchema = createUpdateSchema(prescription);

export const CreateDrugSchema = createInsertSchema(drug).extend({
	quantityInStock: z.number().min(0, "Stock cannot be negative").optional()
});
export const UpdateDrugSchema = createUpdateSchema(drug);

export const CreateDoseGuidelineSchema = createInsertSchema(doseGuideline).extend({
	minDosePerKg: z.number().min(0, "Minimum dose cannot be negative").optional(),
	maxDosePerKg: z.number().min(0, "Maximum dose cannot be negative").optional()
});
export const UpdateDoseGuidelineSchema = createUpdateSchema(doseGuideline);

export const CreatePrescribedItemSchema = createInsertSchema(prescribedItem).extend({
	dosageValue: z.number().positive("Dosage must be positive"),
	refillsRemaining: z.number().min(0, "Refills cannot be negative").optional(),
	totalRefills: z.number().min(0, "Total refills cannot be negative").optional()
});
export const UpdatePrescribedItemSchema = createUpdateSchema(prescribedItem);

export const CreateMedicationDispenseSchema = createInsertSchema(medicationDispense).extend({
	quantityDispensed: z.number().positive("Quantity must be positive"),
	dispensedAt: z.date({ error: "Dispense date is required" })
});
export const UpdateMedicationDispenseSchema = createUpdateSchema(medicationDispense);

export const CreatePrescriptionLogSchema = createInsertSchema(prescriptionLog);
export const UpdatePrescriptionLogSchema = createUpdateSchema(prescriptionLog);

// --- Guardians ---
export const CreateGuardianSchema = createInsertSchema(guardian).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone()
});
export const UpdateGuardianSchema = createUpdateSchema(guardian).extend({
	email: HealthcareValidators.clinicEmail(),
	phone: HealthcareValidators.egyptianPhone()
});

// --- Feeding Logs ---
export const CreateFeedingLogSchema = createInsertSchema(feedingLog).extend({
	duration: z.number().min(0, "Duration cannot be negative").optional(),
	amount: z.number().min(0, "Amount cannot be negative").optional()
});
export const UpdateFeedingLogSchema = createUpdateSchema(feedingLog);

// --- Notifications ---
export const CreateNotificationSchema = createInsertSchema(notification);
export const UpdateNotificationSchema = createUpdateSchema(notification);

// --- Vaccines ---
export const CreateVaccineScheduleSchema = createInsertSchema(vaccineSchedule).extend({
	dosesRequired: z.number().min(1, "At least 1 dose required"),
	totalDoses: z.number().min(1, "At least 1 dose required").optional(),
	minimumInterval: z.number().min(0, "Minimum interval cannot be negative").optional()
});
export const UpdateVaccineScheduleSchema = createUpdateSchema(vaccineSchedule);

export const AdverseEventSchema = createSelectSchema(adverseEvent);
export const CreateAdverseEventSchema = createInsertSchema(adverseEvent).extend({
	dateReported: z.date({ error: "Date reported is required" })
});
export const UpdateAdverseEventSchema = createUpdateSchema(adverseEvent);

export const VaccineInventorySchema = createSelectSchema(vaccineInventory);
export const CreateVaccineInventorySchema = createInsertSchema(vaccineInventory).extend({
	quantity: z.number().min(0, "Quantity cannot be negative")
});
export const UpdateVaccineInventorySchema = createUpdateSchema(vaccineInventory);

// --- Growth & Measurements ---
export const MeasurementSchema = createSelectSchema(measurement);
export const CreateMeasurementSchema = createInsertSchema(measurement)
	.extend({
		measurementDate: z.date({ error: "Measurement date is required" }),
		chronologicalAgeMonths: HealthcareValidators.ageInMonths(),
		weightKg: HealthcareValidators.weightKg(),
		heightCm: HealthcareValidators.heightCm(),
		bmi: HealthcareValidators.bmi(),
		weightForAgeZ: HealthcareValidators.zScore(),
		heightForAgeZ: HealthcareValidators.zScore(),
		bmiForAgeZ: HealthcareValidators.zScore(),
		headCircumferenceForAgeZ: HealthcareValidators.zScore(),
		weightPercentile: HealthcareValidators.percentile(),
		heightPercentile: HealthcareValidators.percentile(),
		bmiPercentile: HealthcareValidators.percentile(),
		headCircumferenceCm: z
			.number()
			.min(20, "Head circumference below viable range")
			.max(70, "Head circumference exceeds viable range")
			.optional(),
		midUpperArmCircumferenceCm: z
			.number()
			.min(5, "MUAC below viable range")
			.max(40, "MUAC exceeds viable range")
			.optional()
	})
	.refine(
		data => {
			// Validate that at least one measurement is provided
			const hasMeasurement = data.weightKg || data.heightCm || data.headCircumferenceCm || data.bmi;
			if (!hasMeasurement) {
				return false;
			}
			return true;
		},
		{
			message: "At least one measurement (weight, height, head circumference, or BMI) is required"
		}
	)
	.refine(
		data => {
			// If BMI is provided directly, validate it's reasonable
			if (data.bmi && data.bmi > 0 && (data.bmi < 8 || data.bmi > 80)) {
				return false;
			}
			return true;
		},
		{ message: "BMI is outside normal range (8-80)", path: ["bmi"] }
	);
export const UpdateMeasurementSchema = createUpdateSchema(measurement).extend({
	weightKg: HealthcareValidators.weightKg(),
	heightCm: HealthcareValidators.heightCm(),
	bmi: HealthcareValidators.bmi()
});

export const CreateLmsReferenceSchema = createInsertSchema(lmsReference)
	.extend({
		ageMonths: z.number().min(0, "Age cannot be negative"),
		l: z.number().positive("L parameter must be positive"),
		m: z.number().positive("M parameter must be positive"),
		s: z.number().positive("S parameter must be positive"),
		median: z.number().positive("Median must be positive")
	})
	.refine(
		data => {
			// Validate that SD boundaries are properly ordered
			const { sd3neg, sd2neg, sd1neg, median, sd1pos, sd2pos, sd3pos } = data;
			if (
				sd3neg >= sd2neg ||
				sd2neg >= sd1neg ||
				sd1neg >= median ||
				median >= sd1pos ||
				sd1pos >= sd2pos ||
				sd2pos >= sd3pos
			) {
				return false;
			}
			return true;
		},
		{
			message:
				"SD boundaries must be properly ordered: sd3neg < sd2neg < sd1neg < median < sd1pos < sd2pos < sd3pos"
		}
	);
export const UpdateLmsReferenceSchema = createUpdateSchema(lmsReference);

export const GrowthAlertsSchema = createSelectSchema(growthAlert);
export const CreateGrowthAlertsSchema = createInsertSchema(growthAlert).extend({
	zScore: HealthcareValidators.zScore(),
	deltaZScore: z.number().optional()
});
export const UpdateGrowthAlertsSchema = createUpdateSchema(growthAlert);

export const UpdateGrowthChartCacheSchema = createUpdateSchema(growthChartCache);

export const CreateGrowthPercentileHistorySchema = createInsertSchema(growthPercentileHistory);
export const UpdateGrowthPercentileHistorySchema = createUpdateSchema(growthPercentileHistory);

export const CreateVelocityStandardSchema = createInsertSchema(velocityStandard);
export const UpdateVelocityStandardSchema = createUpdateSchema(velocityStandard);

// --- Import ---
export const CreateImportBatchSchema = createInsertSchema(importBatch);
export const UpdateImportBatchSchema = createUpdateSchema(importBatch);
export const NutritionalAssessmentCreateInputSchema = createInsertSchema(nutritionalAssessment).extend({
	assessmentDate: z.date({ error: "Assessment date is required" }),
	weightKg: HealthcareValidators.weightKg(),
	heightCm: HealthcareValidators.heightCm(),
	bmi: HealthcareValidators.bmi(),
	weightForAgeZ: HealthcareValidators.zScore(),
	heightForAgeZ: HealthcareValidators.zScore(),
	bmiForAgeZ: HealthcareValidators.zScore(),
	headCircumferenceForAgeZ: HealthcareValidators.zScore(),
	weightPercentile: HealthcareValidators.percentile(),
	heightPercentile: HealthcareValidators.percentile(),
	bmiPercentile: HealthcareValidators.percentile(),
	headCircumferenceCm: z
		.number()
		.min(20, "Head circumference below viable range")
		.max(70, "Head circumference exceeds viable range")
		.optional(),
	midUpperArmCircumferenceCm: z
		.number()
		.min(5, "MUAC below viable range")
		.max(40, "MUAC exceeds viable range")
		.optional()
});
export type NutritionalAssessmentCreateInput = z.infer<typeof NutritionalAssessmentCreateInputSchema>;
// ============================================
// 4. COMPILE-TIME TYPES (NATIVE DRIZZLE PROPERTIES)
// ============================================

export type NewDbTwoFactor = typeof twoFactor.$inferInsert;
export type CreateVerificationInput = typeof verification.$inferInsert;
export type UpdateVerificationInput = Partial<CreateVerificationInput>;

// Core Types
export type DbFolder = typeof folder.$inferSelect;
export type CreateFolderInput = typeof folder.$inferInsert;
export type NewFolder = typeof folder.$inferInsert;

export type NewFile = typeof file.$inferInsert;
export type DbFile = typeof file.$inferSelect;
export type CreateFileInput = typeof file.$inferInsert;

export type NewConfigStore = typeof configStore.$inferInsert;
export type DbConfigStore = typeof configStore.$inferSelect;
export type CreateConfigStoreInput = typeof configStore.$inferInsert;
export type ConfigStore = typeof configStore.$inferSelect;

export type NewInvite = typeof invite.$inferInsert;
export type DbInvite = typeof invite.$inferSelect;
export type CreateInviteInput = typeof invite.$inferInsert;
export type Invite = typeof invite.$inferSelect;

// Clinic Types
export type NewClinic = typeof clinic.$inferInsert;
export type DbClinic = typeof clinic.$inferSelect;
export type CreateClinicInput = typeof clinic.$inferInsert;
export type Clinic = typeof clinic.$inferSelect;

export type NewClinicMember = typeof clinicMember.$inferInsert;
export type DbClinicMember = typeof clinicMember.$inferSelect;
export type CreateClinicMemberInput = typeof clinicMember.$inferInsert;
export type ClinicMember = typeof clinicMember.$inferSelect;

export type NewClinicSetting = typeof clinicSetting.$inferInsert;
export type DbClinicSetting = typeof clinicSetting.$inferSelect;
export type CreateClinicSettingInput = typeof clinicSetting.$inferInsert;
export type ClinicSetting = typeof clinicSetting.$inferSelect;

// Staff Types
export type NewDoctor = typeof doctor.$inferInsert;
export type DbDoctor = typeof doctor.$inferSelect;
export type CreateDoctorInput = typeof doctor.$inferInsert;
export type Doctor = typeof doctor.$inferSelect;

export type NewWorkingDay = typeof workingDay.$inferInsert;
export type DbWorkingDay = typeof workingDay.$inferSelect;
export type CreateWorkingDayInput = typeof workingDay.$inferInsert;
export type WorkingDay = typeof workingDay.$inferSelect;

export type NewStaff = typeof staff.$inferInsert;
export type DbStaff = typeof staff.$inferSelect;
export type CreateStaffInput = typeof staff.$inferInsert;
export type Staff = typeof staff.$inferSelect;

// Patient Types
export type NewPatient = typeof patient.$inferInsert;
export type DbPatient = typeof patient.$inferSelect;
export type CreatePatientInput = typeof patient.$inferInsert;
export type Patient = typeof patient.$inferSelect;
// export type CreateUserInput = typeof user.$inferInsert;
export type NewGuardian = typeof guardian.$inferInsert;
export type DbGuardian = typeof guardian.$inferSelect;
export type CreateGuardianInput = typeof guardian.$inferInsert;
export type Guardian = typeof guardian.$inferSelect;

// Appointment Types
export type NewAppointment = typeof appointment.$inferInsert;
export type DbAppointment = typeof appointment.$inferSelect;
export type CreateAppointmentInput = typeof appointment.$inferInsert;
export type Appointment = typeof appointment.$inferSelect;
export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;
// Medical Types
export type NewMedicalRecord = typeof medicalRecord.$inferInsert;
export type DbMedicalRecord = typeof medicalRecord.$inferSelect;
export type CreateMedicalRecordInput = typeof medicalRecord.$inferInsert;
export type MedicalRecord = typeof medicalRecord.$inferSelect;

export type NewVitalSign = typeof vitalSign.$inferInsert;
export type DbVitalSign = typeof vitalSign.$inferSelect;
export type CreateVitalSignInput = typeof vitalSign.$inferInsert;
export type VitalSign = typeof vitalSign.$inferSelect;

export type NewImmunization = typeof immunization.$inferInsert;
export type DbImmunization = typeof immunization.$inferSelect;
export type CreateImmunizationInput = typeof immunization.$inferInsert;
export type Immunization = typeof immunization.$inferSelect;

export type NewAdverseEvent = typeof adverseEvent.$inferInsert;
export type DbAdverseEvent = typeof adverseEvent.$inferSelect;
export type CreateAdverseEventInput = typeof adverseEvent.$inferInsert;
export type AdverseEvent = typeof adverseEvent.$inferSelect;

// Service Types
export type NewService = typeof service.$inferInsert;
export type DbService = typeof service.$inferSelect;
export type CreateServiceInput = typeof service.$inferInsert;
export type Service = typeof service.$inferSelect;

export type NewLabTest = typeof labTest.$inferInsert;
export type DbLabTest = typeof labTest.$inferSelect;
export type CreateLabTestInput = typeof labTest.$inferInsert;
export type LabTest = typeof labTest.$inferSelect;

// Payment Types
export type NewPayment = typeof payment.$inferInsert;
export type DbPayment = typeof payment.$inferSelect;
export type CreatePaymentInput = typeof payment.$inferInsert;
export type Payment = typeof payment.$inferSelect;

export type NewPatientBill = typeof patientBill.$inferInsert;
export type DbPatientBill = typeof patientBill.$inferSelect;
export type CreatePatientBillInput = typeof patientBill.$inferInsert;
export type PatientBill = typeof patientBill.$inferSelect;

// Medication Types
export type NewPrescription = typeof prescription.$inferInsert;
export type DbPrescription = typeof prescription.$inferSelect;
export type CreatePrescriptionInput = typeof prescription.$inferInsert;
export type Prescription = typeof prescription.$inferSelect;

export type NewDrug = typeof drug.$inferInsert;
export type DbDrug = typeof drug.$inferSelect;
export type CreateDrugInput = typeof drug.$inferInsert;
export type Drug = typeof drug.$inferSelect;

export type NewDoseGuideline = typeof doseGuideline.$inferInsert;
export type DbDoseGuideline = typeof doseGuideline.$inferSelect;
export type CreateDoseGuidelineInput = typeof doseGuideline.$inferInsert;
export type DoseGuideline = typeof doseGuideline.$inferSelect;

export type NewPrescribedItem = typeof prescribedItem.$inferInsert;
export type DbPrescribedItem = typeof prescribedItem.$inferSelect;
export type CreatePrescribedItemInput = typeof prescribedItem.$inferInsert;
export type PrescribedItem = typeof prescribedItem.$inferSelect;

export type NewMedicationDispense = typeof medicationDispense.$inferInsert;
export type DbMedicationDispense = typeof medicationDispense.$inferSelect;
export type CreateMedicationDispenseInput = typeof medicationDispense.$inferInsert;
export type MedicationDispense = typeof medicationDispense.$inferSelect;

export type NewPrescriptionLog = typeof prescriptionLog.$inferInsert;
export type DbPrescriptionLog = typeof prescriptionLog.$inferSelect;
export type CreatePrescriptionLogInput = typeof prescriptionLog.$inferInsert;
export type PrescriptionLog = typeof prescriptionLog.$inferSelect;

// Vaccine Types
export type NewVaccineSchedule = typeof vaccineSchedule.$inferInsert;
export type DbVaccineSchedule = typeof vaccineSchedule.$inferSelect;
export type CreateVaccineScheduleInput = typeof vaccineSchedule.$inferInsert;
export type VaccineSchedule = typeof vaccineSchedule.$inferSelect;

export type NewVaccineInventory = typeof vaccineInventory.$inferInsert;
export type DbVaccineInventory = typeof vaccineInventory.$inferSelect;
export type CreateVaccineInventoryInput = typeof vaccineInventory.$inferInsert;
export type VaccineInventory = typeof vaccineInventory.$inferSelect;

// Growth Types
export type NewMeasurement = typeof measurement.$inferInsert;
export type DbMeasurement = typeof measurement.$inferSelect;
export type CreateMeasurementInput = typeof measurement.$inferInsert;
export type Measurement = typeof measurement.$inferSelect;

export type NewLmsReference = typeof lmsReference.$inferInsert;
export type DbLmsReference = typeof lmsReference.$inferSelect;
export type CreateLmsReferenceInput = typeof lmsReference.$inferInsert;
export type LmsReference = typeof lmsReference.$inferSelect;

export type NewGrowthAlerts = typeof growthAlert.$inferInsert;
export type DbGrowthAlerts = typeof growthAlert.$inferSelect;
export type CreateGrowthAlertsInput = typeof growthAlert.$inferInsert;
export type GrowthAlerts = typeof growthAlert.$inferSelect;

export type NewGrowthChartCache = typeof growthChartCache.$inferInsert;
export type DbGrowthChartCache = typeof growthChartCache.$inferSelect;
export type CreateGrowthChartCacheInput = typeof growthChartCache.$inferInsert;
export type GrowthChartCache = typeof growthChartCache.$inferSelect;

export type NewGrowthPercentileHistory = typeof growthPercentileHistory.$inferInsert;
export type DbGrowthPercentileHistory = typeof growthPercentileHistory.$inferSelect;
export type CreateGrowthPercentileHistoryInput = typeof growthPercentileHistory.$inferInsert;
export type GrowthPercentileHistory = typeof growthPercentileHistory.$inferSelect;

export type NewVelocityStandard = typeof velocityStandard.$inferInsert;
export type DbVelocityStandard = typeof velocityStandard.$inferSelect;
export type CreateVelocityStandardInput = typeof velocityStandard.$inferInsert;
export type VelocityStandard = typeof velocityStandard.$inferSelect;

// Feeding Types
export type NewFeedingLog = typeof feedingLog.$inferInsert;
export type DbFeedingLog = typeof feedingLog.$inferSelect;
export type CreateFeedingLogInput = typeof feedingLog.$inferInsert;
export type FeedingLog = typeof feedingLog.$inferSelect;

// Notification Types
export type NewNotification = typeof notification.$inferInsert;
export type DbNotification = typeof notification.$inferSelect;
export type CreateNotificationInput = typeof notification.$inferInsert;
export type Notification = typeof notification.$inferSelect;

// Import Types
export type NewImportBatch = typeof importBatch.$inferInsert;
export type DbImportBatch = typeof importBatch.$inferSelect;
export type CreateImportBatchInput = typeof importBatch.$inferInsert;
export type ImportBatch = typeof importBatch.$inferSelect;

// ============================================
// 5. UTILITY HELPERS FOR COMMON OPERATIONS
// ============================================

/**
 * Helper to create a partial update schema (all fields optional)
 */
// export const extendWithHealthcareValidation = <T extends z.ZodRawShape>(baseSchema: z.ZodObject<T>) => {
// 	return baseSchema.extend({
// 		clinicId: z.uuid(),
// 		lastUpdated: z.coerce.date().default(new Date())
// 	});
// };

export const createPartialUpdateSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => schema.partial();

/**
 * Type-safe wrapper for validating healthcare data with custom rules
 */
export const validateHealthcareData = <T extends z.ZodSchema>(
	schema: T,
	data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError<z.infer<T>> } => {
	try {
		const validated = schema.parse(data);
		return { success: true, data: validated };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, errors: error as z.ZodError<z.infer<T>> };
		}
		throw error;
	}
};

/**
 * Validate measurement data with cross-field validation
 */
export const validateMeasurementData = (data: unknown) => validateHealthcareData(CreateMeasurementSchema, data);

/**
 * Validate payment data with cross-field validation
 */
export const validatePaymentData = (data: unknown) => validateHealthcareData(CreatePaymentSchema, data);

/**
 * Validate patient data with age validation
 */
export const validatePatientData = (data: unknown) => validateHealthcareData(CreatePatientSchema, data);

// ============================================
// 6. SCHEMA TYPES WITH ENUMS (For TypeScript)
// ============================================

export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
export type BloodGroup = (typeof bloodGroupEnum.enumValues)[number];
export type FeedingType = (typeof feedingTypeEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type ImmunizationStatus = (typeof immunizationStatusEnum.enumValues)[number];
export type MaritalStatus = (typeof maritalStatusEnum.enumValues)[number];
export type NotificationStatus = (typeof notificationStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PrescriptionStatus = (typeof prescriptionStatusEnum.enumValues)[number];
export type ReferenceSource = (typeof referenceSourceEnum.enumValues)[number];
export type Role = (typeof roleEnum.enumValues)[number];
export type Severity = (typeof severityEnum.enumValues)[number];
export type SyncStatus = (typeof syncStatusEnum.enumValues)[number];
export type Weekday = (typeof weekdayEnum.enumValues)[number];

export default {
	// Schemas
	FolderSchema,
	CreateFolderSchema,
	UpdateFolderSchema,
	FileSchema,
	CreateFileSchema,
	UpdateFileSchema,
	ConfigStoreSchema,
	CreateConfigStoreSchema,
	UpdateConfigStoreSchema,
	InviteSchema,
	CreateInviteSchema,
	UpdateInviteSchema,
	ClinicSchema,
	CreateClinicSchema,
	UpdateClinicSchema,
	ClinicMemberSchema,
	CreateClinicMemberSchema,
	UpdateClinicMemberSchema,
	ClinicSettingSchema,
	CreateClinicSettingSchema,
	UpdateClinicSettingSchema,
	DoctorSchema,
	CreateDoctorSchema,
	UpdateDoctorSchema,
	WorkingDaySchema,
	CreateWorkingDaySchema,
	UpdateWorkingDaySchema,
	StaffSchema,
	CreateStaffSchema,
	UpdateStaffSchema,
	PatientSchema,
	CreatePatientSchema,
	UpdatePatientSchema,
	GuardianSchema,
	CreateGuardianSchema,
	UpdateGuardianSchema,
	AppointmentSchema,
	CreateAppointmentSchema,
	UpdateAppointmentSchema,
	MedicalRecordSchema,
	CreateMedicalRecordSchema,
	UpdateMedicalRecordSchema,
	VitalSignSchema,
	CreateVitalSignSchema,
	UpdateVitalSignSchema,
	ImmunizationSchema,
	CreateImmunizationSchema,
	UpdateImmunizationSchema,
	ServiceSchema,
	CreateServiceSchema,
	UpdateServiceSchema,
	LabTestSchema,
	CreateLabTestSchema,
	UpdateLabTestSchema,
	PaymentSchema,
	CreatePaymentSchema,
	UpdatePaymentSchema,
	PatientBillSchema,
	CreatePatientBillSchema,
	UpdatePatientBillSchema,
	PrescriptionSchema,
	CreatePrescriptionSchema,
	UpdatePrescriptionSchema,
	DrugSchema,
	CreateDrugSchema,
	UpdateDrugSchema,
	DoseGuidelineSchema,
	CreateDoseGuidelineSchema,
	UpdateDoseGuidelineSchema,
	PrescribedItemSchema,
	CreatePrescribedItemSchema,
	UpdatePrescribedItemSchema,
	MedicationDispenseSchema,
	CreateMedicationDispenseSchema,
	UpdateMedicationDispenseSchema,
	PrescriptionLogSchema,
	CreatePrescriptionLogSchema,
	UpdatePrescriptionLogSchema,
	VaccineScheduleSchema,
	CreateVaccineScheduleSchema,
	UpdateVaccineScheduleSchema,
	AdverseEventSchema,
	CreateAdverseEventSchema,
	UpdateAdverseEventSchema,
	VaccineInventorySchema,
	CreateVaccineInventorySchema,
	UpdateVaccineInventorySchema,
	MeasurementSchema,
	CreateMeasurementSchema,
	UpdateMeasurementSchema,
	LmsReferenceSchema,
	CreateLmsReferenceSchema,
	UpdateLmsReferenceSchema,
	GrowthAlertsSchema,
	CreateGrowthAlertsSchema,
	UpdateGrowthAlertsSchema,
	GrowthChartCacheSchema,
	UpdateGrowthChartCacheSchema,
	GrowthPercentileHistorySchema,
	CreateGrowthPercentileHistorySchema,
	UpdateGrowthPercentileHistorySchema,
	VelocityStandardSchema,
	CreateVelocityStandardSchema,
	UpdateVelocityStandardSchema,
	ImportBatchSchema,
	CreateImportBatchSchema,
	UpdateImportBatchSchema,
	FeedingLogSchema,
	CreateFeedingLogSchema,
	UpdateFeedingLogSchema,
	NotificationSchema,
	CreateNotificationSchema,
	UpdateNotificationSchema,

	// Utilities
	validateHealthcareData,
	validateMeasurementData,
	validatePaymentData,
	validatePatientData,
	createPartialUpdateSchema
};

export type PaymentStaus = (typeof paymentStatusEnum.enumValues)[number];

export const createCompleteEncounterSchema = z.object({
	medicalRecord: MedicalRecordCreateSchema,
	diagnoses: DiagnosisCreateSchema.array(),
	vitalSigns: VitalSignCreateSchema.array(),
	measurements: CreateMeasurementSchema.array()
});
