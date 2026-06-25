// db/repositories/system.repo.ts

import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { systemRepo } from "@/db/queries";
import { PaymentCreateSchema } from "@/db/zod";

// =======================
// Zod Validators
// =======================

type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | JSONValue[];

interface SerializableNotification {
	actions: { label: string; href: string; payload?: Record<string, JSONValue> }[] | null;
	body: string;
	clinicId: string;
	createdAt: Date;
	id: string;
	metadata: Record<string, JSONValue> | null;
	priority: "high" | "medium" | "low" | null;
	status: "read" | "unread";
	title: string;
	type: string | null;
	updatedAt: Date;
	userId: string;
}

const searchFilesSchema = z.object({
	userId: z.string(),
	searchTerm: z.string()
});

const advancedSearchSchema = z.object({
	clinicId: z.string().optional(),
	patientName: z.string().optional(),
	doctorName: z.string().optional(),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
});

const notificationsListSchema = z.object({
	userId: z.string(),
	clinicId: z.string().optional(),
	status: z.enum(["all", "read", "unread"]).default("all"),
	type: z.string().nullable().optional(),
	search: z.string().optional(),
	limit: z.number().default(20),
	offset: z.number().default(0)
});

const markNotificationReadSchema = z.object({
	notificationId: z.string(),
	userId: z.string().optional()
});

const markAllReadSchema = z.object({
	userId: z.string(),
	clinicId: z.string().optional()
});

const deleteNotificationSchema = z.object({
	notificationId: z.string(),
	userId: z.string()
});

const clearNotificationsSchema = z.object({
	userId: z.string(),
	clinicId: z.string().optional()
});

const clinicAnalyticsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

// const checkVitalSignsAccessSchema = z.object({
// 	userId: z.string(),
// 	patientId: z.string()
// });

// const checkDoctorAccessSchema = z.object({
// 	doctorId: z.string(),
// 	userId: z.string(),
// 	clinicId: z.string().optional()
// });

const createPaymentSchema = z.object({
	id: z.string().optional(),
	patientId: z.string(),
	clinicId: z.string(),
	appointmentId: z.string().optional(),
	amount: z.number(),
	totalAmount: z.number().optional(),
	status: z.enum(["PAID", "UNPAID", "PENDING", "REFUNDED", "PARTIAL"]).default("PENDING"),
	billDate: z.date().optional(),
	paymentMethod: z.enum(["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"]).optional(),
	notes: z.string().optional(),
	discount: z.number().optional(),
	insuranceId: z.string().optional(),
	receiptNumber: z.number().optional()
});

const invoiceSchema = z.object({
	id: z.string().optional(),
	patientId: z.string(),
	clinicId: z.string(),
	appointmentId: z.string().optional(),
	items: z.array(
		z.object({
			description: z.string(),
			amount: z.number()
		})
	),
	notes: z.string().optional()
});

const processPaymentSchema = z.object({
	paymentId: z.string(),
	amountPaid: z.number(),
	paymentMethod: z.enum(["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"]),
	notes: z.string().optional()
});

// =======================
// Server Functions
// =======================

const searchFiles = createServerFn({ method: "POST" })
	.validator(searchFilesSchema)
	.handler(async ({ data }) => {
		try {
			const { userId, searchTerm } = data;
			return await systemRepo.searchFiles(userId, searchTerm);
		} catch (error) {
			console.error("Error searching files:", error);
			throw new Error("Failed to search files");
		}
	});

// Also fix advancedSearch to use repository
const advancedSearch = createServerFn({ method: "POST" })
	.validator(advancedSearchSchema)
	.handler(async ({ data }) => {
		try {
			return await systemRepo.advancedSearch(data);
		} catch (error) {
			console.error("Error in advanced search:", error);
			throw new Error("Failed to perform advanced search");
		}
	});

const getUserNotifications = createServerFn({ method: "GET" })
	.validator(
		z.object({
			userId: z.string(),
			clinicId: z.string().optional(),
			limit: z.number().default(5),
			offset: z.number().default(0)
		})
	)
	.handler(async ctx => {
		try {
			const { userId, clinicId, limit, offset } = ctx.data;

			// ✅ RQB v2 object syntax
			const notifications = await systemRepo.getUserNotifications(userId, clinicId, limit, offset);
			return notifications as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error getting user notifications:", error);
			throw new Error("Failed to get notifications");
		}
	});

const listNotifications = createServerFn({ method: "POST" })
	.validator(notificationsListSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId, status, type, search, limit, offset } = ctx.data;
			const { items, total, unreadCount } = await systemRepo.listNotifications({
				userId,
				clinicId,
				status, // Assuming status is directly usable by systemRepo.listNotifications
				type,
				search,
				limit,
				offset
			});
			return {
				items: items as unknown as SerializableNotification[],
				total,
				unreadCount
			};
		} catch (error) {
			console.error("Error listing notifications:", error);
			throw new Error("Failed to list notifications");
		}
	});

const markNotificationsAsRead = createServerFn({ method: "POST" })
	.validator(markNotificationReadSchema)
	.handler(async ctx => {
		try {
			const { notificationId, userId } = ctx.data;
			const result = await systemRepo.markNotificationsAsRead(notificationId, userId);
			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error marking notification as read:", error);
			throw new Error("Failed to mark notification as read");
		}
	});

const markAllNotificationsAsRead = createServerFn({ method: "POST" })
	.validator(markAllReadSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const result = await systemRepo.markAllNotificationsAsRead(userId, clinicId);
			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
			throw new Error("Failed to mark all notifications as read");
		}
	});

const deleteNotification = createServerFn({ method: "POST" })
	.validator(deleteNotificationSchema)
	.handler(async ctx => {
		try {
			const { notificationId, userId } = ctx.data;
			const result = await systemRepo.deleteNotification(notificationId, userId);
			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error deleting notification:", error);
			throw new Error("Failed to delete notification");
		}
	});

const clearAllNotifications = createServerFn({ method: "POST" })
	.validator(clearNotificationsSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const result = await systemRepo.clearAllNotifications(userId, clinicId);
			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error clearing notifications:", error);
			throw new Error("Failed to clear notifications");
		}
	});

const getClinicAnalytics = createServerFn({ method: "POST" })
	.validator(clinicAnalyticsSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			return await systemRepo.getClinicAnalytics(clinicId, startDate, endDate);
		} catch (error) {
			console.error("Error getting clinic analytics:", error);
			throw new Error("Failed to get clinic analytics");
		}
	});

// const checkVitalSignsAccess = createServerFn({ method: "POST" })
// 	.validator(checkVitalSignsAccessSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { userId, patientId } = ctx.data;

// 			// ✅ FIX: Use object syntax with with clause
// 			const userData = await db.query.user.findFirst({
// 				where: { id: userId },
// 				with: {
// 					patients: true,
// 					doctors: true
// 				}
// 			});

// 			if (!userData) return false;
// 			if (userData.role === "admin" || userData.role === "staff") return true;
// 			if (userData.role === "doctor" && userData.doctors) return true;

// 			if (userData.role === "patient" && Array.isArray(userData.patients)) {
// 				return userData.patients.some(p => p.id === patientId);
// 			}

// 			const guardianRecord = await db.query.guardian.findFirst({
// 				where: {
// 					userId,
// 					patientId
// 				}
// 			});

// 			return !!guardianRecord;
// 		} catch (error) {
// 			console.error("Error checking vital signs access:", error);
// 			throw new Error("Failed to check access");
// 		}
// 	});

// const checkDoctorAccess = createServerFn({ method: "POST" })
// 	.validator(checkDoctorAccessSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { doctorId, userId, clinicId } = ctx.data;

// 			const userRecord = await db.query.user.findFirst({
// 				where: { id: userId },
// 				with: {
// 					doctors: true,
// 					clinics: true
// 				}
// 			});

// 			if (!userRecord) return false;
// 			if (userRecord.role === "admin" || userRecord.role === "superadmin") return true;
// 			if (userRecord.role === "staff") return true;

// 			if (userRecord.role === "doctor") {
// 				const doctorRecord = await db.query.doctor.findFirst({
// 					where: {
// 						userId,
// 						id: doctorId
// 					}
// 				});
// 				return !!doctorRecord;
// 			}

// 			if (clinicId) {
// 				const clinicMember = await db.query.clinicMember.findFirst({
// 					where: {
// 						userId,
// 						clinicId
// 					}
// 				});
// 				return !!clinicMember;
// 			}

// 			return false;
// 		} catch (error) {
// 			console.error("Error checking doctor access:", error);
// 			throw new Error("Failed to check access");
// 		}
// 	});

const createPayment = createServerFn({ method: "POST" })
	.validator(PaymentCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await systemRepo.createPayment({
				...data,
				totalAmount: data.totalAmount ?? 0
			});
			return result;
		} catch (error) {
			console.error("Error creating payment:", error);
			throw new Error("Failed to create payment");
		}
	});

const recordPayment = createServerFn({ method: "POST" })
	.validator(PaymentCreateSchema)
	.handler(async ctx => {
		try {
			const result = await systemRepo.recordPayment(ctx.data);
			return result;
		} catch (error) {
			console.error("Error recording payment:", error);
			throw new Error("Failed to record payment");
		}
	});

const createInvoice = createServerFn({ method: "POST" })
	.validator(invoiceSchema)
	.handler(async ctx => {
		try {
			// Destructure everything needed, including clinicId and dueDate
			const { patientId, clinicId, appointmentId, items, notes } = ctx.data;

			// Pass a single object matching the expected repository structure
			const result = await systemRepo.createInvoice({
				patientId,
				clinicId,
				appointmentId,
				items,
				notes
			});

			return result;
		} catch (error) {
			console.error("Error creating invoice:", error);
			throw new Error("Failed to create invoice");
		}
	});

const updatePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: createPaymentSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const result = await systemRepo.updatePayment(id, data);
			return result;
		} catch (error) {
			console.error("Error updating payment:", error);
			throw new Error("Failed to update payment");
		}
	});

const deletePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await systemRepo.deletePayment(id);
			return result;
		} catch (error) {
			console.error("Error deleting payment:", error);
			throw new Error("Failed to delete payment");
		}
	});

const softDeletePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await systemRepo.softDeletePayment(id);
			return result;
		} catch (error) {
			console.error("Error soft deleting payment:", error);
			throw new Error("Failed to soft delete payment");
		}
	});

const restorePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const result = await systemRepo.restorePayment(id);
			return result;
		} catch (error) {
			console.error("Error restoring payment:", error);
			throw new Error("Failed to restore payment");
		}
	});

const generateReceipt = createServerFn({ method: "GET" })
	.validator(z.object({ paymentId: z.string() }))
	.handler(async ctx => {
		try {
			const { paymentId } = ctx.data;
			const receipt = await systemRepo.generateReceipt(paymentId);
			return receipt;
		} catch (error) {
			console.error("Error generating receipt:", error);
			throw new Error("Failed to generate receipt");
		}
	});

const processPaymentWithReceipt = createServerFn({ method: "POST" })
	.validator(processPaymentSchema)
	.handler(async ctx => {
		try {
			const { paymentId, amountPaid, paymentMethod, notes } = ctx.data;
			const result = await systemRepo.processPaymentWithReceipt(paymentId, amountPaid, paymentMethod, notes);
			return result;
		} catch (error) {
			console.error("Error processing payment with receipt:", error);
			throw new Error("Failed to process payment");
		}
	});

export {
	advancedSearch,
	// checkDoctorAccess,
	// checkVitalSignsAccess,
	clearAllNotifications,
	createInvoice,
	createPayment,
	deleteNotification,
	deletePayment,
	generateReceipt,
	getClinicAnalytics,
	getUserNotifications,
	listNotifications,
	markAllNotificationsAsRead,
	markNotificationsAsRead,
	processPaymentWithReceipt,
	recordPayment,
	restorePayment,
	searchFiles,
	softDeletePayment,
	updatePayment
};
