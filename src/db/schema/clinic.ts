import {
	type AnyPgColumn,
	boolean,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	real,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from "drizzle-orm/pg-core";
import { generateId } from "@/utils/id";
import { user } from "./auth";
import {
	alertSeverityEnum,
	alertTypeEnum,
	appointmentStatusEnum,
	availabilityStatusEnum,
	bloodGroupEnum,
	breastEnum,
	chartTypeEnum,
	doctorStatusEnum,
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
	paymentMethodEnum,
	paymentStatusEnum,
	prescriptionStatusEnum,
	recordStatusEnum,
	referenceSourceEnum,
	reminderMethodEnum,
	reminderStatusEnum,
	roleEnum,
	severityEnum,
	stuntingStatusEnum,
	syncStatusEnum,
	velocityParameterEnum,
	wastingStatusEnum,
	weekdayEnum
} from "./enum";

// ============================================
// SECTION 2: CLINIC & ORGANIZATION
// ============================================

export const clinic = pgTable(
	"clinic",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		name: text("name").notNull().unique(),
		email: text("email"),
		phone: text("phone"),
		address: text("address"),
		timezone: text("timezone").notNull().default("UTC"),
		isDefault: boolean("is_default").notNull().default(false),
		isDeleted: boolean("is_deleted").notNull().default(false),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("clinic_is_deleted_idx").on(table.isDeleted), index("clinic_default_idx").on(table.isDefault)]
);

export const clinicMember = pgTable(
	"clinic_member",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		role: roleEnum("role").notNull().default("staff"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		primaryKey({ columns: [table.userId, table.clinicId] }),
		index("clinic_member_clinic_idx").on(table.clinicId),
		index("clinic_member_user_idx").on(table.userId)
	]
);

export const clinicSetting = pgTable(
	"clinic_setting",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" })
			.unique(),
		openingTime: text("opening_time").notNull(),
		closingTime: text("closing_time").notNull(),
		workingDays: text("working_days").notNull(),
		defaultAppointmentDuration: integer("default_appointment_duration").default(30).notNull(),
		requireEmergencyContact: boolean("require_emergency_contact").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("clinic_setting_clinic_idx").on(table.clinicId)]
);

// ============================================
// SECTION 3: PATIENT MANAGEMENT
// ============================================

export const patient = pgTable(
	"patient",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" })
			.unique(),
		mrn: text("mrn").unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		dateOfBirth: timestamp("date_of_birth", { withTimezone: true }).notNull(),
		gender: genderEnum("gender").notNull().default("boy"),
		email: text("email").unique(),
		phone: text("phone"),
		address: text("address"),
		emergencyContactName: text("emergency_contact_name"),
		emergencyContactNumber: text("emergency_contact_number"),
		relation: text("relation"),
		allergies: text("allergies"),
		medicalConditions: text("medical_conditions"),
		medicalHistory: text("medical_history"),
		bloodGroup: bloodGroupEnum("blood_group"),
		maritalStatus: maritalStatusEnum("marital_status"),
		image: text("image"),
		colorCode: text("color_code"),
		isActive: boolean("is_active").default(true).notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdById: text("created_by_id").references(() => user.id, {
			onDelete: "set null"
		}),
		updatedById: text("updated_by_id").references(() => user.id, {
			onDelete: "set null"
		}),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		// CRITICAL: Composite index for patient lookup by clinic
		index("patient_clinic_lookup_idx").on(table.clinicId, table.isActive, table.isDeleted),
		index("patient_mrn_idx").on(table.mrn),
		index("patient_dob_idx").on(table.dateOfBirth),
		index("patient_name_idx").on(table.lastName, table.firstName),
		index("patient_user_idx").on(table.userId)
	]
);

// ============================================
// SECTION 4: GUARDIAN (FIXED: Standalone Entity)
// ============================================

export const guardian = pgTable(
	"guardian",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" })
			.unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		email: text("email").unique(),
		phone: text("phone"),
		address: text("address"),
		relation: text("relation"),
		isPrimary: boolean("is_primary").default(false),
		isActive: boolean("is_active").default(true).notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("guardian_clinic_idx").on(table.clinicId),
		index("guardian_user_idx").on(table.userId),
		index("guardian_name_idx").on(table.lastName, table.firstName)
	]
);

// Patient-Guardian Junction Table
export const patientGuardian = pgTable(
	"patient_guardian",
	{
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		guardianId: text("guardian_id")
			.notNull()
			.references(() => guardian.id, { onDelete: "cascade" }),
		relationship: text("relationship").notNull(),
		isPrimary: boolean("is_primary").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		primaryKey({ columns: [table.patientId, table.guardianId] }),
		index("patient_guardian_patient_idx").on(table.patientId),
		index("patient_guardian_guardian_idx").on(table.guardianId)
	]
);

// ============================================
// SECTION 5: STAFF & DOCTORS
// ============================================

export const doctor = pgTable(
	"doctor",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		userId: text("user_id")
			.references(() => user.id, { onDelete: "set null" })
			.unique(),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		email: text("email").unique(),
		phone: text("phone"),
		address: text("address"),
		specialty: text("specialty").notNull(),
		department: text("department"),
		licenseNumber: text("license_number"),
		img: text("img"),
		colorCode: text("color_code"),
		appointmentPrice: integer("appointment_price"),
		yearsOfExperience: integer("years_of_experience").default(0).notNull(),
		rating: integer("rating"),
		availabilityStatus: availabilityStatusEnum("availability_status").default("AVAILABLE"),
		availableFromTime: text("available_from_time"),
		availableToTime: text("available_to_time"),
		hospitalAffiliation: text("hospital_affiliation"),
		languages: text("languages").array(),
		education: text("education"),
		certifications: text("certifications").array(),
		availableFromWeekDay: weekdayEnum("available_from_week_day"),
		availableToWeekDay: weekdayEnum("available_to_week_day"),
		status: doctorStatusEnum("status").default("ACTIVE").notNull(),
		type: doctorTypeEnum("type").default("FULL"),
		isActive: boolean("is_active").default(true).notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		// CRITICAL: Composite index for doctor availability queries
		index("doctor_clinic_active_idx").on(table.clinicId, table.isActive),
		index("doctor_specialty_clinic_idx").on(table.specialty, table.clinicId),
		index("doctor_user_idx").on(table.userId),
		index("doctor_is_deleted_idx").on(table.isDeleted)
	]
);

export const workingDay = pgTable(
	"working_day",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		doctorId: text("doctor_id")
			.notNull()
			.references(() => doctor.id, { onDelete: "cascade" }),
		day: weekdayEnum("day").notNull(),
		startTime: text("start_time").notNull(),
		endTime: text("end_time").notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		uniqueIndex("working_day_doctor_day_unique").on(table.doctorId, table.day),
		index("working_day_doctor_idx").on(table.doctorId)
	]
);

export const staff = pgTable(
	"staff",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		userId: text("user_id")
			.references(() => user.id, { onDelete: "set null" })
			.unique(),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		email: text("email").unique(),
		phone: text("phone"),
		address: text("address").notNull(),
		department: text("department"),
		img: text("img"),
		licenseNumber: text("license_number"),
		colorCode: text("color_code"),
		hireDate: timestamp("hire_date", { withTimezone: true }),
		hospitalAffiliation: text("hospital_affiliation"),
		salary: real("salary"),
		languages: text("languages"),
		role: roleEnum("role").notNull().default("staff"),
		isActive: boolean("is_active").default(true).notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("staff_clinic_idx").on(table.clinicId),
		index("staff_user_idx").on(table.userId),
		index("staff_is_active_idx").on(table.isActive),
		index("staff_is_deleted_idx").on(table.isDeleted)
	]
);

// ============================================
// SECTION 6: APPOINTMENTS & SCHEDULING
// ============================================

export const service = pgTable(
	"service",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		serviceName: text("service_name").notNull(),
		description: text("description").notNull(),
		price: integer("price").notNull(),
		category: text("category"),
		duration: integer("duration").notNull().default(30),
		isAvailable: boolean("is_available").default(true).notNull(),
		icon: text("icon"),
		color: text("color"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("service_clinic_idx").on(table.clinicId),
		index("service_name_idx").on(table.serviceName),
		index("service_is_deleted_idx").on(table.isDeleted)
	]
);

export const appointment = pgTable(
	"appointment",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		doctorId: text("doctor_id")
			.notNull()
			.references(() => doctor.id, { onDelete: "cascade" }),
		serviceId: text("service_id").references(() => service.id, {
			onDelete: "set null"
		}),
		patientName: text("patient_name").notNull(),
		doctorName: text("doctor_name").notNull(),
		doctorSpecialty: text("doctor_specialty"),
		appointmentDate: timestamp("appointment_date", {
			withTimezone: true
		}).notNull(),
		time: text("time"),
		durationMinutes: integer("duration_minutes").default(30),
		appointmentPrice: integer("appointment_price"),
		status: appointmentStatusEnum("status").default("PENDING").notNull(),
		type: text("type").notNull(),
		note: text("note"),
		reason: text("reason"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		// CRITICAL: Composite indexes for appointment queries
		index("appointment_clinic_date_status_idx").on(table.clinicId, table.appointmentDate, table.status),
		index("appointment_doctor_date_status_idx").on(table.doctorId, table.appointmentDate, table.status),
		index("appointment_patient_date_idx").on(table.patientId, table.appointmentDate),
		index("appointment_date_idx").on(table.appointmentDate),
		index("appointment_is_deleted_idx").on(table.isDeleted)
	]
);

// ============================================
// SECTION 6.5: APPOINTMENT REMINDERS
// ============================================

export const reminder = pgTable(
	"reminder",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		appointmentId: text("appointment_id")
			.notNull()
			.references(() => appointment.id, {
				onDelete: "cascade"
			}),
		method: reminderMethodEnum("method").notNull(),
		sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
		status: reminderStatusEnum("status").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("reminder_appointment_idx").on(table.appointmentId), index("reminder_status_idx").on(table.status)]
);

// ============================================
// SECTION 7: MEDICAL RECORDS & CLINICAL DATA
// ============================================

export const medicalRecord = pgTable(
	"medical_record",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		appointmentId: text("appointment_id")
			.notNull()
			.references(() => appointment.id, { onDelete: "cascade" }),
		doctorId: text("doctor_id")
			.notNull()
			.references(() => doctor.id, { onDelete: "set null" }),
		diagnosis: text("diagnosis").notNull(),
		symptoms: text("symptoms"),
		treatmentPlan: text("treatment_plan"),
		labRequest: text("lab_request"),
		medications: text("medications"),
		notes: text("notes"),
		attachments: text("attachments"),
		diagnosisDate: timestamp("diagnosis_date", { withTimezone: true }).notNull().defaultNow(),
		followUpDate: timestamp("follow_up_date", { withTimezone: true }),
		status: recordStatusEnum("status").default("ACTIVE").notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		uniqueIndex("medical_record_patient_appointment_unique").on(table.patientId, table.appointmentId),
		index("medical_record_clinic_followup_idx").on(table.clinicId, table.followUpDate),
		index("medical_record_patient_created_idx").on(table.patientId, table.createdAt),
		index("medical_record_doctor_idx").on(table.doctorId),
		index("medical_record_is_deleted_idx").on(table.isDeleted)
	]
);

export const diagnosis = pgTable(
	"diagnosis",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		doctorId: text("doctor_id")
			.notNull()
			.references(() => doctor.id, { onDelete: "set null" }),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "set null"
		}),
		appointmentId: text("appointment_id").references(() => appointment.id, {
			onDelete: "set null"
		}),
		medicalId: text("medical_id")
			.notNull()
			.references(() => medicalRecord.id, { onDelete: "cascade" }),
		date: timestamp("date", { mode: "date" }).defaultNow().notNull(),
		type: text("type"),
		diagnosis: text("diagnosis"),
		status: appointmentStatusEnum("status"),
		treatment: text("treatment"),
		notes: text("notes"),
		symptoms: text("symptoms").notNull(),
		followUpDate: timestamp("follow_up_date", { withTimezone: true }),
		duration: integer("duration"),
		prescribedMedications: text("prescribed_medications"),
		followUpPlan: text("follow_up_plan"),
		deletedAt: timestamp("deleted_at", { mode: "date" }),
		isDeleted: boolean("is_deleted").default(false),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("diagnoses_clinic_date_idx").on(table.clinicId, table.date),
		index("diagnoses_doctor_date_idx").on(table.doctorId, table.date),
		index("diagnoses_patient_date_idx").on(table.patientId, table.date),
		index("diagnoses_is_deleted_idx").on(table.isDeleted)
	]
);

export const vitalSign = pgTable(
	"vital_sign",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		doctorId: text("doctor_id").references(() => doctor.id, {
			onDelete: "cascade"
		}),
		medicalRecordId: text("medical_record_id")
			.notNull()
			.references(() => medicalRecord.id, { onDelete: "cascade" }),
		measurementId: text("measurement_id").references(() => measurement.id, {
			onDelete: "set null"
		}),
		encounterId: text("encounter_id").references(() => medicalRecord.id, {
			onDelete: "set null"
		}),
		recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
		gender: genderEnum("gender"),
		ageDays: integer("age_days"),
		ageMonths: integer("age_months"),
		// Vital Signs (using doublePrecision for clinical precision)
		bodyTemperature: doublePrecision("body_temperature"),
		systolic: integer("systolic"),
		diastolic: integer("diastolic"),
		heartRate: integer("heart_rate"),
		respiratoryRate: integer("respiratory_rate"),
		oxygenSaturation: integer("oxygen_saturation"),
		weight: doublePrecision("weight"),
		height: doublePrecision("height"),
		bmi: doublePrecision("bmi"),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		// CRITICAL: Index for trend analysis
		index("vital_sign_clinic_recorded_idx").on(table.clinicId, table.recordedAt),
		index("vital_sign_patient_recorded_idx").on(table.patientId, table.recordedAt),
		index("vital_sign_encounter_idx").on(table.encounterId)
	]
);

// ============================================
// SECTION 8: MEDICATIONS & PRESCRIPTIONS
// ============================================

export const drug = pgTable(
	"drug",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		genericName: text("generic_name"),
		brandName: text("brand_name"),
		description: text("description"),
		sideEffects: text("side_effects"),
		interactions: text("interactions"),
		contraindications: text("contraindications"),
		quantityInStock: integer("quantity_in_stock").default(0).notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("drug_clinic_idx").on(table.clinicId),
		uniqueIndex("drug_name_clinic_unique").on(table.name, table.clinicId),
		index("drug_is_deleted_idx").on(table.isDeleted)
	]
);

export const doseGuideline = pgTable(
	"dose_guideline",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		drugId: text("drug_id")
			.notNull()
			.references(() => drug.id, { onDelete: "cascade" }),
		route: drugRouteEnum("route").notNull(),
		clinicalIndication: text("clinical_indication").notNull(),
		minDosePerKg: doublePrecision("min_dose_per_kg"),
		maxDosePerKg: doublePrecision("max_dose_per_kg"),
		doseUnit: text("dose_unit").notNull(),
		frequencyDays: text("frequency_days"),
		gestationalAgeWeeksMin: doublePrecision("gestational_age_weeks_min"),
		gestationalAgeWeeksMax: doublePrecision("gestational_age_weeks_max"),
		postNatalAgeDaysMin: doublePrecision("post_natal_age_days_min"),
		postNatalAgeDaysMax: doublePrecision("post_natal_age_days_max"),
		maxDosePer24h: doublePrecision("max_dose_per_24h"),
		stockConcentrationMgMl: doublePrecision("stock_concentration_mg_ml"),
		finalConcentrationMgMl: doublePrecision("final_concentration_mg_ml"),
		minInfusionTimeMin: integer("min_infusion_time_min"),
		compatibilityDiluent: text("compatibility_diluent"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("dose_guideline_drug_idx").on(table.drugId)]
);

export const prescription = pgTable(
	"prescription",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		doctorId: text("doctor_id")
			.notNull()
			.references(() => doctor.id, { onDelete: "set null" }),
		medicalRecordId: text("medical_record_id")
			.notNull()
			.references(() => medicalRecord.id, { onDelete: "cascade" }),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => medicalRecord.id, { onDelete: "cascade" }),
		diagnosis: text("diagnosis").notNull(),
		notes: text("notes"),
		medicationName: text("medication_name"),
		instructions: text("instructions"),
		issuedDate: timestamp("issued_date", { withTimezone: true }).defaultNow().notNull(),
		endDate: timestamp("end_date", { withTimezone: true }),
		validUntil: timestamp("valid_until", { withTimezone: true }),
		status: prescriptionStatusEnum("status").default("ACTIVE").notNull(),
		renewedFromId: text("renewed_from_id"),
		cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
		cancellationReason: text("cancellation_reason"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("prescription_clinic_idx").on(table.clinicId),
		index("prescription_patient_idx").on(table.patientId),
		index("prescription_doctor_idx").on(table.doctorId),
		index("prescription_status_idx").on(table.status)
	]
);

export const prescribedItem = pgTable(
	"prescribed_item",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		prescriptionId: text("prescription_id")
			.notNull()
			.references(() => prescription.id, { onDelete: "cascade" }),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		drugId: text("drug_id")
			.notNull()
			.references(() => drug.id, { onDelete: "restrict" }),
		dosageValue: doublePrecision("dosage_value").notNull(),
		dosageUnit: text("dosage_unit").notNull(),
		frequency: frequencyEnum("frequency").notNull(),
		drugRoute: drugRouteEnum("drug_route").notNull(),
		duration: text("duration").notNull(),
		instructions: text("instructions"),
		refillsRemaining: integer("refills_remaining").default(0).notNull(),
		totalRefills: integer("total_refills").default(0).notNull(),
		lastRefillDate: timestamp("last_refill_date", { withTimezone: true }),
		quantityDispensedTotal: doublePrecision("quantity_dispensed_total").default(0).notNull(),
		notes: text("notes"),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("prescribed_item_prescription_idx").on(table.prescriptionId),
		index("prescribed_item_drug_idx").on(table.drugId),
		index("prescribed_item_clinic_idx").on(table.clinicId)
	]
);

export const medicationDispense = pgTable(
	"medication_dispense",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		prescribedItemId: text("prescribed_item_id")
			.notNull()
			.references(() => prescribedItem.id, { onDelete: "cascade" }),
		prescriptionId: text("prescription_id")
			.notNull()
			.references(() => prescription.id, { onDelete: "cascade" }),
		quantityDispensed: doublePrecision("quantity_dispensed").notNull(),
		lotNumber: text("lot_number"),
		expirationDate: timestamp("expiration_date", { withTimezone: true }),
		dispensedBy: text("dispensed_by")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		dispensedAt: timestamp("dispensed_at", { withTimezone: true }).defaultNow().notNull(),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		index("medication_dispense_prescription_idx").on(table.prescriptionId),
		index("medication_dispense_item_idx").on(table.prescribedItemId)
	]
);

export const prescriptionLog = pgTable(
	"prescription_log",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		prescriptionId: text("prescription_id")
			.notNull()
			.references(() => prescription.id, { onDelete: "cascade" }),
		action: text("action").notNull(),
		performedBy: text("performed_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		details: text("details"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [index("prescription_log_prescription_idx").on(table.prescriptionId)]
);

// ============================================
// SECTION 9: GROWTH & DEVELOPMENT (HIGH PRECISION)
// ============================================

export const measurement = pgTable(
	"measurement",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		medicalRecordId: text("medical_record_id").references(() => medicalRecord.id, { onDelete: "set null" }),

		// Measurement Metadata
		measurementDate: timestamp("measurement_date", {
			withTimezone: true
		}).notNull(),
		measuredBy: text("measured_by"),
		measurementLocation: text("measurement_location"),

		// Age (calculated, stored for fast queries)
		chronologicalAgeMonths: doublePrecision("chronological_age_months").notNull(),
		correctedAgeMonths: doublePrecision("corrected_age_months"),
		gestationalAgeAtMeasurement: integer("gestational_age_at_measurement"),

		// === PRECISE BIOMETRIC FIELDS (doublePrecision) ===
		weightKg: doublePrecision("weight_kg"),
		heightCm: doublePrecision("height_cm"),
		lengthCm: doublePrecision("length_cm"),
		headCircumferenceCm: doublePrecision("head_circumference_cm"),
		chestCircumferenceCm: doublePrecision("chest_circumference_cm"),
		midUpperArmCircumferenceCm: doublePrecision("mid_upper_arm_circumference_cm"),
		tricepsSkinfoldMm: doublePrecision("triceps_skinfold_mm"),
		subscapularSkinfoldMm: doublePrecision("subscapular_skinfold_mm"),

		// Calculated Metrics
		bmi: doublePrecision("bmi"),
		bmiPercentile: doublePrecision("bmi_percentile"),
		weightForLengthPercentile: doublePrecision("weight_for_length_percentile"),

		// Reference Source
		referenceSource: referenceSourceEnum("reference_source").default("WHO_2007"),

		// === Z-SCORES (doublePrecision) ===
		weightForAgeZ: doublePrecision("weight_for_age_z"),
		heightForAgeZ: doublePrecision("height_for_age_z"),
		bmiForAgeZ: doublePrecision("bmi_for_age_z"),
		headCircumferenceForAgeZ: doublePrecision("head_circumference_for_age_z"),
		weightForHeightZ: doublePrecision("weight_for_height_z"),

		// Velocity metrics
		weightVelocityGPerDay: doublePrecision("weight_velocity_g_per_day"),
		heightVelocityCmPerYear: doublePrecision("height_velocity_cm_per_year"),
		headGrowthVelocityCmPerWeek: doublePrecision("head_growth_velocity_cm_per_week"),

		// Growth Percentiles
		weightPercentile: doublePrecision("weight_percentile"),
		heightPercentile: doublePrecision("height_percentile"),

		// Clinical Classifications
		nutritionalStatus: nutritionalClassificationEnum("nutritional_status"),
		stuntingStatus: stuntingStatusEnum("stunting_status"),
		wastingStatus: wastingStatusEnum("wasting_status"),

		// Developmental
		milestones: text("milestones"),
		developmentalAgeMonths: real("developmental_age_months"),

		// Additional Data
		feedingType: feedingTypeEnum("feeding_type"),
		sleepHoursPerDay: real("sleep_hours_per_day"),
		physicalActivityMinutesPerDay: integer("physical_activity_minutes_per_day"),

		// Clinical Notes
		clinicalNotes: text("clinical_notes"),
		recommendations: text("recommendations"),
		followUpPlan: text("follow_up_plan"),
		followUpDate: timestamp("follow_up_date", { withTimezone: true }),

		// Attachments
		attachmentIds: jsonb("attachment_ids").$type<string[] | null>().default(null),

		// Audit
		createdBy: text("created_by"),
		updatedBy: text("updated_by"),
		syncStatus: syncStatusEnum("sync_status").default("PENDING").notNull(),
		version: integer("version").default(1).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		// === CRITICAL: Optimized indexes for chart queries ===
		index("measurement_patient_idx").on(table.patientId),
		index("measurement_date_idx").on(table.measurementDate),

		// CRITICAL: Composite index for chart data queries
		index("measurement_chart_lookup_idx").on(
			table.patientId,
			table.measurementDate,
			table.chronologicalAgeMonths,
			table.weightKg,
			table.heightCm,
			table.bmi,
			table.headCircumferenceCm,
			table.weightForAgeZ,
			table.heightForAgeZ
		),

		// Age-based indexes
		index("measurement_age_idx").on(table.chronologicalAgeMonths),
		index("measurement_corrected_age_idx").on(table.correctedAgeMonths),

		// Classification indexes
		index("measurement_nutritional_status_idx").on(table.nutritionalStatus),
		index("measurement_stunting_idx").on(table.stuntingStatus),

		// Recent measurements index
		index("measurement_recent_idx").on(table.patientId, table.measurementDate, table.referenceSource),

		// Velocity calculations index
		index("measurement_developmental_check_idx").on(table.patientId, table.developmentalAgeMonths),
		index("measurement_velocity_idx").on(table.patientId, table.chronologicalAgeMonths),

		// Composite for reports
		index("measurement_patient_age_z_idx").on(table.patientId, table.chronologicalAgeMonths, table.weightForAgeZ)
	]
);

// ============================================
// SECTION 10: LMS REFERENCES (Unified Lookup)
// ============================================

export const lmsReference = pgTable(
	"lms_reference",
	{
		id: text("id").primaryKey().$defaultFn(generateId),

		// Lookup Key
		gender: genderEnum("gender").notNull(),
		metric: metricEnum("metric").notNull(),
		ageMonths: integer("age_months").notNull(),

		// Age identifier
		ageYM: text("age_ym"),
		ageMonthsDecimal: doublePrecision("age_months_decimal"),

		// === LMS PARAMETERS (doublePrecision) ===
		l: doublePrecision("l").notNull(),
		m: doublePrecision("m").notNull(),
		s: doublePrecision("s").notNull(),

		// === PRE-CALCULATED BOUNDARIES ===
		sd3neg: doublePrecision("sd_3neg").notNull(),
		sd2neg: doublePrecision("sd_2neg").notNull(),
		sd1neg: doublePrecision("sd_1neg").notNull(),
		median: doublePrecision("median").notNull(),
		sd1pos: doublePrecision("sd_1pos").notNull(),
		sd2pos: doublePrecision("sd_2pos").notNull(),
		sd3pos: doublePrecision("sd_3pos").notNull(),

		// Reference Source
		referenceSource: referenceSourceEnum("reference_source").default("EGYPT_2020"),

		// Metadata
		validFromAge: doublePrecision("valid_from_age"),
		validToAge: doublePrecision("valid_to_age"),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		// === CRITICAL: Ultra-fast lookup index ===
		uniqueIndex("lms_lookup_unique_idx").on(table.gender, table.metric, table.ageMonths, table.referenceSource),

		// Supporting indexes
		index("lms_lookup_idx").on(table.gender, table.metric, table.ageMonths),
		index("lms_age_range_idx").on(
			table.gender,
			table.metric,
			table.referenceSource,
			table.validFromAge,
			table.validToAge
		)
	]
);

// ============================================
// SECTION 11: IMMUNIZATIONS & VACCINES
// ============================================

export const vaccineSchedule = pgTable(
	"vaccine_schedule",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		vaccineName: text("vaccine_name").notNull(),
		recommendedAge: text("recommended_age").notNull(),
		ageInDaysMin: integer("age_in_days_min"),
		ageInDaysMax: integer("age_in_days_max"),
		dosesRequired: integer("doses_required").notNull(),
		totalDoses: integer("total_doses"),
		minimumInterval: integer("minimum_interval"),
		isMandatory: boolean("is_mandatory").default(true).notNull(),
		description: text("description"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		uniqueIndex("vaccine_schedule_name_age_unique").on(table.vaccineName, table.recommendedAge),
		index("vaccine_schedule_clinic_idx").on(table.clinicId),
		index("vaccine_schedule_age_range_idx").on(table.ageInDaysMin, table.ageInDaysMax),
		index("vaccine_schedule_is_deleted_idx").on(table.isDeleted)
	]
);

export const vaccineInventory = pgTable(
	"vaccine_inventory",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		vaccineName: text("vaccine_name").notNull(),
		quantity: integer("quantity").notNull().default(0),
		lotNumber: text("lot_number"),
		expirationDate: timestamp("expiration_date", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("vaccine_inventory_clinic_vaccine_idx").on(table.clinicId, table.vaccineName),
		index("vaccine_inventory_expiration_idx").on(table.expirationDate)
	]
);

export const immunization = pgTable(
	"immunization",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		vaccine: text("vaccine").notNull(),
		date: timestamp("date", { withTimezone: true }).notNull(),
		dose: text("dose"),
		lotNumber: text("lot_number"),
		administeredByStaffId: text("administered_by_staff_id").references(() => staff.id, { onDelete: "set null" }),
		vaccineInventoryId: text("vaccine_inventory_id").references(() => vaccineInventory.id, {
			onDelete: "set null"
		}),
		recordId: text("record_id")
			.notNull()
			.references(() => medicalRecord.id, { onDelete: "cascade" }),
		notes: text("notes"),
		isOverDue: boolean("is_overdue").default(false).notNull(),
		status: immunizationStatusEnum("status").default("COMPLETED").notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("immunization_clinic_patient_vaccine_date_idx").on(
			table.clinicId,
			table.patientId,
			table.vaccine,
			table.date
		),
		index("immunization_clinic_patient_date_idx").on(table.clinicId, table.patientId, table.date),
		index("immunization_patient_idx").on(table.patientId),
		index("immunization_is_deleted_idx").on(table.isDeleted)
	]
);

export const adverseEvent = pgTable(
	"adverse_event",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),
		immunizationId: text("immunization_id").references(() => immunization.id, {
			onDelete: "set null"
		}),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		vaccineName: text("vaccine_name").notNull(),
		eventType: text("event_type").notNull(),
		severity: severityEnum("severity").notNull(),
		description: text("description"),
		outcome: text("outcome"),
		treatment: text("treatment"),
		reportedByStaffId: text("reported_by_staff_id").references(() => staff.id, {
			onDelete: "set null"
		}),
		dateReported: timestamp("date_reported", { withTimezone: true }).defaultNow().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("adverse_event_patient_vaccine_idx").on(table.patientId, table.vaccineName),
		index("adverse_event_date_reported_idx").on(table.dateReported),
		index("adverse_event_immunization_idx").on(table.immunizationId)
	]
);

// ============================================
// SECTION 12: BILLING & PAYMENTS
// ============================================

export const patientBill = pgTable(
	"patient_bill",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		billId: text("bill_id").notNull(),
		serviceId: text("service_id")
			.notNull()
			.references(() => service.id, { onDelete: "restrict" }),
		serviceDate: timestamp("service_date", { withTimezone: true }).notNull(),
		quantity: integer("quantity").notNull(),
		unitCost: integer("unit_cost").notNull(),
		totalCost: integer("total_cost").notNull(),
		notes: text("notes"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("patient_bill_clinic_idx").on(table.clinicId),
		index("patient_bill_service_idx").on(table.serviceId),
		index("patient_bill_is_deleted_idx").on(table.isDeleted)
	]
);

export const payment = pgTable(
	"payment",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "restrict" }),
		appointmentId: text("appointment_id").references(() => appointment.id, {
			onDelete: "set null"
		}),
		billId: text("bill_id").references(() => patientBill.id, {
			onDelete: "set null"
		}),
		receiptNumber: integer("receipt_number"),
		totalAmount: integer("total_amount").notNull(),
		amountPaid: integer("amount_paid"),
		discount: integer("discount").default(0),
		insurance: text("insurance"),
		insuranceId: text("insurance_id"),
		paymentMethod: paymentMethodEnum("payment_method").default("CASH").notNull(),
		status: paymentStatusEnum("status").default("UNPAID").notNull(),
		billDate: timestamp("bill_date", { withTimezone: true }).notNull(),
		paymentDate: timestamp("payment_date", { withTimezone: true }),
		dueDate: timestamp("due_date", { withTimezone: true }),
		paidDate: timestamp("paid_date", { withTimezone: true }),
		serviceDate: timestamp("service_date", { withTimezone: true }),
		notes: text("notes"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		// CRITICAL: Payment status queries
		index("payment_clinic_idx").on(table.clinicId),
		index("payment_patient_status_idx").on(table.patientId, table.status),
		index("payment_status_due_date_idx").on(table.status, table.dueDate),
		index("payment_patient_payment_date_idx").on(table.patientId, table.paymentDate),
		index("payment_is_deleted_idx").on(table.isDeleted)
	]
);

// ============================================
// SECTION 13: LABS & DIAGNOSTICS
// ============================================

export const labTest = pgTable(
	"lab_test",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		recordId: text("record_id")
			.notNull()
			.references(() => medicalRecord.id, { onDelete: "cascade" }),
		serviceId: text("service_id")
			.notNull()
			.references(() => service.id, { onDelete: "restrict" }),
		diagnosisId: text("diagnosis_id").references(() => medicalRecord.id, {
			onDelete: "set null"
		}),
		testDate: timestamp("test_date", { withTimezone: true }).notNull(),
		result: text("result").notNull(),
		status: labTestStatusEnum("status").default("PENDING").notNull(),
		notes: text("notes"),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("lab_test_clinic_idx").on(table.clinicId),
		index("lab_test_patient_idx").on(table.patientId),
		index("lab_test_service_idx").on(table.serviceId),
		index("lab_test_record_idx").on(table.recordId),
		index("lab_test_status_idx").on(table.status)
	]
);

// ============================================
// SECTION 14: FEEDING & NUTRITION
// ============================================

export const feedingLog = pgTable(
	"feeding_log",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
		type: feedingTypeEnum("type").notNull(),
		duration: integer("duration"),
		amount: doublePrecision("amount"),
		breast: breastEnum("breast"),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("feeding_log_patient_date_idx").on(table.patientId, table.date),
		index("feeding_log_clinic_idx").on(table.clinicId)
	]
);

export const developmentalMilestones = pgTable(
	"developmental_milestones",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		milestone: text("milestone").notNull(),
		ageAchieved: text("age_achieved").notNull(),
		dateRecorded: timestamp("date_recorded", { withTimezone: true }).notNull(),
		notes: text("notes"),
		createdBy: text("created_by"),
		updatedBy: text("updated_by"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("developmental_milestones_patient_idx").on(table.patientId),
		index("developmental_milestones_date_idx").on(table.dateRecorded)
	]
);

// ============================================
// SECTION 15: NOTIFICATIONS & ALERTS
// ============================================

export type NotificationAction = {
	id: string;
	label: string;
	type?: "redirect" | "api_call" | "workflow" | "modal" | "none";
	style?: "primary" | "danger" | "default";
	route?: string;
	executed?: boolean;
	payload?: Record<string, unknown>;
};

export const notification = pgTable(
	"notification",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		body: text("body").notNull(),
		type: text("type"),
		status: notificationStatusEnum("status").default("UNREAD").notNull(),
		priority: notificationPriorityEnum("priority").default("MEDIUM"),
		actions: jsonb("actions").$type<NotificationAction[] | null>().default([]),
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("notification_user_idx").on(table.userId),
		index("notification_clinic_idx").on(table.clinicId),
		index("notification_status_idx").on(table.status)
	]
);

export const growthAlert = pgTable(
	"growth_alert",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),
		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		measurementId: text("measurement_id")
			.notNull()
			.references(() => measurement.id, { onDelete: "cascade" }),
		alertType: alertTypeEnum("alert_type").notNull(),
		severity: alertSeverityEnum("severity").notNull(),
		zScore: doublePrecision("z_score"),
		previousZScore: doublePrecision("previous_z_score"),
		deltaZScore: doublePrecision("delta_z_score"),
		message: text("message").notNull(),
		patientName: text("patient_name"),
		recommendation: text("recommendation"),
		isResolved: boolean("is_resolved").default(false).notNull(),
		resolvedAt: timestamp("resolved_at", { withTimezone: true }),
		resolvedBy: text("resolved_by"),
		resolutionNote: text("resolution_note"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		index("growth_alert_patient_idx").on(table.patientId),
		index("growth_alert_measurement_idx").on(table.measurementId),
		index("growth_alert_unresolved_idx").on(table.patientId, table.isResolved),
		index("growth_alert_type_severity_idx").on(table.alertType, table.severity)
	]
);

// ============================================
// SECTION 16: UTILITY & CACHE TABLES
// ============================================

export const growthChartCache = pgTable(
	"growth_chart_cache",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),

		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		chartType: chartTypeEnum("chart_type").notNull(),
		referenceSource: referenceSourceEnum("reference_source").notNull(),
		chartData: jsonb("chart_data")
			.$type<{
				measurements: Array<{
					ageMonths: number;
					measurementDate: string;
					value: number;
					zScore: number;
					percentile: number;
				}>;
				references: Array<{
					ageMonths: number;
					sd3neg: number;
					sd2neg: number;
					sd1neg: number;
					median: number;
					sd1pos: number;
					sd2pos: number;
					sd3pos: number;
				}>;
			} | null>()
			.default(null),
		lastCalculatedAt: timestamp("last_calculated_at", { withTimezone: true }).defaultNow().notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		index("growth_chart_cache_patient_chart_idx").on(table.patientId, table.chartType),
		index("growth_chart_cache_expiry_idx").on(table.expiresAt)
	]
);

export const growthPercentileHistory = pgTable(
	"growth_percentile_history",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),

		patientId: text("patient_id")
			.notNull()
			.references(() => patient.id, { onDelete: "cascade" }),
		measurementId: text("measurement_id")
			.notNull()
			.references(() => measurement.id, { onDelete: "cascade" }),
		ageMonths: doublePrecision("age_months").notNull(),
		weightPercentile: doublePrecision("weight_percentile"),
		heightPercentile: doublePrecision("height_percentile"),
		bmiPercentile: doublePrecision("bmi_percentile"),
		headPercentile: doublePrecision("head_percentile"),
		weightChannel: integer("weight_channel"),
		heightChannel: integer("height_channel"),
		bmiChannel: integer("bmi_channel"),
		weightChannelCrossed: boolean("weight_channel_crossed"),
		heightChannelCrossed: boolean("height_channel_crossed"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		index("growth_percentile_patient_idx").on(table.patientId),
		index("growth_percentile_age_idx").on(table.patientId, table.ageMonths)
	]
);

export const velocityStandard = pgTable(
	"velocity_standard",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		gender: genderEnum("gender").notNull(),
		parameter: velocityParameterEnum("parameter").notNull(),
		ageRange: text("age_range").notNull(),
		minAgeMonths: doublePrecision("min_age_months").notNull(),
		maxAgeMonths: doublePrecision("max_age_months").notNull(),
		p3: doublePrecision("p3"),
		p10: doublePrecision("p10"),
		p25: doublePrecision("p25"),
		p50: doublePrecision("p50"),
		p75: doublePrecision("p75"),
		p90: doublePrecision("p90"),
		p97: doublePrecision("p97"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		index("velocity_standard_lookup_idx").on(table.gender, table.parameter, table.minAgeMonths, table.maxAgeMonths)
	]
);

// ============================================
// SECTION 17: IMPORT & DATA MANAGEMENT
// ============================================

export const importBatch = pgTable(
	"import_batch",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		batchId: text("batch_id").notNull().unique(),
		clinicId: text("clinic_id")
			.notNull()
			.references(() => clinic.id, { onDelete: "cascade" }),
		totalRecords: integer("total_records").default(0),
		processedRecords: integer("processed_records").default(0),
		failedRecords: integer("failed_records").default(0),
		status: importStatusEnum("status").default("PENDING").notNull(),
		errorLog: text("error_log"),
		startedAt: timestamp("started_at", { withTimezone: true }),
		completedAt: timestamp("completed_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [
		index("import_batch_batch_idx").on(table.batchId),
		index("import_batch_clinic_status_idx").on(table.clinicId, table.status)
	]
);

// ============================================
// SECTION 18: FILE MANAGEMENT
// ============================================

export const folder = pgTable(
	"folder",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		// FIX: Explicitly type the return as AnyPgColumn to break circular dependency
		parentId: text("parent_id").references((): AnyPgColumn => folder.id, {
			onDelete: "cascade"
		}),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("folder_user_idx").on(table.userId), index("folder_parent_idx").on(table.parentId)]
);

export const file = pgTable(
	"file",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		slug: text("slug").notNull().unique(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		folderId: text("folder_id").references(() => folder.id, {
			onDelete: "cascade"
		}),
		filename: text("filename").notNull(),
		searchText: text("search_text").notNull().default(""),
		size: integer("size").notNull(),
		mimeType: text("mime_type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("file_slug_idx").on(table.slug),
		index("file_search_text_idx").on(table.searchText),
		index("file_folder_idx").on(table.folderId),
		index("file_user_idx").on(table.userId)
	]
);

// ============================================
// SECTION 19: CONFIGURATION & SYSTEM
// ============================================
export const nutritionalAssessment = pgTable("nutritional_assessment", {
	id: text("id").primaryKey().$defaultFn(generateId),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	assessmentDate: timestamp("assessment_date", {
		withTimezone: true
	}).notNull(),
	weightKg: real("weight_kg").notNull(),
	heightCm: real("height_cm").notNull(),
	bmi: real("bmi").notNull(),
	weightForAgeZ: real("weight_for_age_z").notNull(),
	heightForAgeZ: real("height_for_age_z").notNull(),
	bmiForAgeZ: real("bmi_for_age_z").notNull(),
	headCircumferenceForAgeZ: real("head_circumference_for_age_z").notNull(),
	weightPercentile: real("weight_percentile").notNull(),
	heightPercentile: real("height_percentile").notNull(),
	bmiPercentile: real("bmi_percentile").notNull(),
	headCircumferenceCm: real("head_circumference_cm"),
	midUpperArmCircumferenceCm: real("mid_upper_arm_circumference_cm")
});
export const configStore = pgTable("config_store", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const invite = pgTable(
	"invite",
	{
		code: text("code").primaryKey(),
		createdBy: text("created_by").references(() => user.id, {
			onDelete: "set null"
		}),
		usedBy: text("used_by").references(() => user.id, { onDelete: "set null" }),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		usedAt: timestamp("used_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
	},
	table => [index("invite_used_by_idx").on(table.usedBy), index("invite_expires_idx").on(table.expiresAt)]
);

export const whoGrowthStandard = pgTable("who_growth_standards", {
	id: text("id").primaryKey(),
	ageInMonths: real("age_in_months"),
	ageDays: integer("age_days").notNull(),
	gender: genderEnum("gender").notNull(),
	measurementType: measurementTypeEnum("measurement_type").notNull(),
	lValue: real("l_value").notNull(),
	mValue: real("m_value").notNull(),
	sValue: real("s_value").notNull(),
	sd0: real("sd0").notNull(),
	sd1neg: real("sd1neg").notNull(),
	sd1pos: real("sd1pos").notNull(),
	sd2neg: real("sd2neg").notNull(),
	sd2pos: real("sd2pos").notNull(),
	sd3neg: real("sd3neg").notNull(),
	sd3pos: real("sd3pos").notNull(),
	sd4neg: real("sd4neg"),
	sd4pos: real("sd4pos"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});
