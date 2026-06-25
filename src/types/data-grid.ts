import type { RowData } from "@tanstack/react-table";
import type React from "react"; // Added missing React import

export type RowHeightValue = "short" | "medium" | "tall" | "extra-tall";

export interface CellSelectOption {
	label: string;
	value: string;
}

export type Cell =
	| { variant: "short-text" }
	| { variant: "long-text" }
	| {
			variant: "number";
			min?: number;
			max?: number;
			step?: number;
	  }
	| { variant: "select"; options: CellSelectOption[] }
	| { variant: "multi-select"; options: CellSelectOption[] }
	| { variant: "checkbox" }
	| { variant: "date" };

export interface UpdateCell {
	columnId: string;
	rowIndex: number;
	value: unknown;
}

export interface CellPosition {
	columnId: string;
	rowIndex: number;
}

export interface CellRange {
	end: CellPosition;
	start: CellPosition;
}

export interface SelectionState {
	isSelecting: boolean;
	selectedCells: Set<string>;
	selectionRange: CellRange | null;
}

export interface ContextMenuState {
	open: boolean;
	x: number;
	y: number;
}

export type NavigationDirection =
	| "up"
	| "down"
	| "left"
	| "right"
	| "home"
	| "end"
	| "ctrl+home"
	| "ctrl+end"
	| "pageup"
	| "pagedown";

export interface SearchState {
	matchIndex: number;
	onNavigateToNextMatch: () => void;
	onNavigateToPrevMatch: () => void;
	onSearch: (query: string) => void;
	onSearchOpenChange: (open: boolean) => void;
	onSearchQueryChange: (query: string) => void;
	searchMatches: CellPosition[];
	searchOpen: boolean;
	searchQuery: string;
}

// Module declaration moved to the bottom for clean hoisting of internal types
declare module "@tanstack/react-table" {
	// FIXED: Use matching TableMeta type parameters with TanStack React Table
	interface TableMeta<TData extends RowData = RowData> {
		contextMenu?: ContextMenuState;
		dataGridRef?: React.RefObject<HTMLElement | null>;
		editingCell?: CellPosition | null;
		focusedCell?: CellPosition | null;
		getIsActiveSearchMatch?: (rowIndex: number, columnId: string) => boolean;
		getIsCellSelected?: (rowIndex: number, columnId: string) => boolean;
		getIsSearchMatch?: (rowIndex: number, columnId: string) => boolean;
		isScrolling?: boolean;
		onCellClick?: (rowIndex: number, columnId: string, event?: React.MouseEvent) => void;
		onCellContextMenu?: (rowIndex: number, columnId: string, event: React.MouseEvent) => void;
		onCellDoubleClick?: (rowIndex: number, columnId: string) => void;
		onCellEditingStart?: (rowIndex: number, columnId: string) => void;
		onCellEditingStop?: (opts?: { direction?: NavigationDirection; moveToNextRow?: boolean }) => void;
		onCellMouseDown?: (rowIndex: number, columnId: string, event: React.MouseEvent) => void;
		onCellMouseEnter?: (rowIndex: number, columnId: string, event: React.MouseEvent) => void;
		onCellMouseUp?: () => void;
		onColumnClick?: (columnId: string) => void;
		onContextMenuOpenChange?: (open: boolean) => void;
		onDataUpdate?: (props: UpdateCell | UpdateCell[]) => void;
		onRowHeightChange?: (value: RowHeightValue) => void;
		onRowSelect?: (rowIndex: number, checked: boolean, shiftKey: boolean) => void;
		onRowsDelete?: (rowIndices: number[]) => void | Promise<void>;
		rowHeight?: RowHeightValue;
		searchOpen?: boolean;
		selectionState?: SelectionState;
	}
}
