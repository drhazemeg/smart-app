// src/functions/queries/patient.ts
import { queryOptions } from "@tanstack/react-query";
import * as patient from "../patient";
import { getPatient, getPatientWithFullHistory, listPatients } from "../patient";

export const patientKeys = {
	all: ["patients"] as const,
	lists: () => [...patientKeys.all, "list"] as const,

	detail: (id: string) => [...patientKeys.all, "detail", id] as const,
	byMRN: (mrn: string) => [...patientKeys.all, "mrn", mrn] as const,
	byClinic: (clinicId: string) => [...patientKeys.all, "clinic", clinicId] as const,
	list: (filters: { patientId: string; limit?: number; offset?: number }) =>
		[...patientKeys.lists(), filters] as const,
	byAgeRange: (minAge: number, maxAge: number) => [...patientKeys.all, "ageRange", minAge, maxAge] as const,
	byDateRange: (from: Date, to: Date) => [...patientKeys.all, "dateRange", from, to] as const,
	search: (q: string) => [...patientKeys.all, "search", q] as const,
	upcomingAppointments: (patientId: string, limit: number) =>
		[...patientKeys.all, "upcoming", patientId, limit] as const,
	fullHistory: (id: string) => [...patientKeys.all, "fullHistory", id] as const,
	summary: (id: string) => [...patientKeys.all, "summary", id] as const,
	needingAttention: () => [...patientKeys.all, "attention"] as const,
	count: () => [...patientKeys.all, "count"] as const
};

// ============================================
// GET by ID
// ============================================

export const getPatientByIdOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.detail(id),
		queryFn: ({ signal }) => patient.getPatient({ data: { id }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// ============================================
// GET by MRN
// ============================================

export const getPatientByMRNOptions = (mrn: string) =>
	queryOptions({
		queryKey: patientKeys.byMRN(mrn),
		queryFn: ({ signal }) => patient.getPatientByMRN({ data: { mrn }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

// ============================================
// GET by Clinic
// ============================================

export const getPatientsByClinicOptions = (clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.byClinic(clinicId),
		queryFn: ({ signal }) => patient.getPatientByClinicId({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// ============================================
// GET by Age Range
// ============================================

export const getPatientsByAgeRangeOptions = (minAge: number, maxAge: number) =>
	queryOptions({
		queryKey: patientKeys.byAgeRange(minAge, maxAge),
		queryFn: ({ signal }) =>
			patient.getPatientsByAgeRange({
				data: { minAge, maxAge },
				signal
			}),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

// ============================================
// GET by Date Range (Created Between)
// ============================================

export const getPatientOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.detail(id),
		queryFn: () => getPatient({ data: { id } }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30
	});

export const getPatientWithFullHistoryOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.fullHistory(id),
		queryFn: () => getPatientWithFullHistory({ data: { id } }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 30
	});

export const getPatientsCreatedBetweenOptions = (from: Date, to: Date) =>
	queryOptions({
		queryKey: patientKeys.byDateRange(from, to),
		queryFn: ({ signal }) =>
			patient.getPatientsCreatedBetween({
				data: { from, to },
				signal
			}),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

// ============================================
// GET in Date Range (Date of Birth)
// ============================================

export const getPatientsInDateRangeOptions = (from: Date, to: Date) =>
	queryOptions({
		queryKey: patientKeys.byDateRange(from, to),
		queryFn: ({ signal }) =>
			patient.getPatientsInDateRange({
				data: { from, to },
				signal
			}),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

// ============================================
// Search Patients
// ============================================

export const searchPatientsOptions = (q: string, limit?: number) =>
	queryOptions({
		queryKey: patientKeys.search(q),
		queryFn: ({ signal }) =>
			patient.searchPatients({
				data: { q, limit },
				signal
			}),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: q.length >= 2
	});

// ============================================
// Get Patients Count
// ============================================

export const getPatientsCountOptions = () =>
	queryOptions({
		queryKey: patientKeys.count(),
		queryFn: ({ signal }) => patient.getPatientsCount({ signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// ============================================
// Get Patient Growth Summary
// ============================================

export const getPatientSummaryOptions = (id: string) =>
	queryOptions({
		queryKey: patientKeys.summary(id),
		queryFn: ({ signal }) => patient.getPatientGrowthSummary({ data: { id }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// ============================================
// Get Patient Upcoming Appointments
// ============================================

export const getPatientUpcomingAppointmentsOptions = (patientId: string, limit = 10) =>
	queryOptions({
		queryKey: patientKeys.upcomingAppointments(patientId, limit),
		queryFn: ({ signal }) =>
			patient.getPatientUpcomingAppointments({
				data: { patientId, limit },
				signal
			}),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// ============================================
// Get Patients Needing Attention
// ============================================

export const getPatientsNeedingAttentionOptions = () =>
	queryOptions({
		queryKey: patientKeys.needingAttention(),
		queryFn: ({ signal }) => patient.getPatientsNeedingAttention({ signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// ============================================
// List Patients (Paginated)
// ============================================

export const listPatientsOptions = (filters: {
	clinicId?: string;
	limit?: number;
	offset?: number;
	search?: string;
	status?: string;
	gender?: "boy" | "girl" | "other";
}) =>
	queryOptions({
		queryKey: patientKeys.lists(),
		queryFn: ({ signal }) =>
			listPatients({
				data: {
					clinicId: filters.clinicId ?? "",
					limit: filters.limit ?? 10,
					offset: filters.offset ?? 0,
					search: filters.search,
					status: undefined,
					gender: filters.gender as "boy" | "girl" | "other" | undefined
				},
				signal
			}),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getPatientRecordsOptions = (filters: { patientId: string; limit?: number; offset?: number }) =>
	queryOptions({
		queryKey: patientKeys.list(filters),
		queryFn: ({ signal }) =>
			patient.getPatientRecords({
				data: {
					patientId: filters.patientId,
					limit: filters.limit ?? 10,
					offset: filters.offset ?? 0
				},
				signal
			}),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// export const getPatientAppointmentsOptions = (filters: {
// 	patientId: string;
// 	limit?: number;
// 	offset?: number;
// }) =>
// 	queryOptions({
// 		queryKey: patientKeys.list(filters),
// 		queryFn: ({ signal }) =>
// 			patient.getPatientAppointments({
// 				data: {
// 					patientId: filters.patientId,
// 					limit: filters.limit ?? 10,
// 					offset: filters.offset ?? 0,
// 				},
// 				signal,
// 			}),
// 		staleTime: 1000 * 60 * 1, // 1 minute
// 		gcTime: 1000 * 60 * 5, // 5 minutes
// 	});

// export const getAppointmentByIdOptions = (id: string, clinicId: string) =>
// 	queryOptions({
// 		queryKey: patientKeys.detail(id),
// 		queryFn: ({ signal }) =>
// 			getAppointmentById({ data: { id, clinicId }, signal }),
// 		staleTime: 1000 * 60 * 2, // 2 minutes
// 		gcTime: 1000 * 60 * 5, // 5 minutes
// 	});
