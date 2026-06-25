import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { adminQueries } from "@/db/queries/admin.repo";

// Schema definitions
const clinicIdSchema = z.object({ clinicId: z.string() });
const appointmentIdsSchema = z.object({
	appointmentIds: z.array(z.string()),
	status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
	reason: z.string().optional()
});
const cancelAppointmentSchema = z.object({
	appointmentId: z.string(),
	clinicId: z.string(),
	reason: z.string().optional()
});
const rescheduleSchema = z.object({
	id: z.string(),
	newDate: z.date(),
	clinicId: z.string()
});
const updateAppointmentSchema = z.object({
	id: z.string(),
	clinicId: z.string(),
	data: z.object({
		status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
		reason: z.string().optional(),
		note: z.string().optional(),
		appointmentDate: z.date().optional(),
		time: z.string().optional(),
		durationMinutes: z.number().optional(),
		appointmentPrice: z.number().optional(),
		type: z.string().optional()
	})
});
const createClinicSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1),
	address: z.string(),
	phone: z.string().optional(),
	email: z.email().optional(),
	timezone: z.string().optional(),
	isDeleted: z.boolean().optional()
});
const userIdSchema = z.object({ userId: z.string() });
const doctorRecordSchema = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	name: z.string()
});
const staffRecordSchema = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	name: z.string()
});
const patientRecordSchema = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	firstName: z.string(),
	lastName: z.string()
});
const updateUserSchema = z.object({
	userId: z.string(),
	clinicId: z.string(),
	name: z.string().optional()
});
const configKeySchema = z.object({ key: z.string() });

// Server Functions - Directly using adminQueries

// const getAppointmentCountsByStatus = createServerFn({ method: "GET" })
// 	.validator(clinicIdSchema)
// 	.handler(async ({ data }) => {
// 		try {
// 			return await adminQueries.getAppointmentCountsByStatus(data.clinicId);
// 		} catch (error) {
// 			console.error("Error getting appointment counts:", error);
// 			throw new Error("Failed to get appointment counts");
// 		}
// 	});

const setDefaultClinic = createServerFn({ method: "POST" })
	.validator(clinicIdSchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.setDefaultClinic(data.clinicId);
		} catch (error) {
			console.error("Error setting default clinic:", error);
			throw new Error("Failed to set default clinic");
		}
	});

const getConfigValue = createServerFn({ method: "GET" })
	.validator(configKeySchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.getConfigValue(data.key);
		} catch (error) {
			console.error("Error getting config value:", error);
			throw new Error("Failed to get config value");
		}
	});

const bulkUpdateAppointmentsStatus = createServerFn({ method: "POST" })
	.validator(appointmentIdsSchema)
	.handler(async ({ data }) => {
		try {
			const { appointmentIds, status, reason } = data;
			return await adminQueries.bulkUpdateAppointmentsStatus(appointmentIds, status, reason);
		} catch (error) {
			console.error("Error bulk updating appointments:", error);
			throw new Error("Failed to bulk update appointments");
		}
	});

const cancelExistingAppointment = createServerFn({ method: "POST" })
	.validator(cancelAppointmentSchema)
	.handler(async ({ data }) => {
		try {
			const { appointmentId, clinicId, reason } = data;
			return await adminQueries.cancelExistingAppointment(appointmentId, clinicId, reason);
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			throw new Error("Failed to cancel appointment");
		}
	});

const updateExistingAppointment = createServerFn({ method: "POST" })
	.validator(updateAppointmentSchema)
	.handler(async ({ data }) => {
		try {
			const { id, clinicId, data: updateData } = data;
			return await adminQueries.updateExistingAppointment(id, {
				...updateData,
				id,
				clinicId
			});
		} catch (error) {
			console.error("Error updating appointment:", error);
			throw new Error("Failed to update appointment");
		}
	});

const rescheduleExistingAppointment = createServerFn({ method: "POST" })
	.validator(rescheduleSchema)
	.handler(async ({ data }) => {
		try {
			const { id, newDate, clinicId } = data;
			return await adminQueries.rescheduleExistingAppointment(id, newDate, clinicId);
		} catch (error) {
			console.error("Error rescheduling appointment:", error);
			throw new Error("Failed to reschedule appointment");
		}
	});

// const getMonthlyAppointmentData = createServerFn({ method: "GET" })
// 	.validator(clinicIdSchema)
// 	.handler(async ({ data }) => {
// 		try {
// 			return await adminQueries.getMonthlyAppointmentData(data.clinicId);
// 		} catch (error) {
// 			console.error("Error getting monthly appointment data:", error);
// 			throw new Error("Failed to get monthly appointment data");
// 		}
// 	});

const getUserRoleById = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.getUserRoleById(data.userId);
		} catch (error) {
			console.error("Error getting user role:", error);
			throw new Error("Failed to get user role");
		}
	});

const getAdminOnboardedStatus = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await adminQueries.getAdminOnboardedStatus();
	} catch (error) {
		console.error("Error getting admin onboarded status:", error);
		throw new Error("Failed to get admin onboarded status");
	}
});

const setAdminOnboarded = createServerFn({ method: "POST" }).handler(async () => {
	try {
		return await adminQueries.setAdminOnboarded();
	} catch (error) {
		console.error("Error setting admin onboarded:", error);
		throw new Error("Failed to set admin onboarded");
	}
});

const upsertConfigStore = createServerFn({ method: "POST" })
	.validator(configKeySchema.extend({ value: z.string() }))
	.handler(async ({ data }) => {
		try {
			const { key, value } = data;
			return await adminQueries.upsertConfigStore(key, value);
		} catch (error) {
			console.error("Error upserting config:", error);
			throw new Error("Failed to upsert config");
		}
	});

// const getDefaultClinic = createServerFn({ method: "GET" }).handler(async () => {
// 	try {
// 		return await adminQueries.getDefaultClinic();
// 	} catch (error) {
// 		console.error("Error getting default clinic:", error);
// 		throw new Error("Failed to get default clinic");
// 	}
// });

// const getClinicByName = createServerFn({ method: "GET" })
// 	.validator(clinicByNameSchema)
// 	.handler(async ({ data }) => {
// 		try {
// 			return await adminQueries.getClinicByName(data.name);
// 		} catch (error) {
// 			console.error("Error getting clinic by name:", error);
// 			throw new Error("Failed to get clinic by name");
// 		}
// 	});

const createClinicWithDetails = createServerFn({ method: "POST" })
	.validator(createClinicSchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.createClinicWithDetails({
				...data,
				id: data.id ?? crypto.randomUUID()
			});
		} catch (error) {
			console.error("Error creating clinic:", error);
			throw new Error("Failed to create clinic");
		}
	});

const getUserFiles = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.getUserFiles(data.userId);
		} catch (error) {
			console.error("Error getting user files:", error);
			throw new Error("Failed to get user files");
		}
	});

const createDoctorRecord = createServerFn({ method: "POST" })
	.validator(doctorRecordSchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.createDoctorRecord(data);
		} catch (error) {
			console.error("Error creating doctor record:", error);
			throw new Error("Failed to create doctor record");
		}
	});

const createStaffRecord = createServerFn({ method: "POST" })
	.validator(staffRecordSchema)
	.handler(async ({ data }) => {
		try {
			return await adminQueries.createStaffRecord(data);
		} catch (error) {
			console.error("Error creating staff record:", error);
			throw new Error("Failed to create staff record");
		}
	});

const createPatientRecord = createServerFn({ method: "POST" })
	.validator(patientRecordSchema)
	.handler(async ({ data }) => {
		try {
			// Note: adminQueries.createPatientRecord expects a tx parameter as the second argument
			// We'll pass undefined to use the default db connection
			return await adminQueries.createPatientRecord(data);
		} catch (error) {
			console.error("Error creating patient record:", error);
			throw new Error("Failed to create patient record");
		}
	});

const updateUserToAdmin = createServerFn({ method: "POST" })
	.validator(updateUserSchema)
	.handler(async ({ data }) => {
		try {
			const { userId, clinicId, name } = data;
			return await adminQueries.updateUserToAdmin(userId, clinicId, name);
		} catch (error) {
			console.error("Error updating user to admin:", error);
			throw new Error("Failed to update user to admin");
		}
	});

export {
	bulkUpdateAppointmentsStatus,
	cancelExistingAppointment,
	createClinicWithDetails,
	createDoctorRecord,
	createPatientRecord,
	createStaffRecord,
	getAdminOnboardedStatus,
	getConfigValue,
	getUserFiles,
	getUserRoleById,
	rescheduleExistingAppointment,
	setAdminOnboarded,
	setDefaultClinic,
	updateExistingAppointment,
	updateUserToAdmin,
	upsertConfigStore
};
