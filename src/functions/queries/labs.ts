// functions/queries/labs.ts

import { queryOptions } from "@tanstack/react-query";
import type { LabTestStatus } from "@/db/schema";
import {
	createLabTest,
	deleteLabTest,
	getByPatientId,
	getLabTestById,
	getPatientLabTests,
	getPendingByClinicId,
	getPendingLabTests,
	updateLabTest,
	updateLabTestResults
} from "../labs";

export const labsKeys = {
	all: ["labs"] as const,
	pending: (clinicId: string) => [...labsKeys.all, "pending", clinicId] as const,
	byPatient: (patientId: string) => [...labsKeys.all, "byPatient", patientId] as const,
	patientLabTests: (patientId: string, status?: string) =>
		[...labsKeys.all, "patientLabTests", patientId, status] as const,
	detail: (labTestId: string) => [...labsKeys.all, "detail", labTestId] as const,
	pendingAll: () => [...labsKeys.all, "pendingAll"] as const
};

export const getPendingByClinicIdOptions = (clinicId: string) =>
	queryOptions({
		queryKey: labsKeys.pending(clinicId),
		queryFn: ({ signal }) => getPendingByClinicId({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!clinicId
	});

export const getByPatientIdOptions = (patientId: string) =>
	queryOptions({
		queryKey: labsKeys.byPatient(patientId),
		queryFn: ({ signal }) => getByPatientId({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const getPatientLabTestsOptions = (patientId: string, status?: LabTestStatus) =>
	queryOptions({
		queryKey: labsKeys.patientLabTests(patientId, status),
		queryFn: ({ signal }) => getPatientLabTests({ data: { patientId, status }, signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const getLabTestByIdOptions = (labTestId: string) =>
	queryOptions({
		queryKey: labsKeys.detail(labTestId),
		queryFn: ({ signal }) => getLabTestById({ data: { labTestId }, signal }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!labTestId
	});

export const getPendingLabTestsOptions = () =>
	queryOptions({
		queryKey: labsKeys.pendingAll(),
		queryFn: ({ signal }) => getPendingLabTests({ signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});

// Export mutations as functions (to be used with useMutation)
export const labsMutations = {
	createLabTest,
	updateLabTest,
	updateLabTestResults,
	deleteLabTest
};
