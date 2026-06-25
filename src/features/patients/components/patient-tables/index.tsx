// products/patients/components/patient-tables/index.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { DbPatient } from "#/db";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { clinicStore } from "@/lib/clinic.store";
import { parseSortingState } from "@/lib/parsers";
import { getPatientsQueryOptions } from "../../api/queries";
import { columns } from "./columns";

const columnIds = columns.map(c => c.id).filter(Boolean) as string[];

export function PatientTable() {
	const clinicId = useStore(clinicStore, s => s.currentClinicId) ?? "";
	const search = useSearch({ strict: false }) as Record<string, unknown>;

	const page = (search.page as number) ?? 1;
	const perPage = (search.perPage as number) ?? 10;
	const searchQuery = search.search as string | undefined;
	const gender = search.gender as string | undefined;
	const status = search.status as string | undefined;
	const bloodGroup = search.bloodGroup as string | undefined;
	const sortStr = search.sort as string | undefined;
	const sort = parseSortingState(sortStr, columnIds);

	const filters = {
		clinicId,
		page,
		limit: perPage,
		...(searchQuery && { search: searchQuery }),
		...(gender && { gender: gender as "boy" | "girl" | "other" }),
		...(status && { status }),
		...(bloodGroup && { bloodGroup }),
		...(sort.length > 0 && { sort: JSON.stringify(sort) })
	};

	const { data } = useSuspenseQuery(getPatientsQueryOptions(filters));

	const pageCount = Math.ceil(data.total / perPage);

	const { table } = useDataTable({
		data: data.patients as DbPatient[],
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
						id: "gender",
						title: "Gender",
						options: [
							{ value: "boy", label: "Boy" },
							{ value: "girl", label: "Girl" },
							{ value: "other", label: "Other" }
						]
					},
					{
						id: "bloodGroup",
						title: "Blood Group",
						options: [
							{ value: "A_POSITIVE", label: "A+" },
							{ value: "A_NEGATIVE", label: "A-" },
							{ value: "B_POSITIVE", label: "B+" },
							{ value: "B_NEGATIVE", label: "B-" },
							{ value: "O_POSITIVE", label: "O+" },
							{ value: "O_NEGATIVE", label: "O-" },
							{ value: "AB_POSITIVE", label: "AB+" },
							{ value: "AB_NEGATIVE", label: "AB-" }
						]
					}
				]}
				searchFields={["firstName", "lastName", "mrn", "email", "phone"]}
				table={table}
			/>
		</DataTable>
	);
}
