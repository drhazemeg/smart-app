// Server functions for growth alerts table

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { queries } from "@/db/queries";
import { alertTypeEnum } from "@/db/schema";
import { GrowthAlertCreateSchema } from "@/db/zod";

// =======================
// Zod Validators
// =======================

const alertIdSchema = z.object({
	id: z.string().min(1)
});

const patientIdSchema = z.object({
	patientId: z.string().min(1)
});

const updateAlertSchema = z.object({
	isResolved: z.boolean().optional(),
	resolvedAt: z.date().optional(),
	resolvedBy: z.string().optional(),
	resolutionNote: z.string().optional()
});

const listAlertsSchema = z.object({
	patientId: z.string().min(1),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
	isResolved: z.boolean().optional(),
	alertType: z.enum(alertTypeEnum.enumValues).optional(),
	severity: z.enum(["CRITICAL", "MILD", "MODERATE", "SEVERE"]).optional()
});

const autoGenerateSchema = z.object({
	measurementId: z.string().min(1)
});

// =======================
// Server Functions
// =======================

export const getAlertById = createServerFn({ method: "GET" })
	.validator(alertIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const alert = await queries.growthAlerts.getAlertById(id);
			if (!alert) {
				throw new Error("Alert not found");
			}
			return alert;
		} catch (error) {
			console.error("Error getting alert by ID:", error);
			throw new Error("Failed to get alert");
		}
	});

export const getAlertsByPatient = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const alerts = await queries.growthAlerts.getAlertsByPatient(patientId);
			return alerts;
		} catch (error) {
			console.error("Error getting alerts by patient:", error);
			throw new Error("Failed to get alerts");
		}
	});

export const getUnresolvedAlertsByPatient = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const alerts = await queries.growthAlerts.getUnresolvedAlertsByPatient(patientId);
			return alerts;
		} catch (error) {
			console.error("Error getting unresolved alerts by patient:", error);
			throw new Error("Failed to get unresolved alerts");
		}
	});

export const listAlerts = createServerFn({ method: "POST" })
	.validator(listAlertsSchema)
	.handler(async ctx => {
		try {
			const { patientId, limit, offset, isResolved, alertType, severity } = ctx.data;
			const alerts = await queries.growthAlerts.listAlerts({
				patientId,
				limit,
				offset,
				isResolved,
				alertType,
				severity
			});
			return alerts;
		} catch (error) {
			console.error("Error listing alerts:", error);
			throw new Error("Failed to list alerts");
		}
	});

export const createAlert = createServerFn({ method: "POST" })
	.validator(GrowthAlertCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const alert = await queries.growthAlerts.createAlert({
				...data,
				id: crypto.randomUUID(),
				isResolved: false,
				createdAt: new Date()
			});
			return alert;
		} catch (error) {
			console.error("Error creating alert:", error);
			throw new Error("Failed to create alert");
		}
	});

export const updateAlert = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1), data: updateAlertSchema }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const alert = await queries.growthAlerts.updateAlert(id, data);
			if (!alert) {
				throw new Error("Alert not found");
			}
			return alert;
		} catch (error) {
			console.error("Error updating alert:", error);
			throw new Error("Failed to update alert");
		}
	});

export const resolveAlert = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string().min(1),
			resolvedBy: z.string().min(1),
			resolutionNote: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			const { id, resolvedBy, resolutionNote } = ctx.data;
			const alert = await queries.growthAlerts.resolveAlert(id, resolvedBy, resolutionNote);
			if (!alert) {
				throw new Error("Alert not found");
			}
			return alert;
		} catch (error) {
			console.error("Error resolving alert:", error);
			throw new Error("Failed to resolve alert");
		}
	});

export const deleteAlert = createServerFn({ method: "POST" })
	.validator(alertIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const alert = await queries.growthAlerts.deleteAlert(id);
			if (!alert) {
				throw new Error("Alert not found");
			}
			return alert;
		} catch (error) {
			console.error("Error deleting alert:", error);
			throw new Error("Failed to delete alert");
		}
	});

export const getCriticalAlertsByPatient = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const alerts = await queries.growthAlerts.getCriticalAlertsByPatient(patientId);
			return alerts;
		} catch (error) {
			console.error("Error getting critical alerts:", error);
			throw new Error("Failed to get critical alerts");
		}
	});

export const getAlertStats = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const stats = await queries.growthAlerts.getAlertStats(patientId);
			return stats;
		} catch (error) {
			console.error("Error getting alert stats:", error);
			throw new Error("Failed to get alert stats");
		}
	});

export const autoGenerateAlerts = createServerFn({ method: "POST" })
	.validator(autoGenerateSchema)
	.handler(async ctx => {
		try {
			const { measurementId } = ctx.data;
			const alerts = await queries.growthAlerts.autoGenerateAlerts(measurementId);
			return alerts;
		} catch (error) {
			console.error("Error auto-generating alerts:", error);
			throw new Error("Failed to auto-generate alerts");
		}
	});
