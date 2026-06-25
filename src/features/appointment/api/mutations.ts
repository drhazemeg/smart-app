import { mutationOptions } from "@tanstack/react-query";

import {
	bulkUpdateAppointmentStatus,
	cancelAppointment,
	completeAppointment,
	createAppointment,
	rescheduleAppointment,
	restoreAppointment,
	softDeleteAppointment,
	updateAppointment,
	updateAppointmentStatus
} from "@/functions/appointment";
import { getQueryClient } from "@/lib/query-client";

import type { AppointmentStatus } from "../../../db";
import { appointmentKeys } from "./queries";

export const createAppointmentMutation = mutationOptions({
	mutationFn: (data: Parameters<typeof createAppointment>[0]["data"]) => createAppointment({ data }),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const updateAppointmentMutation = mutationOptions({
	mutationFn: ({
		id,
		data
	}: {
		id: string;
		clinicId: string;
		data: Parameters<typeof updateAppointment>[0]["data"];
	}) => updateAppointment({ data: { id, ...data } }),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.detail(variables.id, variables.clinicId) });
		// Use list() instead of lists() - lists() requires filters
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const updateAppointmentStatusMutation = mutationOptions({
	mutationFn: ({ id, status }: { id: string; clinicId: string; status: string }) =>
		updateAppointmentStatus({ data: { id, status: status as AppointmentStatus } }),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.detail(variables.id, variables.clinicId) });
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const cancelAppointmentMutation = mutationOptions({
	mutationFn: ({ appointmentId, clinicId, reason }: { appointmentId: string; clinicId: string; reason?: string }) =>
		cancelAppointment({ data: { appointmentId, clinicId, reason: reason ?? "" } }),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({
			queryKey: appointmentKeys.detail(variables.appointmentId, variables.clinicId)
		});
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const rescheduleAppointmentMutation = mutationOptions({
	mutationFn: ({
		appointmentId,
		newDate,
		newTime,
		reason
	}: {
		appointmentId: string;
		clinicId: string;
		newDate: Date;
		newTime: string;
		reason?: string;
	}) => rescheduleAppointment({ data: { appointmentId, newDate, newTime, reason } }),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({
			queryKey: appointmentKeys.detail(variables.appointmentId, variables.clinicId)
		});
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const completeAppointmentMutation = mutationOptions({
	mutationFn: ({ id, notes }: { id: string; clinicId: string; notes?: string }) =>
		completeAppointment({ data: { id, notes } }),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({
			queryKey: appointmentKeys.detail(variables.id, variables.clinicId)
		});
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const bulkUpdateAppointmentStatusMutation = mutationOptions({
	mutationFn: (data: Parameters<typeof bulkUpdateAppointmentStatus>[0]["data"]) =>
		bulkUpdateAppointmentStatus({ data }),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const softDeleteAppointmentMutation = mutationOptions({
	mutationFn: ({ id }: { id: string; clinicId: string }) => softDeleteAppointment({ data: { id } }),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});

export const restoreAppointmentMutation = mutationOptions({
	mutationFn: ({ id }: { id: string; clinicId: string }) => restoreAppointment({ data: { id } }),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: appointmentKeys.all });
	}
});
