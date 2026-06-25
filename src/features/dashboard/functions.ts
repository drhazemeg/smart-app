import { createServerFn } from "@tanstack/react-start";
import {
	authMiddleware,
	getAppointmentsInRange,
	getDiagnosesByMedicalRecordId,
	getUpcomingImmunizations,
	listMedicalRecord,
	listPatients
} from "@/functions";

// Server Functions for data fetching
export const getDashboardUpcomingAppointments = createServerFn({
	method: "GET"
})
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const { clinicId } = context;
			const today = new Date();
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + 7);

			// Get appointments for the next 7 days
			const appointments = await getAppointmentsInRange({
				data: {
					clinicId,
					startDate: today,
					endDate: endDate
				}
			});

			return appointments || [];
		} catch (error) {
			console.error("Error fetching upcoming appointments:", error);
			return [];
		}
	});

export const getDueImmunizations = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const { clinicId } = context;
			const today = new Date();
			const nextMonth = new Date(today);
			nextMonth.setMonth(nextMonth.getMonth() + 1);

			// Get upcoming immunizations from pediatric functions
			const immunizations = await getUpcomingImmunizations({
				data: { clinicId }
			});

			// Filter and format immunizations
			const formattedImmunizations = [];
			for (const immunization of immunizations || []) {
				for (const vaccine of immunization.dueVaccines) {
					formattedImmunizations.push({
						id: `${immunization.patient.id}-${vaccine.id}`,
						vaccine: vaccine.vaccineName || "Vaccination",
						isOverDue:
							new Date(
								vaccine.ageInDaysMax
									? new Date(
											immunization.patient.dateOfBirth.getTime() +
												vaccine.ageInDaysMax * 24 * 60 * 60 * 1000
										)
									: new Date()
							) < today,
						patient: {
							firstName: immunization.patient.firstName || "Unknown",
							lastName: immunization.patient.lastName || "",
							createdAt: immunization.patient.createdAt,
							id: immunization.patient.id,
							dateOfBirth: immunization.patient.dateOfBirth
						}
					});
				}
			}
			return formattedImmunizations;
		} catch (error) {
			console.error("Error fetching due immunizations:", error);
			return [];
		}
	});

export const getRecentPatients = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const { clinicId } = context;
			const result = await listPatients({
				data: {
					clinicId,
					limit: 10,
					offset: 0
				}
			});

			return result || [];
		} catch (error) {
			console.error("Error fetching recent patients:", error);
			return { patients: [], total: 0 };
		}
	});
export const getRecentEncounters = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const { clinicId } = context;

			// 1. Fetch records
			const records =
				(await listMedicalRecord({
					data: { clinicId, limit: 10, offset: 0 }
				})) || [];

			// 2. Fetch diagnoses for each record in parallel
			const diagnosisEntries = await Promise.all(
				records.map(async r => {
					const diags = await getDiagnosesByMedicalRecordId({ data: { medicalId: r.id } });
					return [r.id, diags?.[0]?.diagnosis ?? null] as [string, string | null];
				})
			);

			// 3. Create a map for efficient lookups
			const diagnosisMap = new Map<string, string | null>(diagnosisEntries);

			// 4. Map the records and inject the diagnosis from the map
			return records.map(record => ({
				id: record.id,
				patientFirstName: record.patientId ?? "Unknown",
				patientLastName: "",
				// Look up the diagnosis using the record ID
				diagnosis: diagnosisMap.get(record.id) ?? null,
				date: record.createdAt ?? new Date(),
				createdAt: record.createdAt
			}));
		} catch (error) {
			console.error("Error fetching recent encounters:", error);
			return [];
		}
	});
