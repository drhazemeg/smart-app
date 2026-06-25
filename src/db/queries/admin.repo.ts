import { and, eq, sql } from "drizzle-orm";
import { type DBorTx, db } from "../client.server";
import * as schema from "../schema";
import type { DbAppointment } from "../zod";

export const adminQueries = {
	/**
	 * Get raw counts of appointments grouped by status for a specific clinic.
	 */
	async getAppointmentCountsByStatus(clinicId: string) {
		return await db
			.select({
				status: schema.appointment.status,
				count: sql<number>`count(*)::int`
			})
			.from(schema.appointment)
			.where(eq(schema.appointment.clinicId, clinicId))
			.groupBy(schema.appointment.status);
	},
	async setDefaultClinic(clinicId: string) {
		// First, unset any existing default clinic
		await db.update(schema.clinic).set({ isDefault: false }).where(eq(schema.clinic.isDefault, true));
		// Then, set the new default clinic
		const [updatedClinic] = await db
			.update(schema.clinic)
			.set({ isDefault: true })
			.where(eq(schema.clinic.id, clinicId))
			.returning();
		return updatedClinic;
	},
	async getConfigValue(key: string) {
		const result = await db.query.configStore.findFirst({
			where: { key }
		});
		return result?.value || null;
	},
	async bulkUpdateAppointmentsStatus(appointmentIds: string[], status: schema.AppointmentStatus, reason?: string) {
		return await db.transaction(async tx => {
			const updatedAppointments = await tx
				.update(schema.appointment)
				.set({
					status,
					reason,
					updatedAt: new Date()
				})
				.where(sql`${schema.appointment.id} IN (${appointmentIds.map(id => sql`${id}`).join(", ")})`)
				.returning();

			// Optionally, you could also log these changes in an audit table here

			return updatedAppointments;
		});
	},
	async cancelExistingAppointment(appointmentId: string, clinicId: string, reason?: string) {
		return await db.transaction(async tx => {
			const [updatedAppointment] = await tx
				.update(schema.appointment)
				.set({
					status: "CANCELLED",
					reason,
					updatedAt: new Date()
				})
				.where(and(eq(schema.appointment.id, appointmentId), eq(schema.appointment.clinicId, clinicId)))
				.returning();

			if (!updatedAppointment) {
				throw new Error("Appointment not found or already cancelled");
			}

			// Optionally, you could also log this cancellation in an audit table here

			return updatedAppointment;
		});
	},
	async updateExistingAppointment(id: string, data: Partial<DbAppointment> & { id: string; clinicId: string }) {
		return await db.transaction(async tx => {
			const [updatedAppointment] = await tx
				.update(schema.appointment)
				.set({
					...data,
					updatedAt: new Date()
				})
				.where(and(eq(schema.appointment.id, id), eq(schema.appointment.clinicId, data.clinicId)))
				.returning();

			if (!updatedAppointment) {
				throw new Error("Appointment not found or update failed");
			}

			// Optionally, you could also log this update in an audit table here

			return updatedAppointment;
		});
	},
	async rescheduleExistingAppointment(id: string, newDate: Date, clinicId: string) {
		return await db.transaction(async tx => {
			const [updatedAppointment] = await tx
				.update(schema.appointment)
				.set({
					appointmentDate: newDate,
					updatedAt: new Date()
				})
				.where(and(eq(schema.appointment.id, id), eq(schema.appointment.clinicId, clinicId)))
				.returning();

			if (!updatedAppointment) {
				throw new Error("Appointment not found or reschedule failed");
			}

			// Optionally, you could also log this rescheduling in an audit table here

			return updatedAppointment;
		});
	},
	async getMonthlyAppointmentData(clinicId: string) {
		return await db
			.select({
				month: sql<string>`to_char(${schema.appointment.appointmentDate}, 'Mon')`,
				appointments: sql<number>`count(*)::int`,
				monthOrder: sql<Date>`date_trunc('month', ${schema.appointment.appointmentDate})`
			})
			.from(schema.appointment)
			.where(
				and(
					eq(schema.appointment.clinicId, clinicId),
					sql`${schema.appointment.appointmentDate} >= date_trunc('year', CURRENT_DATE)`
				)
			)
			.groupBy(
				sql`date_trunc('month', ${schema.appointment.appointmentDate})`,
				sql`to_char(${schema.appointment.appointmentDate}, 'Mon')`
			)
			.orderBy(sql`date_trunc('month', ${schema.appointment.appointmentDate})`);
	},

	/**
	 * Fetch a user's role by their ID.
	 */
	async getUserRoleById(userId: string) {
		return await db.query.user.findFirst({
			where: { id: userId },
			columns: { role: true }
		});
	},
	async getAdminOnboardedStatus(tx?: DBorTx): Promise<boolean> {
		const client = tx ?? db;
		const result = await client.query.configStore.findFirst({
			where: { key: "admin_onboarded" }
		});
		return result?.value === "true";
	},

	async setAdminOnboarded(tx?: DBorTx) {
		const client = tx ?? db;
		return await client
			.insert(schema.configStore)
			.values({
				key: "admin_onboarded",
				value: "true"
			})
			.onConflictDoNothing();
	},

	async upsertConfigStore(key: string, value: string) {
		return await db.insert(schema.configStore).values({ key, value }).onConflictDoUpdate({
			target: schema.configStore.key,
			set: { value }
		});
	},

	async getDefaultClinic() {
		// const client = tx ?? db;
		return await db.query.clinic.findFirst({
			where: { name: "Default Clinic", isDeleted: false }
		});
	},

	async getClinicByName(name: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.clinic.findFirst({
			where: { name, isDeleted: false }
		});
	},

	async createClinicWithDetails(data: {
		id: string;
		name: string;
		address: string;
		phone?: string;
		email?: string;
		timezone?: string;
		isDeleted?: boolean;
	}) {
		const [newClinic] = await db
			.insert(schema.clinic)
			.values({
				id: data.id,
				name: data.name,
				address: data.address,
				phone: data.phone,
				email: data.email,
				timezone: data.timezone || "Africa/Cairo",
				isDeleted: data.isDeleted,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();
		return newClinic;
	},

	async getUserFiles(userId: string) {
		return await db.query.file.findMany({
			where: { userId },
			columns: { id: true }
		});
	},

	async createDoctorRecord(data: {
		id: string;
		userId: string;
		email: string;
		clinicId: string;
		role: schema.Role;
		name: string;
	}) {
		const [result] = await db
			.insert(schema.doctor)
			.values({
				userId: data.userId,
				email: data.email,
				clinicId: data.clinicId,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: data.name,
				specialty: "General"
			})
			.returning();
		return result;
	},

	async createStaffRecord(data: {
		id: string;
		userId: string;
		email: string;
		clinicId: string;
		role: schema.Role;
		name: string;
	}) {
		const [result] = await db
			.insert(schema.staff)
			.values({
				userId: data.userId,
				email: data.email,
				clinicId: data.clinicId,
				createdAt: new Date(),
				updatedAt: new Date(),
				name: data.name,
				address: ""
			})
			.returning();
		return result;
	},

	async createPatientRecord(
		data: {
			id: string;
			userId: string;
			email: string;
			clinicId: string;
			role: schema.Role;
			firstName: string;
			lastName: string;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.patient)
			.values({
				userId: data.userId,
				gender: "boy",
				email: data.email,
				clinicId: data.clinicId,
				createdAt: new Date(),
				updatedAt: new Date(),
				firstName: data.firstName,
				lastName: data.lastName,
				dateOfBirth: new Date(0)
			})
			.returning();
		return result;
	},

	async updateUserToAdmin(userId: string, clinicId: string, name?: string, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.user)
			.set({
				role: "admin",
				emailVerified: true,
				clinicId,
				...(name && { name }),
				updatedAt: new Date()
			})
			.where(eq(schema.user.id, userId))
			.returning();
		return result;
	}
};
