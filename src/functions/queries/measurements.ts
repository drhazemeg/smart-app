// functions/queries/measurements.ts
import { queryOptions } from "@tanstack/react-query";
import { getGrowthChartData } from "../growthChart";
import {
	createMeasurement,
	deleteMeasurement,
	// getGrowthChartData,
	getLatestMeasurement,
	getMeasurementById,
	getMeasurementsByPatient,
	listMeasurements,
	updateMeasurement
} from "../measurements";

export const measurementKeys = {
	all: ["measurements"] as const,
	detail: (id: string) => [...measurementKeys.all, "detail", id] as const,
	byPatient: (patientId: string) => [...measurementKeys.all, "byPatient", patientId] as const,
	list: (filters: { patientId: string; limit?: number; offset?: number; startDate?: Date; endDate?: Date }) =>
		[...measurementKeys.all, "list", filters] as const,
	latest: (patientId: string) => [...measurementKeys.all, "latest", patientId] as const,
	growthChart: (patientId: string, metric: string) =>
		[...measurementKeys.all, "growthChart", patientId, metric] as const
};

export const getMeasurementByIdOptions = (clinicId: string, id: string) =>
	queryOptions({
		queryKey: measurementKeys.detail(id),
		queryFn: ({ signal }) => getMeasurementById({ data: { clinicId, id }, signal }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!id
	});

export const getMeasurementsByPatientOptions = (patientId: string) =>
	queryOptions({
		queryKey: measurementKeys.byPatient(patientId),
		queryFn: ({ signal }) => getMeasurementsByPatient({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const listMeasurementsOptions = (filters: {
	patientId: string;
	limit?: number;
	offset?: number;
	startDate?: Date;
	endDate?: Date;
}) =>
	queryOptions({
		queryKey: measurementKeys.list(filters),
		queryFn: ({ signal }) => listMeasurements({ data: filters, signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5,
		enabled: !!filters.patientId
	});

export const getLatestMeasurementOptions = (patientId: string) =>
	queryOptions({
		queryKey: measurementKeys.latest(patientId),
		queryFn: ({ signal }) => getLatestMeasurement({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 1,
		gcTime: 1000 * 60 * 5,
		enabled: !!patientId
	});

export const getGrowthChartDataOptions = (patientId: string, metric: "weight" | "height" | "bmi") =>
	queryOptions({
		queryKey: measurementKeys.growthChart(patientId, metric),
		queryFn: ({ signal }) => getGrowthChartData({ data: { patientId, metric }, signal }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		enabled: !!patientId
	});

// Export mutations
export const measurementMutations = {
	createMeasurement,
	updateMeasurement,
	deleteMeasurement
};
