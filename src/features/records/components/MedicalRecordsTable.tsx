import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { FileText, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMedicalRecordsQueryOptions } from "../api/queries";
import type { MedicalRecordFilters } from "../api/types";

interface MedicalRecordsTableProps {
	filters: MedicalRecordFilters;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	ACTIVE: { label: "Active", variant: "default" },
	INACTIVE: { label: "Inactive", variant: "secondary" },
	ARCHIVED: { label: "Archived", variant: "outline" }
};

export function MedicalRecordsTable({ filters }: MedicalRecordsTableProps) {
	const { data: records } = useSuspenseQuery(getMedicalRecordsQueryOptions(filters));

	if (!records || records.length === 0) {
		return (
			<Card>
				<CardContent className='flex h-40 flex-col items-center justify-center text-muted-foreground'>
					<FileText className='mb-2 h-10 w-10 opacity-20' />
					<p>No medical records found for this patient.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<FileText className='h-5 w-5 text-lagoon' />
					Medical Records
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date & Diagnosis</TableHead>
							<TableHead>Doctor</TableHead>
							<TableHead>Treatment Plan</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{records.map(record => (
							<TableRow key={record.id}>
								<TableCell>
									<div>
										<p className='font-medium'>{record.diagnosis || "No Diagnosis"}</p>
										<p className='text-muted-foreground text-xs'>
											{record.diagnosisDate
												? format(new Date(record.diagnosisDate), "MMM d, yyyy")
												: "Date not set"}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Stethoscope className='h-3.5 w-3.5 text-muted-foreground' />
										<span className='text-sm'>Dr. {record.doctor?.name || "Unknown"}</span>
									</div>
								</TableCell>
								<TableCell>
									<p className='line-clamp-2 text-muted-foreground text-sm'>
										{record.treatmentPlan || "—"}
									</p>
								</TableCell>
								<TableCell>
									<Badge variant={statusConfig[record.status]?.variant || "secondary"}>
										{statusConfig[record.status]?.label || record.status}
									</Badge>
								</TableCell>
								<TableCell className='text-right'>
									<Link
										params={{ recordId: record.id }}
										to='/auth/dashboard/medical-records/$recordId'
									>
										<Button
											size='sm'
											variant='ghost'
										>
											View
										</Button>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
