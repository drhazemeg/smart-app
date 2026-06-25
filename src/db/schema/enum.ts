import { pgEnum } from "drizzle-orm/pg-core";

export const reminderMethodEnum = pgEnum("reminder_method", ["SMS", "EMAIL", "PUSH", "CALL"]);
export const reminderStatusEnum = pgEnum("reminder_status", ["PENDING", "SENT", "FAILED", "CANCELLED"]);

// ============================================
// ENUMS (Domain-Specific)
// ============================================
export const nutritionalStatusEnum = pgEnum("nutritional_status", [
	"NORMAL",
	"UNDERWEIGHT",
	"OVERWEIGHT",
	"OBESE",
	"MALNOURISHED"
]);
export const statusEnum = pgEnum("status", [
	"ACTIVE",
	"INACTIVE",
	"PENDING",
	"SUSPENDED",
	"COMPLETED",
	"CANCELLED",
	"EXPIRED",
	"ON_HOLD"
]);
// Core Identity
export const roleEnum = pgEnum("role", ["admin", "doctor", "staff", "patient"]);
export const genderEnum = pgEnum("gender", ["boy", "girl", "other"]);

// Status Enums (Separated by Domain)
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
	"PENDING",
	"CONFIRMED",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW"
]);
export const recordStatusEnum = pgEnum("record_status", ["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const prescriptionStatusEnum = pgEnum("prescription_status", [
	"ACTIVE",
	"COMPLETED",
	"CANCELLED",
	"EXPIRED",
	"ON_HOLD"
]);
export const immunizationStatusEnum = pgEnum("immunization_status", ["COMPLETED", "PENDING", "CANCELLED", "OVERDUE"]);
export const paymentStatusEnum = pgEnum("payment_status", ["PAID", "UNPAID", "PENDING", "REFUNDED", "PARTIAL"]);
export const labTestStatusEnum = pgEnum("lab_test_status", ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const syncStatusEnum = pgEnum("sync_status", ["PENDING", "SYNCED", "CONFLICT"]);

// Medical Enums
export const bloodGroupEnum = pgEnum("blood_group", [
	"A_POSITIVE",
	"A_NEGATIVE",
	"B_POSITIVE",
	"B_NEGATIVE",
	"O_POSITIVE",
	"O_NEGATIVE",
	"AB_POSITIVE",
	"AB_NEGATIVE"
]);
export const maritalStatusEnum = pgEnum("marital_status", ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"]);
export const doctorTypeEnum = pgEnum("doctor_type", ["FULL", "PART_TIME", "CONSULTANT", "VISITING"]);
export const availabilityStatusEnum = pgEnum("availability_status", ["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]);
export const weekdayEnum = pgEnum("weekday", [
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY"
]);
export const doctorStatusEnum = pgEnum("doctor_status", ["ACTIVE", "INACTIVE", "SUSPENDED"]);

// Growth & Nutrition Enums
export const measurementTypeEnum = pgEnum("measurement_type", ["WEIGHT", "HEIGHT", "BMI"]);
export const referenceSourceEnum = pgEnum("reference_source", ["WHO_2006", "WHO_2007", "EGYPT_2020", "CDC_2000"]);
export const nutritionalClassificationEnum = pgEnum("nutritional_classification", [
	"SEVERE_ACUTE_MALNUTRITION",
	"MODERATE_ACUTE_MALNUTRITION",
	"AT_RISK",
	"NORMAL",
	"OVERWEIGHT",
	"OBESE",
	"SEVERE_OBESITY"
]);
export const stuntingStatusEnum = pgEnum("stunting_status", ["SEVERE_STUNTING", "MODERATE_STUNTING", "NORMAL", "TALL"]);
export const wastingStatusEnum = pgEnum("wasting_status", [
	"SEVERE_WASTING",
	"MODERATE_WASTING",
	"NORMAL",
	"OVERWEIGHT"
]);
export const feedingTypeEnum = pgEnum("feeding_type", [
	"EXCLUSIVE_BREASTFEEDING",
	"MIXED",
	"FORMULA",
	"SOLID_FOODS",
	"UNKNOWN"
]);
export const breastEnum = pgEnum("breast", ["LEFT", "RIGHT", "BOTH"]);

// Medication Enums
export const drugRouteEnum = pgEnum("drug_route", [
	"ORAL",
	"INTRAVENOUS",
	"INTRAMUSCULAR",
	"SUBCUTANEOUS",
	"TOPICAL",
	"INHALATION",
	"RECTAL"
]);
export const frequencyEnum = pgEnum("frequency", [
	"ONCE_DAILY",
	"TWICE_DAILY",
	"THREE_TIMES_DAILY",
	"FOUR_TIMES_DAILY",
	"EVERY_OTHER_DAY",
	"WEEKLY",
	"MONTHLY",
	"AS_NEEDED"
]);

// Alert & Notification Enums
export const alertTypeEnum = pgEnum("alert_type", [
	"SEVERE_UNDERWEIGHT",
	"MODERATE_UNDERWEIGHT",
	"SEVERE_STUNTING",
	"MODERATE_STUNTING",
	"OBESITY",
	"SEVERE_OBESITY",
	"GROWTH_PLATEAU",
	"RAPID_WEIGHT_GAIN",
	"POOR_WEIGHT_GAIN",
	"HEAD_GROWTH_ABNORMALITY"
]);
export const alertSeverityEnum = pgEnum("alert_severity", ["INFO", "WARNING", "CRITICAL"]);
export const notificationStatusEnum = pgEnum("notification_status", ["READ", "UNREAD"]);
export const notificationPriorityEnum = pgEnum("notification_priority", ["HIGH", "MEDIUM", "LOW"]);
export const severityEnum = pgEnum("severity", ["MILD", "MODERATE", "SEVERE", "CRITICAL"]);
export const importStatusEnum = pgEnum("import_status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);
export const chartTypeEnum = pgEnum("chart_type", ["WEIGHT", "HEIGHT", "BMI", "HEAD", "VELOCITY"]);
export const metricEnum = pgEnum("metric", ["WEIGHT", "HEIGHT", "BMI"]);
export const velocityParameterEnum = pgEnum("velocity_parameter", ["WEIGHT_VELOCITY", "HEIGHT_VELOCITY"]);

// Payment Enums
export const paymentMethodEnum = pgEnum("payment_method", [
	"CASH",
	"CARD",
	"INSURANCE",
	"BANK_TRANSFER",
	"MOBILE_MONEY"
]);
