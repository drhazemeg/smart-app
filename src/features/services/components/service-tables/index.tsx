// products/services/components/service-tables/index.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { parseSortingState } from "@/lib/parsers";
import { getClinicId } from "../../../../lib/clinic-utils";
import { getServicesQueryOptions } from "../../api/queries";
import { categoryOptions } from "../../constants/service-options";
import type { ServiceCategory } from "../../schemas/service";
import { columns } from "./columns";

const columnIds = columns.map(c => c.id).filter(Boolean) as string[];

export function ServiceTable() {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	// Fetch clinicId using useSuspenseQuery, assuming getClinicId is an async function
	const { data: clinicId } = useSuspenseQuery({ queryKey: ["clinicId"], queryFn: getClinicId });

	const page = (search.page as number) ?? 1;
	const perPage = (search.perPage as number) ?? 10;
	const searchQuery = search.search as string | undefined;
	const category = search.category as string | undefined;
	const isAvailable = search.isAvailable as string | undefined;
	const sortStr = search.sort as string | undefined;
	const sort = parseSortingState(sortStr, columnIds);

	const filters = {
		page,
		clinicId,
		limit: perPage,
		...(searchQuery && { search: searchQuery }),
		...(category && { category: category as ServiceCategory }),
		...(isAvailable !== undefined && { isAvailable: isAvailable === "true" }),
		...(sort.length > 0 && { sort: JSON.stringify(sort) })
	};

	const { data } = useSuspenseQuery(getServicesQueryOptions(filters));

	const pageCount = Math.ceil(data.total / perPage);

	const { table } = useDataTable({
		data: data.services,
		columns,
		pageCount,
		shallow: true,
		debounceMs: 500,
		initialState: {
			columnPinning: { right: ["actions"] }
		}
	});

	return (
		<DataTable table={table}>
			<DataTableToolbar
				filterFields={[
					{
						id: "category",
						title: "Category",
						options: categoryOptions
					},
					{
						id: "isAvailable",
						title: "Availability",
						options: [
							{ value: "true", label: "Available" },
							{ value: "false", label: "Unavailable" }
						]
					}
				]}
				searchFields={["serviceName", "description"]}
				table={table}
			/>
		</DataTable>
	);
}
