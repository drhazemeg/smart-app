import { mutationOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { medicalRecordKeys } from "./queries";
import { createMedicalRecordFn, deleteMedicalRecordFn, updateMedicalRecordFn } from "./service";
import type { MedicalRecordMutationPayload } from "./types";

export const createMedicalRecordMutation = mutationOptions({
	mutationFn: (data: MedicalRecordMutationPayload) => createMedicalRecordFn(data),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: medicalRecordKeys.all });
	}
});

export const updateMedicalRecordMutation = mutationOptions({
	mutationFn: ({ id, values }: { id: string; values: Partial<MedicalRecordMutationPayload> }) =>
		updateMedicalRecordFn(id, values),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: medicalRecordKeys.all });
		getQueryClient().invalidateQueries({
			queryKey: medicalRecordKeys.detail(variables.id)
		});
	}
});

export const deleteMedicalRecordMutation = mutationOptions({
	mutationFn: (id: string) => deleteMedicalRecordFn(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: medicalRecordKeys.all });
	}
});
