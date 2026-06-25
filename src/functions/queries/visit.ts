// functions/queries/visit.ts
import { queryOptions } from "@tanstack/react-query";
import { getVisitsFn } from "../visit";

export const visitKeys = {
	all: ["visits"] as const,
	list: () => [...visitKeys.all, "list"] as const
};

export const getVisitsOptions = () =>
	queryOptions({
		queryKey: visitKeys.list(),
		queryFn: ({ signal }) => getVisitsFn({ signal }),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 5
	});
