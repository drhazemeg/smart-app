import type { Column } from "@tanstack/react-table";
import { dataTableConfig } from "@/config/data-table";
import type { ExtendedColumnFilter, FilterOperator, FilterVariant } from "@/types/data-table";

export function getCommonPinningStyles<TData>({ column }: { column: Column<TData> }): React.CSSProperties {
	const isPinned = column.getIsPinned();
	const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
	const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");

	// Determine shadow based on position
	let boxShadow: string | undefined;
	if (isLastLeft) {
		boxShadow = "-5px 0 5px -5px var(--border) inset";
	} else if (isFirstRight) {
		boxShadow = "5px 0 5px -5px var(--border) inset";
	}

	return {
		boxShadow,
		left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
		right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
		position: isPinned ? "sticky" : "relative",
		background: isPinned ? "var(--background)" : undefined,
		width: column.getSize(),
		zIndex: isPinned ? 1 : 0
	};
}

export function getFilterOperators(filterVariant: FilterVariant) {
	const operatorMap: Record<FilterVariant, { label: string; value: FilterOperator }[]> = {
		text: dataTableConfig.textOperators,
		number: dataTableConfig.numericOperators,
		range: dataTableConfig.numericOperators,
		date: dataTableConfig.dateOperators,
		dateRange: dataTableConfig.dateOperators,
		boolean: dataTableConfig.booleanOperators,
		select: dataTableConfig.selectOperators,
		multiSelect: dataTableConfig.multiSelectOperators
	};

	return operatorMap[filterVariant] ?? dataTableConfig.textOperators;
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
	const operators = getFilterOperators(filterVariant);
	const firstValue = operators[0]?.value;

	if (firstValue) {
		return firstValue;
	}
	return filterVariant === "text" ? "iLike" : "eq";
}

/**
 * Helper to check if a filter value is considered "empty"
 */
function isValueEmpty(value: unknown): boolean {
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return value === "" || value === null || value === undefined;
}

export function getValidFilters<TData>(filters: ExtendedColumnFilter<TData>[]): ExtendedColumnFilter<TData>[] {
	return filters.filter(filter => {
		const isEmptyOperator = filter.operator === "isEmpty" || filter.operator === "isNotEmpty";

		return isEmptyOperator || !isValueEmpty(filter.value);
	});
}
