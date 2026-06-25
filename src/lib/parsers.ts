import { z } from "zod";
import { dataTableConfig } from "@/config/data-table";
import type { ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table";

/**
 * Helper to normalize columnIds into a Set or null
 */
function getValidKeys(columnIds?: string[] | Set<string>): Set<string> | null {
	if (!columnIds) {
		return null;
	}
	return columnIds instanceof Set ? columnIds : new Set(columnIds);
}

const sortingItemSchema = z.object({
	id: z.string(),
	desc: z.boolean()
});

export function parseSortingState<TData>(
	value: string | undefined,
	columnIds?: string[] | Set<string>
): ExtendedColumnSort<TData>[] {
	if (!value) {
		return [];
	}

	const validKeys = getValidKeys(columnIds);

	try {
		const parsed = JSON.parse(value);
		const result = z.array(sortingItemSchema).safeParse(parsed);

		if (!result.success || (validKeys && result.data.some(item => !validKeys.has(item.id)))) {
			return [];
		}

		return result.data as ExtendedColumnSort<TData>[];
	} catch {
		return [];
	}
}

export function serializeSortingState<TData>(value: ExtendedColumnSort<TData>[]): string {
	return JSON.stringify(value);
}

const filterItemSchema = z.object({
	id: z.string(),
	value: z.union([z.string(), z.array(z.string())]),
	variant: z.enum(dataTableConfig.filterVariants),
	operator: z.enum(dataTableConfig.operators),
	filterId: z.string()
});

export type FilterItemSchema = z.infer<typeof filterItemSchema>;

export function parseFiltersState<TData>(
	value: string | undefined,
	columnIds?: string[] | Set<string>
): ExtendedColumnFilter<TData>[] {
	if (!value) {
		return [];
	}

	const validKeys = getValidKeys(columnIds);

	try {
		const parsed = JSON.parse(value);
		const result = z.array(filterItemSchema).safeParse(parsed);

		if (!result.success || (validKeys && result.data.some(item => !validKeys.has(item.id)))) {
			return [];
		}

		return result.data as ExtendedColumnFilter<TData>[];
	} catch {
		return [];
	}
}

export function serializeFiltersState<TData>(value: ExtendedColumnFilter<TData>[]): string {
	return JSON.stringify(value);
}
