// db/repositories/clinic.repo.ts

import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";
import type { PaymentCreateInput, PaymentUpdateInput } from "../zod";

export const systemRepo = {
	// Search files
	async searchFiles(userId: string, searchTerm: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.query.file.findMany({
			where: {
				userId,
				searchText: { ilike: `%${searchTerm}%` }
			},
			orderBy: { createdAt: "desc" }
		});
	},
	// Advanced search with filters
	async advancedSearch(
		filters: {
			clinicId?: string;
			patientName?: string;
			doctorName?: string;
			dateFrom?: Date;
			dateTo?: Date;
			status?: schema.AppointmentStatus;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;

		const where: Record<string, unknown> = {
			isDeleted: false,
			deletedAt: null
		};

		if (filters.clinicId) {
			where.clinicId = filters.clinicId;
		}
		if (filters.status) {
			where.status = filters.status;
		}
		if (filters.dateFrom && filters.dateTo) {
			where.appointmentDate = { gte: filters.dateFrom, lte: filters.dateTo };
		}

		const withClause: Record<string, unknown> = {
			service: true,
			bills: true
		};

		if (filters.patientName) {
			withClause.patient = {
				where: {
					OR: [
						{ firstName: { ilike: `%${filters.patientName}%` } },
						{ lastName: { ilike: `%${filters.patientName}%` } }
					]
				}
			};
		} else {
			withClause.patient = true;
		}

		if (filters.doctorName) {
			withClause.doctor = {
				where: {
					name: { ilike: `%${filters.doctorName}%` }
				}
			};
		} else {
			withClause.doctor = true;
		}

		return await client.query.appointment.findMany({
			where,
			with: withClause,
			orderBy: { appointmentDate: "desc" }
		});
	},
	async getUserNotifications(userId: string, clinicId?: string, limit = 5, offset = 0) {
		return await db.query.notification.findMany({
			where: {
				userId,
				...(clinicId && { clinicId })
			},
			orderBy: { createdAt: "desc" },
			limit,
			offset
		});
	},

	// List notifications with filters and counts
	async listNotifications(params: {
		userId: string;
		clinicId?: string;
		status?: "all" | "read" | "unread";
		type?: string | null;
		search?: string;
		limit: number;
		offset: number;
	}) {
		const { userId, clinicId, status, type, search, limit, offset } = params;
		const rqbWhere = {
			userId,
			...(clinicId && { clinicId }),
			...(status === "unread" && { status: "UNREAD" as const }),
			...(status === "read" && { status: "READ" as const }),
			...(type && { type }),
			...(search && {
				OR: [{ body: { ilike: `%${search}%` } }, { title: { ilike: `%${search}%` } }]
			})
		};

		const [items, totalResult, unreadResult] = await Promise.all([
			db.query.notification.findMany({
				where: rqbWhere,
				orderBy: { createdAt: "desc" },
				limit,
				offset
			}),
			db.$count(
				schema.notification,
				and(
					eq(schema.notification.userId, userId),
					clinicId ? eq(schema.notification.clinicId, clinicId) : undefined,
					status === "unread" ? eq(schema.notification.status, "UNREAD") : undefined,
					status === "read" ? eq(schema.notification.status, "READ") : undefined,
					type ? eq(schema.notification.type, type) : undefined,
					search
						? or(
								ilike(schema.notification.body, `%${search}%`),
								ilike(schema.notification.title, `%${search}%`)
							)
						: undefined
				)
			),
			db.$count(
				schema.notification,
				and(
					eq(schema.notification.userId, userId),
					clinicId ? eq(schema.notification.clinicId, clinicId) : undefined,
					eq(schema.notification.status, "UNREAD")
				)
			)
		]);

		return {
			items,
			total: totalResult,
			unreadCount: unreadResult
		};
	},

	// Mark notification as read
	async markNotificationsAsRead(notificationId: string, userId?: string) {
		const condition = userId
			? and(eq(schema.notification.id, notificationId), eq(schema.notification.userId, userId))
			: eq(schema.notification.id, notificationId);

		return await db
			.update(schema.notification)
			.set({ status: "READ", updatedAt: new Date() })
			.where(condition)
			.returning();
	},

	// Mark all as read
	async markAllNotificationsAsRead(userId: string, clinicId?: string) {
		return await db
			.update(schema.notification)
			.set({ status: "READ", updatedAt: new Date() })
			.where(
				and(
					eq(schema.notification.userId, userId),
					clinicId ? eq(schema.notification.clinicId, clinicId) : undefined,
					eq(schema.notification.status, "UNREAD")
				)
			)
			.returning();
	},

	// Delete a notification
	async deleteNotification(notificationId: string, userId: string) {
		return await db
			.delete(schema.notification)
			.where(and(eq(schema.notification.id, notificationId), eq(schema.notification.userId, userId)))
			.returning();
	},

	// Clear all notifications for user
	async clearAllNotifications(userId: string, clinicId?: string) {
		return await db
			.delete(schema.notification)
			.where(
				and(
					eq(schema.notification.userId, userId),
					clinicId ? eq(schema.notification.clinicId, clinicId) : undefined
				)
			)
			.returning();
	},
	async getClinicAnalytics(clinicId: string, startDate: Date, endDate: Date) {
		const [appointments, payments, patients, prescriptions] = await Promise.all([
			// Appointments by status
			db.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					appointmentDate: {
						gte: startDate,
						lte: endDate
					}
				}
			}),

			// Payments summary
			db.query.payment.findMany({
				where: {
					clinicId,
					paymentDate: {
						gte: startDate,
						lte: endDate
					},
					status: "PAID"
				}
			}),

			// New patients count
			db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				}
			}),

			// Prescriptions count
			db.query.prescription.findMany({
				where: {
					clinicId,
					issuedDate: {
						gte: startDate,
						lte: endDate
					}
				}
			})
		]);

		const appointmentStats = {
			total: appointments.length,
			completed: appointments.filter(a => a.status === "COMPLETED").length,
			cancelled: appointments.filter(a => a.status === "CANCELLED").length,
			pending: appointments.filter(a => a.status === "PENDING").length,
			noShow: appointments.filter(a => a.status === "NO_SHOW").length
		};

		const revenue = payments.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
		const revenueByMethod = payments.reduce(
			(acc, p) => {
				const method = p.paymentMethod || "UNKNOWN";
				acc[method] = (acc[method] || 0) + (p.totalAmount ?? 0);
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			period: { startDate, endDate },
			appointments: appointmentStats,
			revenue: {
				total: revenue,
				byMethod: revenueByMethod,
				averagePerAppointment: appointmentStats.completed > 0 ? revenue / appointmentStats.completed : 0
			},
			patients: {
				total: patients.length,
				newPatients: patients.length
			},
			prescriptions: prescriptions.length
		};
	},
	async checkVitalSignsAccess(userId: string, patientId: string): Promise<boolean> {
		const userData = await db.query.user.findFirst({
			where: { id: userId },
			with: {
				patientsCreated: true,
				doctorProfile: true
			}
		});

		if (!userData) {
			return false;
		}

		if (userData.role === "admin" || userData.role === "staff") {
			return true;
		}
		if (userData.role === "doctor" && userData.doctorProfile) {
			return true;
		}
		if (userData.role === "patient" && Array.isArray(userData.patientsCreated)) {
			return userData.patientsCreated.some(p => p.id === patientId);
		}

		// Check if user is guardian
		const guardianRecord = await db.query.guardian.findFirst({
			where: {
				userId,
				patientId
			}
		});

		return !!guardianRecord;
	},
	async checkDoctorAccess(doctorId: string, userId: string, clinicId?: string) {
		const userRecord = await db.query.user.findFirst({
			where: { id: userId },
			with: {
				patientsCreated: true,
				doctorProfile: true
			}
		});

		if (!userRecord) {
			return false;
		}

		// Admin has full access
		if (userRecord.role === "admin") {
			return true;
		}

		// Staff has limited access
		if (userRecord.role === "staff") {
			return true;
		}

		// Doctor access
		if (userRecord.role === "doctor") {
			const doctorRecord = await db.query.doctor.findFirst({
				where: {
					userId,
					id: doctorId
				}
			});
			return !!doctorRecord;
		}

		// Check clinic membership
		if (clinicId) {
			const clinicMember = await db.query.clinicMember.findFirst({
				where: {
					userId,
					clinicId
				}
			});
			return !!clinicMember;
		}

		return false;
	},

	async createPayment(data: PaymentCreateInput) {
		const [result] = await db.insert(schema.payment).values(data).returning();
		return result;
	},

	async recordPayment(data: PaymentCreateInput) {
		return await db.transaction(async tx => {
			const [payment] = await tx
				.insert(schema.payment)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					billDate: data.billDate ?? new Date(),
					totalAmount: data.totalAmount ?? data.totalAmount,
					amountPaid: data.status === "PAID" ? data.totalAmount : 0,
					paidDate: data.status === "PAID" ? new Date() : null,
					receiptNumber: data.receiptNumber ? data.receiptNumber : Math.floor(Math.random() * 1_000_000)
				})
				.returning();

			return payment;
		});
	},

	async createManyPayments(data: PaymentCreateInput[]) {
		return await db.insert(schema.payment).values(data).returning();
	},
	async createInvoice(data: {
		patientId: string;
		clinicId: string;
		appointmentId?: string;
		items: Array<{ description: string; amount: number }>;
		dueDate?: Date;
		notes?: string;
	}) {
		return await db.transaction(async tx => {
			// Calculate total amount from items
			const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

			const [payment] = await tx
				.insert(schema.payment)
				.values({
					id: crypto.randomUUID(),
					patientId: data.patientId,
					clinicId: data.clinicId,
					appointmentId: data.appointmentId,
					totalAmount,
					status: "PENDING",
					billDate: new Date(),
					dueDate: data.dueDate || new Date(), // Added fallback if needed
					notes: data.notes,
					receiptNumber: Math.floor(Math.random() * 1_000_000)
				})
				.returning();

			return payment;
		});
	},
	async updatePayment(id: string, data: PaymentUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		const [result] = await db.update(schema.payment).set(updateData).where(eq(schema.payment.id, id)).returning();
		return result;
	},

	async updateManyPayments(ids: string[], data: PaymentUpdateInput) {
		const updateData = { ...data };
		updateData.updatedAt = new Date();
		return await db.update(schema.payment).set(updateData).where(inArray(schema.payment.id, ids)).returning();
	},

	async deletePayment(id: string) {
		const [result] = await db.delete(schema.payment).where(eq(schema.payment.id, id)).returning();
		return result;
	},

	async softDeletePayment(id: string) {
		const [result] = await db
			.update(schema.payment)
			.set({ deletedAt: new Date() })
			.where(eq(schema.payment.id, id))
			.returning();
		return result;
	},
	async generateReceipt(paymentId: string) {
		return await db.query.payment.findFirst({
			where: { id: paymentId },
			with: { patient: true, appointment: true, clinic: true }
		});
	},
	async processPaymentWithReceipt(
		paymentId: string,
		amountPaid: number,
		paymentMethod: schema.PaymentMethod,
		notes?: string
	) {
		return await db.transaction(async tx => {
			const payment = await tx.query.payment.findFirst({
				where: { id: paymentId },
				with: {
					patient: true,
					appointment: true
				}
			});

			if (!payment) {
				throw new Error("Payment not found");
			}

			const isFullyPaid = amountPaid >= (payment.totalAmount ?? 0);
			const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

			const [updatedPayment] = await tx
				.update(schema.payment)
				.set({
					amountPaid,
					paymentMethod,
					paymentDate: new Date(),
					paidDate: new Date(),
					status: isFullyPaid ? "PAID" : "PARTIAL",
					notes: notes ? `${payment.notes || ""}\n${notes}` : payment.notes,
					receiptNumber: Number.parseInt(receiptNumber.split("-").pop() || "0", 10),
					updatedAt: new Date()
				})
				.where(eq(schema.payment.id, paymentId))
				.returning();

			// Create receipt notification
			if (payment.patient?.userId) {
				await tx.insert(schema.notification).values({
					id: crypto.randomUUID(),
					userId: payment.patient.userId,
					clinicId: payment.clinicId ?? "",
					title: "Payment Receipt",
					body: `Payment of ${amountPaid} received. Receipt #: ${receiptNumber}`,
					type: "PAYMENT_RECEIPT",
					priority: "MEDIUM",
					metadata: {
						receiptNumber,
						amountPaid,
						paymentMethod
					}
				});
			}

			return updatedPayment;
		});
	},

	async restorePayment(id: string) {
		const [result] = await db
			.update(schema.payment)
			.set({ deletedAt: null })
			.where(eq(schema.payment.id, id))
			.returning();
		return result;
	},
	async getAllConfigs(tx?: DBorTx) {
		const client = tx ?? db;
		return await client.select().from(schema.configStore);
	},

	/**
	 * Get a single config value by key
	 */
	async getConfig(key: string, tx?: DBorTx) {
		const client = tx ?? db;
		const result = await client.select().from(schema.configStore).where(eq(schema.configStore.key, key)).limit(1);
		return result[0] ?? null;
	},

	/**
	 * Get multiple config values by keys
	 */
	async getConfigs(keys: string[], tx?: DBorTx) {
		const client = tx ?? db;
		const results = await Promise.all(keys.map(key => this.getConfig(key, client)));
		return results.reduce(
			(acc, result, idx) => {
				if (result) {
					acc[keys[idx] ?? ""] = result.value;
				}
				return acc;
			},
			{} as Record<string, string>
		);
	},

	/**
	 * Set a config value (upsert)
	 */

	/**
	 * Set multiple config values (batch upsert)
	 */
	async setConfig(key: string, value: string, client: DBorTx) {
		// Ensure you use .returning() here
		const [result] = await client
			.insert(schema.configStore)
			.values({ key, value, updatedAt: new Date() })
			.onConflictDoUpdate({
				target: schema.configStore.key,
				set: { value, updatedAt: new Date() }
			})
			.returning(); // This returns the object, NOT a QueryResult

		return result; // Now this is of type ConfigStore
	},

	/**
	 * Delete a config key
	 */
	async deleteConfig(key: string, tx?: DBorTx) {
		const client = tx ?? db;
		return await client.delete(schema.configStore).where(eq(schema.configStore.key, key));
	},

	/**
	 * Get all config keys that exist
	 */
	async getExistingKeys(tx?: DBorTx) {
		const client = tx ?? db;
		const rows = await client.select({ key: schema.configStore.key }).from(schema.configStore);
		return rows.map(row => row.key);
	},

	/**
	 * Initialize missing config keys with default values
	 */
	async initializeMissingConfigs(defaults: Array<{ key: string; value: string }>, tx?: DBorTx) {
		const client = tx ?? db;
		const existingKeys = await this.getExistingKeys(client);
		const missing = defaults.filter(d => !existingKeys.includes(d.key));

		if (missing.length > 0) {
			await client.insert(schema.configStore).values(missing).onConflictDoNothing();
		}

		return missing;
	}
};

export type SystemRepo = typeof systemRepo;
