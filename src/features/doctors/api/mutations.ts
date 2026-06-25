// products/doctors/api/mutations.ts
import { mutationOptions } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query-client";

import { doctorKeys } from "./queries";
import { createDoctor, deleteDoctor, saveWorkingDays, softDeleteDoctor, updateDoctor, upsertDoctor } from "./service";
import type { DoctorMutationPayload, WorkingDay } from "./types";

export const createDoctorMutation = mutationOptions({
	mutationFn: (data: DoctorMutationPayload) => createDoctor(data),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.all });
	}
});

export const updateDoctorMutation = mutationOptions({
	mutationFn: ({ id, values }: { id: string; values: DoctorMutationPayload }) => updateDoctor(id, values),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.all });
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.detail(variables.id) });
	}
});

export const upsertDoctorMutation = mutationOptions({
	mutationFn: (data: DoctorMutationPayload) => upsertDoctor(data),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.all });
	}
});

export const deleteDoctorMutation = mutationOptions({
	mutationFn: (id: string) => deleteDoctor(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.all });
	}
});

export const softDeleteDoctorMutation = mutationOptions({
	mutationFn: (id: string) => softDeleteDoctor(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.all });
	}
});

export const saveWorkingDaysMutation = mutationOptions({
	mutationFn: ({ doctorId, workingDays }: { doctorId: string; workingDays: WorkingDay[] }) =>
		saveWorkingDays(doctorId, workingDays),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.workingDays(variables.doctorId) });
		getQueryClient().invalidateQueries({ queryKey: doctorKeys.schedule(variables.doctorId) });
	}
});
