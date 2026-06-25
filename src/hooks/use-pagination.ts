type UsePaginationProps = {
	currentPage: number;
	totalPages: number;
	paginationItemsToDisplay: number;
};

type UsePaginationReturn = {
	pages: number[];
	showLeftEllipsis: boolean;
	showRightEllipsis: boolean;
};

export function usePagination({
	currentPage,
	totalPages,
	paginationItemsToDisplay
}: UsePaginationProps): UsePaginationReturn {
	function calculatePaginationRange(): number[] {
		// If total pages is less than or equal to display count, show all pages
		if (totalPages <= paginationItemsToDisplay) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const halfDisplay = Math.floor(paginationItemsToDisplay / 2);

		let start = Math.max(1, currentPage - halfDisplay);
		let end = Math.min(totalPages, currentPage + halfDisplay);

		// Adjust if we're at the beginning
		if (start === 1) {
			end = Math.min(paginationItemsToDisplay, totalPages);
		}

		// Adjust if we're at the end
		if (end === totalPages) {
			start = Math.max(1, totalPages - paginationItemsToDisplay + 1);
		}

		// Ensure we have exactly paginationItemsToDisplay items when possible
		if (end - start + 1 < paginationItemsToDisplay && totalPages >= paginationItemsToDisplay) {
			if (start === 1) {
				end = Math.min(paginationItemsToDisplay, totalPages);
			} else if (end === totalPages) {
				start = Math.max(1, totalPages - paginationItemsToDisplay + 1);
			} else {
				// Center the range
				const diff = paginationItemsToDisplay - (end - start + 1);
				const halfDiff = Math.floor(diff / 2);
				start = Math.max(1, start - halfDiff);
				end = Math.min(totalPages, end + (diff - halfDiff));
			}
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	const pages = calculatePaginationRange();

	// Determine ellipsis display based on the actual pages shown
	// ... existing code ...

	// Determine ellipsis display based on the actual pages shown
	const showLeftEllipsis = pages.length > 0 && (pages[0] ?? 0) > 1 && pages[0] !== 2;

	// Updated lines using .at(-1)
	const showRightEllipsis = pages.length > 0 && (pages.at(-1) ?? 0) < totalPages && pages.at(-1) !== totalPages - 1;

	return {
		pages,
		showLeftEllipsis,
		showRightEllipsis
	};
}
