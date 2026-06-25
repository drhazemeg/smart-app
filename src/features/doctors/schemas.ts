// products/doctors/schemas/doctor.ts
import * as z from "zod";

export const genderEnum = z.enum(["boy", "girl", "other"]);
export const availabilityStatusEnum = z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]);
export const doctorTypeEnum = z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]);
export const weekdayEnum = z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]);
export const statusEnum = z.enum([
	"ACTIVE",
	"INACTIVE",
	"PENDING",
	"SUSPENDED",
	"COMPLETED",
	"CANCELLED",
	"EXPIRED",
	"ON_HOLD"
]);

export const doctorSchema = z.object({
	id: z.string().optional(),
	userId: z.string().nullable().optional(),
	clinicId: z.string().min(1, "Clinic ID is required"),
	name: z.string().min(1, "Name is required"),
	email: z.email("Invalid email format").nullable().optional(),
	phone: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	specialty: z.string().min(1, "Specialty is required"),
	department: z.string().nullable().optional(),
	licenseNumber: z.string().nullable().optional(),
	img: z.string().nullable().optional(),
	colorCode: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Invalid color code")
		.nullable()
		.optional(),
	appointmentPrice: z.number().min(0, "Price must be non-negative").nullable().optional(),
	yearsOfExperience: z.number().min(0).default(0),
	rating: z.number().min(0).max(5).nullable().optional(),
	availabilityStatus: availabilityStatusEnum.default("AVAILABLE"),
	availableFromTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
		.nullable()
		.optional(),
	availableToTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
		.nullable()
		.optional(),
	availableFromWeekDay: weekdayEnum.nullable().optional(),
	availableToWeekDay: weekdayEnum.nullable().optional(),
	type: doctorTypeEnum.default("FULL"),
	isActive: z.boolean().default(true),
	status: statusEnum.default("ACTIVE"),
	isDeleted: z.boolean().default(false)
});

export const createDoctorSchema = doctorSchema.omit({
	id: true,
	isDeleted: true,
	status: true
});

export const updateDoctorSchema = doctorSchema.partial().extend({
	id: z.string().min(1, "ID is required for updates")
});

export const workingDayBaseSchema = z.object({
	id: z.string().optional(),
	doctorId: z.string().min(1, "Doctor ID is required"),
	day: weekdayEnum,
	startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format"),
	endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format"),
	isActive: z.boolean().default(true)
});

export const workingDaySchema = workingDayBaseSchema.refine(data => data.startTime < data.endTime, {
	message: "Start time must be before end time",
	path: ["endTime"]
});

export const scheduleFormSchema = workingDayBaseSchema.omit({ doctorId: true, id: true });

export const doctorListFilterSchema = z.object({
	clinicId: z.string(),
	search: z.string().optional(),
	specialty: z.string().optional(),
	status: statusEnum.optional(),
	availabilityStatus: availabilityStatusEnum.optional(),
	page: z.number().default(1),
	limit: z.number().default(10)
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type DoctorListFilters = z.infer<typeof doctorListFilterSchema>;
