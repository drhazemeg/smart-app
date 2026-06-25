// src/features/auth/api/queries.ts
import { queryOptions } from "@tanstack/react-query";
import type { Session } from "./client";
import { authClient, useSession } from "./client";

export const authQueries = {
	session: () =>
		queryOptions({
			queryKey: ["auth", "session"],
			queryFn: async () => {
				const { data, error } = await authClient.getSession();
				if (error) throw new Error(error.message);
				return data as Session;
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: true,
			refetchOnMount: true
		}),

	user: () =>
		queryOptions({
			queryKey: ["auth", "user"],
			queryFn: async () => {
				const session = await authClient.getSession();
				return session.data?.user;
			},
			staleTime: 5 * 60 * 1000
		})
};

export function useAuthSession() {
	const { data, isPending, error } = useSession();
	return {
		session: data,
		isLoading: isPending,
		error,
		isAuthenticated: !!data?.user
	};
}
