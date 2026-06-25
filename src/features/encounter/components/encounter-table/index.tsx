// features/encounters/components/encounter-tables/index.tsx

import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { parseSortingState } from "@/lib/parsers";
import { getEncountersQueryOptions } from "../../api/querries";
import { encounterStatusOptions, encounterTypeOptions } from "../../constants/encounter-options";
import { columns } from "./column";

const columnIds = columns.map(c => c.id).filter(Boolean) as string[];

export function EncounterTable() {
	const search = useSearch({ strict: false }) as Record<string, unknown>;

	const page = (search.page as number) ?? 1;
	const perPage = (search.perPage as number) ?? 10;
	const searchQuery = search.search as string | undefined;
	const status = search.status as string | undefined;
	const type = search.type as string | undefined;
	const patientId = search.patientId as string | undefined;
	const doctorId = search.doctorId as string | undefined;
	const fromDate = search.fromDate as string | undefined;
	const toDate = search.toDate as string | undefined;
	const sortStr = search.sort as string | undefined;
	const sort = parseSortingState(sortStr, columnIds);

	const clinicId = "current-clinic-id";

	const filters = {
		clinicId,
		page,
		limit: perPage,
		...(searchQuery && { search: searchQuery }),
		...(status && { status }),
		...(type && { type }),
		...(patientId && { patientId }),
		...(doctorId && { doctorId }),
		...(fromDate && { fromDate }),
		...(toDate && { toDate }),
		...(sort.length > 0 && { sort: JSON.stringify(sort) })
	};

	const { data } = useSuspenseQuery(getEncountersQueryOptions(filters));

	const pageCount = Math.ceil(data.total / perPage);

	const { table } = useDataTable({
		data: data.encounters,
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
						id: "status",
						title: "Status",
						options: encounterStatusOptions
					},
					{
						id: "type",
						title: "Type",
						options: encounterTypeOptions
					}
				]}
				searchFields={["patientName", "doctorName", "diagnosis"]}
				table={table}
			/>
		</DataTable>
	);
}
