// features/encounters/api/mutations.ts

import { mutationOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { encounterKeys } from "./querries";
import {
	completeEncounter as completeEncounterFn,
	createEncounter as createEncounterFn,
	deleteEncounter as deleteEncounterFn,
	updateEncounter as updateEncounterFn
} from "./service";
import type { EncounterMutationPayload } from "./type";

export const createEncounterMutation = mutationOptions({
	mutationFn: (data: EncounterMutationPayload) => createEncounterFn(data),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: encounterKeys.all });
	}
});

export const updateEncounterMutation = mutationOptions({
	mutationFn: ({ id, values }: { id: string; values: Partial<EncounterMutationPayload> }) =>
		updateEncounterFn(id, values),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: encounterKeys.all });
		getQueryClient().invalidateQueries({
			queryKey: encounterKeys.detail(variables.id, "")
		});
	}
});

export const deleteEncounterMutation = mutationOptions({
	mutationFn: (id: string) => deleteEncounterFn(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: encounterKeys.all });
	}
});

export const completeEncounterMutation = mutationOptions({
	mutationFn: ({ id, notes }: { id: string; notes?: string }) => completeEncounterFn(id, notes),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: encounterKeys.all });
		getQueryClient().invalidateQueries({
			queryKey: encounterKeys.detail(variables.id, "")
		});
	}
});
