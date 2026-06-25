// products/patients/components/patient-medical-history.tsx
import { useSuspenseQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { patientWithDetailsOptions } from "../api/queries";

interface PatientMedicalHistoryProps {
	patientId: string;
}

export default function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
	const { data } = useSuspenseQuery(patientWithDetailsOptions(patientId));

	const medicalRecords = data?.medicalRecords || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Medical History</CardTitle>
			</CardHeader>
			<CardContent>
				{medicalRecords.length === 0 ? (
					<p className='text-muted-foreground'>No medical records found</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Diagnosis</TableHead>
								<TableHead>Doctor</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{medicalRecords.map(record => (
								<TableRow key={record.id}>
									<TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
									<TableCell>{record.diagnosis}</TableCell>
									<TableCell>{record.doctor?.name || "N/A"}</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${
												record.status === "ACTIVE"
													? "bg-green-100 text-green-700"
													: record.status === "INACTIVE"
														? "bg-gray-100 text-gray-700"
														: "bg-yellow-100 text-yellow-700"
											}`}
										>
											{record.status}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
