// db/queries/visit.repo.ts - NEW FILE
import { type DBorTx, db } from "@/db/client";

export const visitRepo = {
	async getVisits(limit = 100, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.appointment.findMany({
			with: {
				patient: {
					columns: {
						id: true,
						firstName: true,
						lastName: true,
						gender: true,
						dateOfBirth: true,
						image: true
					}
				},
				doctor: {
					columns: {
						id: true,
						name: true,
						specialty: true
					}
				},
				service: {
					columns: {
						id: true,
						serviceName: true,
						price: true
					}
				}
			},
			orderBy: { appointmentDate: "desc" },
			limit
		});
	},

	async getVisitById(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.appointment.findFirst({
			where: { id },
			with: {
				patient: true,
				doctor: true,
				service: true,
				medicalRecords: true,
				diagnoses: true
			}
		});
	}
};

export type VisitRepo = typeof visitRepo;
