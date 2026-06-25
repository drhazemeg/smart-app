import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { parseSortingState } from "@/lib/parsers";

import { getAppointmentsQueryOptions } from "../../api/queries";
import { columns } from "./columns";

const columnIds = columns.map(c => c.id).filter(Boolean) as string[];

export function AppointmentTable() {
	const search = useSearch({ strict: false }) as Record<string, unknown>;

	const page = (search.page as number) ?? 1;
	const perPage = (search.perPage as number) ?? 10;
	const searchQuery = search.search as string | undefined;
	const status = search.status as string | undefined;
	const patientId = search.patientId as string | undefined;
	const doctorId = search.doctorId as string | undefined;
	const fromDate = search.fromDate as string | undefined;
	const toDate = search.toDate as string | undefined;
	const sortStr = search.sort as string | undefined;
	const sort = parseSortingState(sortStr, columnIds);

	const clinicId = "current-clinic-id"; // Replace with actual clinic ID from context/auth

	const filters = {
		clinicId,
		page,
		limit: perPage,
		...(searchQuery && { search: searchQuery }),
		...(status && { status }),
		...(patientId && { patientId }),
		...(doctorId && { doctorId }),
		...(fromDate && { fromDate }),
		...(toDate && { toDate }),
		...(sort.length > 0 && { sort: JSON.stringify(sort) })
	};

	const { data } = useSuspenseQuery(getAppointmentsQueryOptions(filters));

	const pageCount = Math.ceil(data.total / perPage);

	const { table } = useDataTable({
		data: data.appointments,
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
						options: [
							{ value: "PENDING", label: "Pending" },
							{ value: "CONFIRMED", label: "Confirmed" },
							{ value: "COMPLETED", label: "Completed" },
							{ value: "CANCELLED", label: "Cancelled" },
							{ value: "NO_SHOW", label: "No Show" }
						]
					},
					{
						id: "type",
						title: "Type",
						options: [
							{ value: "CHECKUP", label: "Checkup" },
							{ value: "FOLLOW_UP", label: "Follow-up" },
							{ value: "EMERGENCY", label: "Emergency" },
							{ value: "CONSULTATION", label: "Consultation" },
							{ value: "VACCINATION", label: "Vaccination" },
							{ value: "LAB_TEST", label: "Lab Test" }
						]
					}
				]}
				searchFields={["patientName", "doctorName"]}
				table={table}
			/>
		</DataTable>
	);
}
