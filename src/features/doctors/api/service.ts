// features/doctors/api/service.ts
// ============================================================
// Doctor Service — Data Access Layer
// ============================================================

import {
	createDoctor as createDoctorFn,
	deleteDoctor as deleteDoctorFn,
	getDoctorById as getDoctorByIdFn,
	getDoctorPerformance as getDoctorPerformanceFn,
	getDoctorWithSchedule as getDoctorWithScheduleFn,
	getWorkingDays as getWorkingDaysFn,
	listDoctors as listDoctorsFn,
	softDeleteDoctor as softDeleteDoctorFn,
	updateDoctor as updateDoctorFn,
	upsertDoctor as upsertDoctorFn
} from "@/functions/doctor";
import { getClinicId } from "@/lib/clinic-utils";

import type {
	AvailabilityStatus,
	Doctor,
	DoctorByIdResponse,
	DoctorFilters,
	DoctorMutationPayload,
	DoctorPerformanceResponse,
	DoctorScheduleResponse,
	DoctorStatus,
	DoctorsResponse,
	WeekDay,
	WorkingDay
} from "./types";

// ============================================================
// Type Definitions (move to types.ts)
// ============================================================

// ============================================================
// Helper Functions
// ============================================================

const toWeekDayEnum = (value: WeekDay | string | null | undefined): WeekDay | null | undefined => {
	if (!value) return undefined;
	const upper = typeof value === "string" ? value.toUpperCase() : value;
	if (["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].includes(upper as string)) {
		return upper as WeekDay;
	}
	return undefined;
};

const normalizeWorkingDay = (day: WorkingDay): WorkingDay => ({
	id: day.id || crypto.randomUUID?.() || `temp-${Date.now()}`,
	doctorId: day.doctorId,
	day: toWeekDayEnum(day.day) || "MONDAY",
	startTime: day.startTime || "09:00",
	endTime: day.endTime || "17:00",
	isActive: day.isActive ?? true,
	createdAt: day.createdAt || new Date(),
	updatedAt: day.updatedAt || new Date()
});

// ============================================================
// Service Functions
// ============================================================

export async function getDoctors(filters: DoctorFilters): Promise<DoctorsResponse> {
	const clinicId = await getClinicId();

	const result = await listDoctorsFn({
		data: {
			clinicId,
			limit: filters.limit || 10,
			offset: ((filters.page || 1) - 1) * (filters.limit || 10),
			search: filters.search,
			specialty: filters.specialty,
			status: filters.status as DoctorStatus | undefined,
			availabilityStatus: filters.availabilityStatus as AvailabilityStatus | undefined
		}
	});

	return {
		success: true,
		time: new Date().toISOString(),
		message: "Doctors fetched successfully",
		total: result.total,
		offset: (filters.page || 1) - 1,
		limit: filters.limit || 10,
		doctors: result.doctors as Doctor[]
	};
}

export async function getDoctorById(id: string): Promise<DoctorByIdResponse> {
	const clinicId = await getClinicId();

	const doctor = await getDoctorByIdFn({
		data: { doctorId: id, clinicId }
	});

	if (!doctor) {
		throw new Error("Doctor not found");
	}

	return {
		success: true,
		time: new Date().toISOString(),
		message: "Doctor fetched successfully",
		doctor: doctor as Doctor
	};
}

export async function getDoctorWithSchedule(id: string): Promise<DoctorScheduleResponse> {
	const clinicId = await getClinicId();

	const result = await getDoctorWithScheduleFn({
		data: { doctorId: id, clinicId }
	});

	if (!result) {
		throw new Error("Doctor not found");
	}

	const normalizedWorkingDays = (result.workingDays || []).map(normalizeWorkingDay);

	return {
		doctor: result as Doctor,
		workingDays: normalizedWorkingDays,
		appointments:
			result.appointments?.map(apt => ({
				id: apt.id,
				patientId: apt.patientId,
				patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : "Unknown",
				appointmentDate: apt.appointmentDate,
				status: apt.status,
				type: apt.type || "Consultation"
			})) || []
	};
}

export async function getDoctorPerformance(
	id: string,
	startDate: Date,
	endDate: Date
): Promise<DoctorPerformanceResponse> {
	const clinicId = await getClinicId();

	const result = await getDoctorPerformanceFn({
		data: { doctorId: id, startDate, endDate, clinicId }
	});

	return {
		totalPatients: result.totalAppointments || 0, // Assuming totalAppointments can be used as a proxy for totalPatients, or default to 0
		completedAppointments: result.completedAppointments,
		cancelledAppointments: result.cancelledAppointments,
		averageRating: 0, // Default value as this is not provided by getDoctorPerformanceFn
		reviews: 0 // Default value as this is not provided by getDoctorPerformanceFn
	};
}

export async function getWorkingDays(doctorId: string): Promise<WorkingDay[]> {
	const result = await getWorkingDaysFn({
		data: { doctorId }
	});
	return result.map(normalizeWorkingDay);
}

export async function createDoctor(data: DoctorMutationPayload): Promise<Doctor> {
	const clinicId = await getClinicId();

	const result = await createDoctorFn({
		data: {
			...data,
			clinicId,
			status: data.status || "ACTIVE",
			yearsOfExperience: data.yearsOfExperience || 0,
			type: data.type || "FULL",
			availabilityStatus: data.availabilityStatus || "AVAILABLE",
			isActive: data.isActive ?? true,
			availableFromWeekDay: toWeekDayEnum(data.availableFromWeekDay),
			availableToWeekDay: toWeekDayEnum(data.availableToWeekDay)
		}
	});

	return result as Doctor;
}

export async function updateDoctor(id: string, data: DoctorMutationPayload): Promise<Doctor> {
	const clinicId = await getClinicId();

	const result = await updateDoctorFn({
		data: {
			id,
			...data,
			clinicId,
			status: data.status || "ACTIVE",
			type: data.type || "FULL",
			availabilityStatus: data.availabilityStatus || "AVAILABLE",
			isActive: data.isActive ?? true,
			availableFromWeekDay: toWeekDayEnum(data.availableFromWeekDay),
			availableToWeekDay: toWeekDayEnum(data.availableToWeekDay)
		}
	});

	return result as Doctor;
}

export async function upsertDoctor(data: DoctorMutationPayload): Promise<Doctor> {
	const clinicId = await getClinicId();

	const result = await upsertDoctorFn({
		data: {
			...data,
			clinicId,
			status: data.status || "ACTIVE",
			yearsOfExperience: data.yearsOfExperience || 0,
			type: data.type || "FULL",
			availabilityStatus: data.availabilityStatus || "AVAILABLE",
			isActive: data.isActive ?? true,
			availableFromWeekDay: toWeekDayEnum(data.availableFromWeekDay),
			availableToWeekDay: toWeekDayEnum(data.availableToWeekDay)
		}
	});

	return result as Doctor;
}

export async function deleteDoctor(id: string): Promise<void> {
	await deleteDoctorFn({
		data: { doctorId: id }
	});
}

export async function softDeleteDoctor(id: string): Promise<Doctor> {
	const clinicId = await getClinicId();

	const result = await softDeleteDoctorFn({
		data: { doctorId: id, clinicId }
	});

	return result as Doctor;
}

export async function saveWorkingDays(doctorId: string, workingDays: WorkingDay[]): Promise<void> {
	const { replaceWorkingDays } = await import("@/functions/doctor");

	const normalizedWorkingDays = workingDays.map(day => ({
		id: day.id || crypto.randomUUID?.() || `temp-${Date.now()}`,
		doctorId: doctorId,
		day: toWeekDayEnum(day.day) || "MONDAY",
		startTime: day.startTime || "09:00",
		endTime: day.endTime || "17:00",
		isActive: day.isActive ?? true,
		createdAt: day.createdAt || new Date(),
		updatedAt: day.updatedAt || new Date()
	}));

	await replaceWorkingDays({
		data: {
			doctorId,
			workingDays: normalizedWorkingDays
		}
	});
}
