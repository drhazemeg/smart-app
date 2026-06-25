import { eq, sql } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";

// =======================
// Zod Validators
// =======================

// =======================
// Server Functions
// =======================

export const growthAlertRepo = {
	async getAlertById(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthAlert.findFirst({
			where: { id },
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async getAlertsByPatient(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthAlert.findMany({
			where: { patientId },
			orderBy: { createdAt: "desc" },
			with: {
				patient: true
				// measurement: true
			}
		});
	},

	async getUnresolvedAlertsByPatient(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthAlert.findMany({
			where: { patientId, isResolved: false },
			orderBy: { createdAt: "desc" },
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async listAlerts(
		params: {
			patientId: string;
			limit: number;
			offset: number;
			isResolved?: boolean;
			alertType?: schema.AlertType;
			severity?: schema.Severity;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const { patientId, limit, offset, isResolved, alertType } = params;

		const conditions = [eq(schema.growthAlert.patientId, patientId)];
		if (isResolved !== undefined) {
			conditions.push(eq(schema.growthAlert.isResolved, isResolved));
		}
		if (alertType) {
			conditions.push(eq(schema.growthAlert.alertType, alertType));
		}

		return await client.query.growthAlert.findMany({
			where: { patientId, isResolved: false, alertType },
			orderBy: { createdAt: "desc" },
			limit,
			offset,
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async createAlert(data: schema.NewGrowthAlert, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.growthAlert)
			.values({
				...data,
				id: data.id ?? crypto.randomUUID(),
				isResolved: false,
				createdAt: new Date()
			})
			.returning();
		return result;
	},

	async updateAlert(id: string, data: Partial<schema.NewGrowthAlert>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.growthAlert)
			.set(data)
			.where(eq(schema.growthAlert.id, id))
			.returning();
		return result;
	},

	async resolveAlert(id: string, resolvedBy: string, resolutionNote?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.growthAlert)
			.set({
				isResolved: true,
				resolvedAt: new Date(),
				resolvedBy,
				resolutionNote
			})
			.where(eq(schema.growthAlert.id, id))
			.returning();
		return result;
	},

	async deleteAlert(id: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client.delete(schema.growthAlert).where(eq(schema.growthAlert.id, id)).returning();
		return result;
	},

	async getCriticalAlertsByPatient(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.growthAlert.findMany({
			where: { patientId, isResolved: false },
			orderBy: { createdAt: "desc" },
			with: {
				patient: true,
				measurement: true
			}
		});
	},

	async getAlertStats(patientId: string, tx?: DBorTx) {
		const client = tx ?? db;
		const stats = await client
			.select({
				totalAlerts: sql<number>`CAST(count(*) AS INTEGER)`,
				unresolvedAlerts: sql<number>`CAST(sum(CASE WHEN is_resolved = false THEN 1 ELSE 0 END) AS INTEGER)`,
				criticalAlerts: sql<number>`CAST(sum(CASE WHEN severity = 'critical' AND is_resolved = false THEN 1 ELSE 0 END) AS INTEGER)`,
				warningAlerts: sql<number>`CAST(sum(CASE WHEN severity = 'warning' AND is_resolved = false THEN 1 ELSE 0 END) AS INTEGER)`,
				infoAlerts: sql<number>`CAST(sum(CASE WHEN severity = 'info' AND is_resolved = false THEN 1 ELSE 0 END) AS INTEGER)`
			})
			.from(schema.growthAlert)
			.where(eq(schema.growthAlert.patientId, patientId));

		return stats[0];
	},

	async autoGenerateAlerts(measurementId: string, tx?: DBorTx) {
		const client = tx ?? db;
		const measurement = await client.query.measurement.findFirst({
			where: { id: measurementId },
			with: { patient: true }
		});

		if (!measurement) {
			throw new Error("Measurement not found");
		}

		const growthAlert: schema.NewGrowthAlert[] = [];
		const { patientId, weightForAgeZ, heightForAgeZ, bmiForAgeZ } = measurement;

		if (weightForAgeZ !== null) {
			if (weightForAgeZ < -3) {
				growthAlert.push({
					patientId,
					measurementId,
					alertType: "SEVERE_UNDERWEIGHT",
					severity: "CRITICAL",
					zScore: weightForAgeZ,
					message: "Severe underweight detected (Z-score < -3)",
					recommendation: "Immediate nutritional intervention required"
				});
			} else if (weightForAgeZ < -2) {
				growthAlert.push({
					patientId,
					measurementId,
					alertType: "MODERATE_UNDERWEIGHT",
					severity: "WARNING",
					zScore: weightForAgeZ,
					message: "Moderate underweight detected (Z-score < -2)",
					recommendation: "Nutritional assessment and intervention recommended"
				});
			}
		}

		if (heightForAgeZ !== null) {
			if (heightForAgeZ < -3) {
				growthAlert.push({
					patientId,
					measurementId,
					alertType: "SEVERE_STUNTING",
					severity: "CRITICAL",
					zScore: heightForAgeZ,
					message: "Severe stunting detected (Z-score < -3)",
					recommendation: "Growth assessment and intervention required"
				});
			} else if (heightForAgeZ < -2) {
				growthAlert.push({
					patientId,
					measurementId,
					alertType: "MODERATE_STUNTING",
					severity: "WARNING",
					zScore: heightForAgeZ,
					message: "Moderate stunting detected (Z-score < -2)",
					recommendation: "Growth monitoring recommended"
				});
			}
		}

		if (bmiForAgeZ !== null) {
			if (bmiForAgeZ > 3) {
				growthAlert.push({
					patientId,
					measurementId,
					alertType: "OBESITY",
					severity: "CRITICAL",
					zScore: bmiForAgeZ,
					message: "Severe obesity detected (BMI Z-score > 3)",
					recommendation: "Immediate dietary and lifestyle intervention required"
				});
			} else if (bmiForAgeZ > 2) {
				growthAlert.push({
					patientId,
					measurementId,
					alertType: "OBESITY",
					severity: "WARNING",
					zScore: bmiForAgeZ,
					message: "Moderate obesity detected (BMI Z-score > 2)",
					recommendation: "Dietary counseling and physical activity assessment recommended"
				});
			}
		}

		if (growthAlert.length > 0) {
			return client
				.insert(schema.growthAlert)
				.values(
					growthAlert.map(a => ({
						...a,
						id: crypto.randomUUID(),
						isResolved: false,
						createdAt: new Date()
					}))
				)
				.returning();
		}

		return [];
	}
};
