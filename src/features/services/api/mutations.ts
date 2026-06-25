// products/services/api/mutations.ts
import { mutationOptions } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query-client";

import { serviceKeys } from "./queries";
import {
	batchUpdateServicePrices,
	cloneService,
	createService,
	deleteService,
	restoreService,
	softDeleteService,
	updateService
} from "./service";
import type { ServiceMutationPayload } from "./types";

export const createServiceMutation = mutationOptions({
	mutationFn: (data: ServiceMutationPayload) => createService(data),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
	}
});

export const updateServiceMutation = mutationOptions({
	mutationFn: ({ id, values }: { id: string; values: ServiceMutationPayload }) => updateService(id, values),
	onSuccess: (_, variables) => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.detail(variables.id) });
	}
});

export const deleteServiceMutation = mutationOptions({
	mutationFn: (id: string) => deleteService(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
	}
});

export const softDeleteServiceMutation = mutationOptions({
	mutationFn: (id: string) => softDeleteService(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
	}
});

export const restoreServiceMutation = mutationOptions({
	mutationFn: (id: string) => restoreService(id),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
	}
});

export const cloneServiceMutation = mutationOptions({
	mutationFn: ({ id, newClinicId }: { id: string; newClinicId?: string }) => cloneService(id, newClinicId),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
	}
});

export const batchUpdateServicePricesMutation = mutationOptions({
	mutationFn: (updates: Array<{ id: string; price: number }>) => batchUpdateServicePrices(updates),
	onSuccess: () => {
		getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });
	}
});
