// queries/payment.repo.ts

import { and, count, desc, eq, gte, ilike, lte, or, type SQL, sql } from "drizzle-orm";
import { type DBorTx, db } from "@/db/client";

import * as schema from "../schema";

export const paymentRepo = {
	/**
	 * Get payment records with pagination and filters
	 */
	async getPaymentRecords(
		params: {
			page: number;
			limit: number;
			search?: string;
			status?: schema.PaymentStatus;
			startDate?: Date;
			endDate?: Date;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const { page, limit, search, status, startDate, endDate } = params;
		const offset = (page - 1) * limit;

		const conditions: SQL[] = [];

		if (search) {
			conditions.push(
				or(
					ilike(schema.patient.firstName, `%${search}%`),
					ilike(schema.patient.lastName, `%${search}%`),
					ilike(schema.payment.patientId, `%${search}%`)
				) as SQL
			);
		}

		if (status) {
			conditions.push(eq(schema.payment.status, status));
		}

		if (startDate) {
			conditions.push(gte(schema.payment.billDate, startDate));
		}

		if (endDate) {
			conditions.push(lte(schema.payment.billDate, endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [payments, total] = await Promise.all([
			client
				.select({
					payment: schema.payment,
					patient: {
						firstName: schema.patient.firstName,
						lastName: schema.patient.lastName,
						dateOfBirth: schema.patient.dateOfBirth,
						image: schema.patient.image,
						colorCode: schema.patient.colorCode,
						gender: schema.patient.gender,
						phone: schema.patient.phone,
						email: schema.patient.email
					}
				})
				.from(schema.payment)
				.leftJoin(schema.patient, eq(schema.payment.patientId, schema.patient.id))
				.where(whereClause)
				.orderBy(desc(schema.payment.createdAt))
				.limit(limit)
				.offset(offset),
			client
				.select({ count: count() })
				.from(schema.payment)
				.leftJoin(schema.patient, eq(schema.payment.patientId, schema.patient.id))
				.where(whereClause)
		]);

		const totalRecords = Number(total[0]?.count) || 0;

		return {
			payments: payments.map(item => ({
				...item.payment,
				patient: item.patient
			})),
			total: totalRecords,
			page,
			limit,
			totalPages: Math.ceil(totalRecords / limit)
		};
	},

	/**
	 * Get payment by ID with patient and bills
	 */
	async getPaymentById(id: string, tx?: DBorTx) {
		const client = tx ?? db; // Ensure client is defined

		const paymentData = await client
			.select({
				payment: schema.payment,
				patient: {
					firstName: schema.patient.firstName,
					lastName: schema.patient.lastName,
					dateOfBirth: schema.patient.dateOfBirth,
					image: schema.patient.image,
					colorCode: schema.patient.colorCode,
					gender: schema.patient.gender,
					phone: schema.patient.phone,
					email: schema.patient.email
				}
			})
			.from(schema.payment)
			.leftJoin(schema.patient, eq(schema.payment.patientId, schema.patient.id))
			.where(eq(schema.payment.id, id))
			.limit(1);

		if (!paymentData.length) {
			return null;
		}

		return {
			...paymentData[0]?.payment,
			patient: paymentData[0]?.patient
		};
	},

	/**
	 * Get bills by payment ID
	 */
	async getBillsByPaymentId(paymentId: string, tx?: DBorTx) {
		const client = tx ?? db; // Ensure client is defined

		return client
			.select({
				bill: schema.patientBill,
				service: {
					id: schema.service.id,
					serviceName: schema.service.serviceName,
					description: schema.service.description,
					price: schema.service.price,
					category: schema.service.category
				}
			})
			.from(schema.patientBill)
			.leftJoin(schema.service, eq(schema.patientBill.serviceId, schema.service.id))
			.where(eq(schema.patientBill.billId, paymentId))
			.orderBy(desc(schema.patientBill.createdAt));
	},

	/**
	 * Get payment summary statistics
	 */
	async getPaymentSummary(startDate?: Date, endDate?: Date, tx?: DBorTx) {
		const client = tx ?? db; // Ensure client is defined
		const conditions = [];

		if (startDate) {
			conditions.push(gte(schema.payment.billDate, startDate));
		}

		if (endDate) {
			conditions.push(lte(schema.payment.billDate, endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const summary = await client
			.select({
				totalPayments: count(),
				totalAmount: sql<number>`COALESCE(SUM(${schema.payment.totalAmount}), 0)`,
				totalPaid: sql<number>`COALESCE(SUM(${schema.payment.amountPaid}), 0)`,
				totalDiscount: sql<number>`COALESCE(SUM(${schema.payment.discount}), 0)`,
				paidCount: sql<number>`COALESCE(SUM(CASE WHEN ${schema.payment.status} = 'PAID' THEN 1 ELSE 0 END), 0)`,
				pendingCount: sql<number>`COALESCE(SUM(CASE WHEN ${schema.payment.status} = 'PENDING' THEN 1 ELSE 0 END), 0)`,
				unpaidCount: sql<number>`COALESCE(SUM(CASE WHEN ${schema.payment.status} = 'UNPAID' THEN 1 ELSE 0 END), 0)`,
				refundedCount: sql<number>`COALESCE(SUM(CASE WHEN ${schema.payment.status} = 'REFUNDED' THEN 1 ELSE 0 END), 0)`,
				partialCount: sql<number>`COALESCE(SUM(CASE WHEN ${schema.payment.status} = 'PARTIAL' THEN 1 ELSE 0 END), 0)`
			})
			.from(schema.payment)
			.where(whereClause);

		return (
			summary[0] ?? {
				totalPayments: 0,
				totalAmount: 0,
				totalPaid: 0,
				totalDiscount: 0,
				paidCount: 0,
				pendingCount: 0,
				unpaidCount: 0,
				refundedCount: 0,
				partialCount: 0
			}
		);
	},

	/**
	 * Create a new payment
	 */
	async createPayment(data: schema.NewPayment, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.insert(schema.payment)
			.values({
				...data, // Use schema.NewPayment directly
				createdAt: data.createdAt ?? new Date(),
				updatedAt: data.updatedAt ?? new Date()
			})
			.returning();
		return result;
	},

	/**
	 * Update payment
	 */
	async updatePayment(id: string, data: Partial<schema.NewPayment>, tx?: DBorTx) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.payment)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.payment.id, id))
			.returning();
		return result;
	},

	/**
	 * Update payment status
	 */
	async updatePaymentStatus(
		id: string,
		status: schema.PaymentStatus,
		paymentMethod?: schema.PaymentMethod,
		notes?: string,
		tx?: DBorTx
	) {
		const client = tx ?? db;
		const [result] = await client
			.update(schema.payment)
			.set({
				status,
				paymentMethod,
				notes,
				paymentDate: status === "PAID" ? new Date() : undefined,
				updatedAt: new Date()
			})
			.where(eq(schema.payment.id, id))
			.returning();
		return result;
	},

	/**
	 * Get or create payment for appointment
	 */
	async getOrCreatePaymentByAppointment(appointmentId: string, tx?: DBorTx) {
		const client = tx ?? db;

		// Check if payment exists
		const existingPayment = await client.query.payment.findFirst({
			where: { appointmentId }
		});

		if (existingPayment) {
			return existingPayment;
		}

		// Get appointment details
		const appointmentData = await client.query.appointment.findFirst({
			where: { id: appointmentId },
			columns: { patientId: true, clinicId: true }
		});

		if (!appointmentData) {
			throw new Error("Appointment not found");
		}

		if (!appointmentData.patientId) {
			throw new Error("Patient ID missing for appointment");
		}

		// Create new payment
		const [newPayment] = await client
			.insert(schema.payment)
			.values({
				id: crypto.randomUUID(),
				appointmentId,
				patientId: appointmentData.patientId,
				clinicId: appointmentData.clinicId,
				billDate: new Date(),
				paymentDate: new Date(),
				discount: 0,
				amountPaid: 0,
				totalAmount: 0,
				status: "PENDING"
			})
			.returning();

		return newPayment;
	},

	/**
	 * Add bill item to payment
	 */
	async addBillItem(
		data: {
			billId: string;
			serviceId: string;
			serviceDate: Date;
			quantity: number;
			unitCost: number;
			totalCost: number;
		},
		tx?: DBorTx
	) {
		const client = tx ?? db;

		const payment = await client.query.payment.findFirst({
			where: { id: data.billId },
			columns: { clinicId: true }
		});
		if (!payment) {
			throw new Error("Payment not found");
		}

		const [result] = await client
			.insert(schema.patientBill)
			.values({
				clinicId: payment.clinicId,
				...data
			})
			.returning();

		// Update payment total amount
		const currentTotal = await client
			.select({
				sum: sql<number>`COALESCE(SUM(${schema.patientBill.totalCost}), 0)`
			})
			.from(schema.patientBill)
			.where(eq(schema.patientBill.billId, data.billId));

		const newTotalAmount = Number(currentTotal[0]?.sum) || 0;

		await client
			.update(schema.payment)
			.set({
				totalAmount: newTotalAmount,
				updatedAt: new Date()
			})
			.where(eq(schema.payment.id, data.billId));

		return result;
	},

	/**
	 * Generate final bill with discount
	 */
	async generateBill(
		paymentId: string,
		billDate: Date,
		discountPercentage: number,
		totalAmount: number,
		tx?: DBorTx
	) {
		const client = tx ?? db;

		const discountAmount = (discountPercentage / 100) * totalAmount;
		const finalTotal = totalAmount - discountAmount;

		const [updatedPayment] = await client
			.update(schema.payment)
			.set({
				billDate,
				discount: discountAmount,
				totalAmount,
				amountPaid: finalTotal,
				status: "PAID",
				paymentDate: new Date(),
				updatedAt: new Date()
			})
			.where(eq(schema.payment.id, paymentId))
			.returning();

		if (!updatedPayment) {
			throw new Error("Payment record not found");
		}

		// Update appointment status to COMPLETED if appointment exists
		if (updatedPayment.appointmentId) {
			await client
				.update(schema.appointment)
				.set({
					status: "COMPLETED",
					updatedAt: new Date()
				})
				.where(eq(schema.appointment.id, updatedPayment.appointmentId));
		}

		return {
			...updatedPayment,
			discountPercentage,
			finalAmount: finalTotal
		};
	}
};

export type PaymentRepo = typeof paymentRepo;
