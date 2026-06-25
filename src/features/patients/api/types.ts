// products/patients/api/types.ts
import type z from "zod";
import type { RecordStatus } from "#/db/schema";
import type { MeasurementCreateSchema } from "../../../db/zod";
import type {
	createPatientSchema,
	measurementSchema,
	patientListFilterSchema,
	patientSchema,
	updatePatientSchema
} from "../schemas/patient";

export type PatientFilters = {
	page?: number;
	limit?: number;
	clinicId: string;
	search?: string;
	gender?: "boy" | "girl" | "other";
	status?: string;
	isActive?: boolean;
	bloodGroup?: string;
};

export type PatientMutationPayload = {
	firstName: string;
	lastName: string;
	dateOfBirth: Date;
	gender: "boy" | "girl" | "other";
	email?: string | null;
	phone?: string | null;
	address?: string | null;
	emergencyContactName?: string | null;
	emergencyContactNumber?: string | null;
	relation?: string | null;
	allergies?: string | null;
	medicalConditions?: string | null;
	medicalHistory?: string | null;
	bloodGroup?: string | null;
	maritalStatus?: string | null;
	image?: string | null;
	colorCode?: string | null;
	isActive?: boolean;
};

export type PatientsResponse = {
	success: boolean;
	time: string;
	message: string;
	total: number;
	offset: number;
	limit: number;
	patients: Patient[];
};

export type PatientByIdResponse = {
	success: boolean;
	time: string;
	message: string;
	patient: Patient;
};

export type PatientWithDetailsResponse = Patient & {
	age: {
		years: number;
		months: number;
		days: number;
		totalMonths: number;
	};
	ageGroup: string;
	appointments?: Array<{
		id: string;
		appointmentDate: Date;
		status: string;
		type: string;
		doctor: {
			id: string;
			name: string;
			specialty: string;
		};
	}>;
	measurements?: Measurement[];
	growthAlerts?: Array<{
		id: string;
		alertType: string;
		severity: string;
		message: string;
		createdAt: Date;
	}>;
	medicalRecords?: Array<{
		id: string;
		diagnosis: string;
		createdAt: Date;
		status: RecordStatus;
		doctor: {
			name: string;
			specialty: string;
		};
	}>;
};

export type GrowthChartData = {
	patientId: string;
	measurements: Array<{
		ageMonths: number;
		date: Date;
		weight: number | null;
		height: number | null;
		bmi: number | null;
		headCircumference: number | null;
		zScores: {
			weightForAge: number | null;
			heightForAge: number | null;
			bmiForAge: number | null;
			headForAge: number | null;
		};
		percentiles: {
			weight: number | null;
			height: number | null;
			bmi: number | null;
			head: number | null;
		};
	}>;
	referenceLines: Array<{
		ageMonths: number;
		sd3neg: number;
		sd2neg: number;
		sd1neg: number;
		median: number;
		sd1pos: number;
		sd2pos: number;
		sd3pos: number;
	}>;
};

export type GrowthSummary = {
	latestMeasurement: {
		date: Date;
		ageMonths: number;
		weight: number | null;
		height: number | null;
		bmi: number | null;
		weightZ: number | null;
		heightZ: number | null;
		bmiZ: number | null;
		weightPercentile: number | null;
		heightPercentile: number | null;
		bmiPercentile: number | null;
	} | null;
	trends: {
		weight: { current: number; change: number; changePercent: number };
		height: { current: number; change: number; changePercent: number };
		bmi: { current: number; change: number; changePercent: number };
		weightZ: { current: number; change: number; changePercent: number };
		heightZ: { current: number; change: number; changePercent: number };
		bmiZ: { current: number; change: number; changePercent: number };
	};
	alerts: Array<{
		id: string;
		alertType: string;
		severity: string;
		message: string;
		recommendation: string;
		createdAt: Date;
	}>;
	totalMeasurements: number;
};

export type PatientStats = {
	totalAppointments: number;
	completedAppointments: number;
	cancelledAppointments: number;
	totalPayments: number;
	paidAmount: number;
	dueAmount: number;
	totalPrescriptions: number;
	activePrescriptions: number;
	totalImmunizations: number;
	lastVisit: Date | null;
	nextAppointment: Date | null;
};

export type CreateMeasurementInput = typeof MeasurementCreateSchema;
export type Patient = z.infer<typeof patientSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientListFilters = z.infer<typeof patientListFilterSchema>;
export type Measurement = z.infer<typeof measurementSchema>;
