// src/hooks/useQueryHelpers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Custom hook for dashboard queries
export function useDashboardQuery<T>(
	key: string[],
	queryFn: () => Promise<T>,
	options?: {
		enabled?: boolean;
		staleTime?: number;
		onSuccess?: (data: T) => void;
		onError?: (error: Error) => void;
	}
) {
	return useQuery({
		queryKey: key,
		queryFn: async () => {
			try {
				const result = await queryFn();
				options?.onSuccess?.(result);
				return result;
			} catch (error) {
				// const errorMessage = error instanceof Error ? error.message : "An error occurred";
				options?.onError?.(error as Error);
				throw error;
			}
		},
		enabled: options?.enabled ?? true,
		staleTime: options?.staleTime ?? 1000 * 60 * 2
	});
}

// Custom hook for mutations with toast notifications
export function useMutationWithToast<TData, TVariables>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options?: {
		onSuccess?: (data: TData, variables: TVariables) => void;
		onError?: (error: Error, variables: TVariables) => void;
		successMessage?: string | ((data: TData) => string);
		errorMessage?: string | ((error: Error) => string);
		invalidateQueries?: string[][];
		resetQueries?: string[][];
	}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: async (data, variables) => {
			// Show success toast
			if (options?.successMessage) {
				const message =
					typeof options.successMessage === "function"
						? options.successMessage(data)
						: options.successMessage;
				toast.success(message);
			}

			// Invalidate queries
			if (options?.invalidateQueries) {
				await Promise.all(
					options.invalidateQueries.map(queryKey => queryClient.invalidateQueries({ queryKey }))
				);
			}

			// Reset queries
			if (options?.resetQueries) {
				await Promise.all(options.resetQueries.map(queryKey => queryClient.resetQueries({ queryKey })));
			}

			options?.onSuccess?.(data, variables);
		},
		// ... inside your mutation hook or options logic
		onError: (error, variables) => {
			// Determine the error message using a clean, non-nested approach
			let errorMessage: string;

			if (typeof options?.errorMessage === "function") {
				errorMessage = options.errorMessage(error);
			} else if (typeof options?.errorMessage === "string") {
				errorMessage = options.errorMessage;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			} else {
				errorMessage = "An error occurred";
			}

			toast.error(errorMessage);

			options?.onError?.(error, variables);
		}
	});
}

// Custom hook for prefetching data
export function usePrefetchQuery() {
	const queryClient = useQueryClient();

	return async <T>(
		key: string[],
		queryFn: () => Promise<T>,
		options?: {
			staleTime?: number;
		}
	) =>
		queryClient.prefetchQuery({
			queryKey: key,
			queryFn,
			staleTime: options?.staleTime ?? 1000 * 60 * 5
		});
}

// Custom hook for optimistic updates
export function useOptimisticUpdate<TData, TVariables>(
	queryKey: string[],
	updateFn: (oldData: TData | undefined, variables: TVariables) => TData,
	options?: {
		onError?: (error: Error, variables: TVariables) => void;
		onSuccess?: (data: TData, variables: TVariables) => void;
	}
) {
	const queryClient = useQueryClient();

	return {
		update: (variables: TVariables) => {
			// Update the cached data optimistically
			queryClient.setQueryData(queryKey, (oldData: TData | undefined) => updateFn(oldData, variables));
		},
		rollback: () => {
			// Invalidate the query to refetch the actual data
			queryClient.invalidateQueries({ queryKey });
		},
		optimisticUpdate: (mutationFn: (variables: TVariables) => Promise<TData>) => {
			return async (variables: TVariables) => {
				try {
					// Update optimistically
					queryClient.setQueryData(queryKey, (oldData: TData | undefined) => updateFn(oldData, variables));

					// Perform the actual mutation
					const result = await mutationFn(variables);

					// Update with the actual result
					queryClient.setQueryData(queryKey, result);

					options?.onSuccess?.(result, variables);
					return result;
				} catch (error) {
					// Rollback on error
					queryClient.invalidateQueries({ queryKey });
					options?.onError?.(error as Error, variables);
					throw error;
				}
			};
		}
	};
}
