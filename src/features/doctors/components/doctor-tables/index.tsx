// products/doctors/components/doctor-tables/index.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { parseSortingState } from "@/lib/parsers";

import { getDoctorsQueryOptions } from "../../api/queries";
import type { AvailabilityStatus, DoctorStatus } from "../../api/types";
import { columns } from "./columns";

const columnIds = columns.map(c => c.id).filter(Boolean) as string[];

export function DoctorTable() {
	const search = useSearch({ strict: false }) as Record<string, unknown>;

	const page = (search.page as number) ?? 1;
	const perPage = (search.perPage as number) ?? 10;
	const searchQuery = search.search as string | undefined;
	const specialty = search.specialty as string | undefined;
	const status = search.status as DoctorStatus | undefined;
	const availabilityStatus = search.availabilityStatus as AvailabilityStatus | undefined;
	const sortStr = search.sort as string | undefined;
	const sort = parseSortingState(sortStr, columnIds);

	const filters = {
		page,
		limit: perPage,
		...(searchQuery && { search: searchQuery }),
		...(specialty && { specialty }),
		...(status && { status }),
		...(availabilityStatus && { availabilityStatus }),
		...(sort.length > 0 && { sort: JSON.stringify(sort) })
	};

	const { data } = useSuspenseQuery(getDoctorsQueryOptions(filters));

	const pageCount = Math.ceil(data.total / perPage);

	const { table } = useDataTable({
		data: data.doctors,
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
						id: "specialty",
						title: "Specialty",
						options: [
							{ value: "Pediatrics", label: "Pediatrics" },
							{ value: "Cardiology", label: "Cardiology" },
							{ value: "Neurology", label: "Neurology" },
							{ value: "Orthopedics", label: "Orthopedics" },
							{ value: "Gynecology", label: "Gynecology" },
							{ value: "General Medicine", label: "General Medicine" }
						]
					},
					{
						id: "availabilityStatus",
						title: "Status",
						options: [
							{ value: "AVAILABLE", label: "Available" },
							{ value: "UNAVAILABLE", label: "Unavailable" },
							{ value: "ON_LEAVE", label: "On Leave" }
						]
					}
				]}
				searchFields={["name", "specialty"]}
				table={table}
			/>
		</DataTable>
	);
}
