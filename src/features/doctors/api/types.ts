// products/doctors/api/types.ts

// In types.ts:
export type WeekDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type DoctorStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type DoctorType = "FULL" | "PART_TIME" | "CONSULTANT" | "VISITING";
export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "ON_LEAVE";

export interface Doctor {
	id: string;
	userId: string | null;
	clinicId: string;
	name: string;
	email: string | null;
	phone: string | null;
	address: string | null;
	specialty: string;
	department: string | null;
	licenseNumber: string | null;
	img: string | null;
	colorCode: string | null;
	appointmentPrice: number | null;
	yearsOfExperience: number;
	rating: number | null;
	availabilityStatus: AvailabilityStatus | null;
	availableFromTime: string | null;
	availableToTime: string | null;
	hospitalAffiliation: string | null;
	languages: string[] | null;
	education: string | null;
	certifications: string[] | null;
	availableFromWeekDay: WeekDay | null;
	availableToWeekDay: WeekDay | null;
	status: DoctorStatus;
	type: DoctorType | null;
	isActive: boolean;
	isDeleted: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkingDay {
	id: string;
	doctorId: string;
	day: WeekDay;
	startTime: string;
	endTime: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface DoctorMutationPayload {
	name: string;
	specialty: string;
	email?: string | null;
	phone?: string | null;
	address?: string | null;
	department?: string | null;
	licenseNumber?: string | null;
	img?: string | null;
	colorCode?: string | null;
	appointmentPrice?: number | null;
	yearsOfExperience?: number;
	rating?: number | null;
	availabilityStatus?: AvailabilityStatus | null;
	availableFromTime?: string | null;
	availableToTime?: string | null;
	hospitalAffiliation?: string | null;
	languages?: string[] | null;
	education?: string | null;
	certifications?: string[] | null;
	availableFromWeekDay?: WeekDay | null;
	availableToWeekDay?: WeekDay | null;
	status?: DoctorStatus;
	type?: DoctorType | null;
	isActive?: boolean;
	workingDays?: Omit<WorkingDay, "id" | "createdAt" | "updatedAt" | "doctorId">[];
}

export interface DoctorFilters {
	search?: string;
	specialty?: string;
	status?: DoctorStatus;
	availabilityStatus?: AvailabilityStatus;
	page?: number;
	limit?: number;
}

export interface DoctorsResponse {
	success: boolean;
	time: string;
	message: string;
	total: number;
	offset: number;
	limit: number;
	doctors: Doctor[];
}

export interface DoctorByIdResponse {
	success: boolean;
	time: string;
	message: string;
	doctor: Doctor;
}

export interface DoctorScheduleResponse {
	doctor: Doctor;
	workingDays: WorkingDay[];
	appointments: Array<{
		id: string;
		patientId: string;
		patientName: string;
		appointmentDate: Date;
		status: string;
		type: string;
	}>;
}

export interface DoctorPerformanceResponse {
	totalPatients: number;
	completedAppointments: number;
	cancelledAppointments: number;
	averageRating: number;
	reviews: number;
}

export interface WorkingDay {
	id: string;
	doctorId: string;
	day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
	startTime: string;
	endTime: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface DoctorsResponse {
	success: boolean;
	time: string;
	message: string;
	total: number;
	offset: number;
	limit: number;
	doctors: Doctor[];
}

export interface DoctorByIdResponse {
	success: boolean;
	time: string;
	message: string;
	doctor: Doctor;
}

export interface DoctorScheduleResponse {
	doctor: Doctor;
	workingDays: WorkingDay[];
	appointments: Array<{
		id: string;
		patientId: string;
		patientName: string;
		appointmentDate: Date;
		status: string;
		type: string;
	}>;
}

export interface DoctorPerformanceResponse {
	// Define based on your actual performance response
	totalPatients: number;
	completedAppointments: number;
	cancelledAppointments: number;
	averageRating: number;
	reviews: number;
}

export type WorkingDayMutationPayload = {
	day: string;
	startTime: string;
	endTime: string;
	isActive?: boolean;
};
