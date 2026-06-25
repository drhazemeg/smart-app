// ============================================
// RELATIONS V2 - DRIZZLE BETA
// ============================================
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, r => ({
	// ============================================
	// CORE AUTH & USER MANAGEMENT
	// ============================================

	user: {
		sessions: r.many.session({
			from: r.user.id,
			to: r.session.userId
		}),
		accounts: r.many.account({
			from: r.user.id,
			to: r.account.userId
		}),
		clinic: r.one.clinic({
			from: r.user.clinicId,
			to: r.clinic.id
		}),
		files: r.many.file({
			from: r.user.id,
			to: r.file.userId
		}),
		folders: r.many.folder({
			from: r.user.id,
			to: r.folder.userId
		}),
		twoFactor: r.one.twoFactor({
			from: r.user.id,
			to: r.twoFactor.userId
		}),
		clinicMemberships: r.many.clinicMember({
			from: r.user.id,
			to: r.clinicMember.userId
		}),
		doctorProfile: r.one.doctor({
			from: r.user.id,
			to: r.doctor.userId
		}),
		staffProfile: r.one.staff({
			from: r.user.id,
			to: r.staff.userId
		}),
		patientProfile: r.one.patient({
			from: r.user.id,
			to: r.patient.userId
		}),
		patientsCreated: r.many.patient({
			from: r.user.id,
			to: r.patient.createdById
		}),
		guardians: r.many.guardian({
			from: r.user.id,
			to: r.guardian.userId
		}),
		notifications: r.many.notification({
			from: r.user.id,
			to: r.notification.userId
		}),
		invitesCreated: r.many.invite({
			from: r.user.id,
			to: r.invite.createdBy
		}),
		invitesUsed: r.many.invite({
			from: r.user.id,
			to: r.invite.usedBy
		}),
		medicationDispenses: r.many.medicationDispense({
			from: r.user.id,
			to: r.medicationDispense.dispensedBy
		}),
		prescriptionLogs: r.many.prescriptionLog({
			from: r.user.id,
			to: r.prescriptionLog.performedBy
		}),
		// Self-referential: users invited by this user
		invitedUsers: r.many.user({
			from: r.user.id,
			to: r.user.invitedBy
		})
	},

	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id
		})
	},

	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id
		})
	},

	twoFactor: {
		user: r.one.user({
			from: r.twoFactor.userId,
			to: r.user.id
		})
	},

	// ============================================
	// CLINIC & ORGANIZATION
	// ============================================

	clinic: {
		members: r.many.clinicMember({
			from: r.clinic.id,
			to: r.clinicMember.clinicId
		}),
		settings: r.one.clinicSetting({
			from: r.clinic.id,
			to: r.clinicSetting.clinicId
		}),
		doctors: r.many.doctor({
			from: r.clinic.id,
			to: r.doctor.clinicId
		}),
		staff: r.many.staff({
			from: r.clinic.id,
			to: r.staff.clinicId
		}),
		patients: r.many.patient({
			from: r.clinic.id,
			to: r.patient.clinicId
		}),
		guardians: r.many.guardian({
			from: r.clinic.id,
			to: r.guardian.clinicId
		}),
		appointments: r.many.appointment({
			from: r.clinic.id,
			to: r.appointment.clinicId
		}),
		medicalRecords: r.many.medicalRecord({
			from: r.clinic.id,
			to: r.medicalRecord.clinicId
		}),
		vitalSigns: r.many.vitalSign({
			from: r.clinic.id,
			to: r.vitalSign.clinicId
		}),
		diagnoses: r.many.diagnosis({
			from: r.clinic.id,
			to: r.diagnosis.clinicId
		}),
		services: r.many.service({
			from: r.clinic.id,
			to: r.service.clinicId
		}),
		labTests: r.many.labTest({
			from: r.clinic.id,
			to: r.labTest.clinicId
		}),
		payments: r.many.payment({
			from: r.clinic.id,
			to: r.payment.clinicId
		}),
		patientBills: r.many.patientBill({
			from: r.clinic.id,
			to: r.patientBill.clinicId
		}),
		prescriptions: r.many.prescription({
			from: r.clinic.id,
			to: r.prescription.clinicId
		}),
		prescribedItems: r.many.prescribedItem({
			from: r.clinic.id,
			to: r.prescribedItem.clinicId
		}),
		drugs: r.many.drug({
			from: r.clinic.id,
			to: r.drug.clinicId
		}),
		vaccineSchedules: r.many.vaccineSchedule({
			from: r.clinic.id,
			to: r.vaccineSchedule.clinicId
		}),
		vaccineInventory: r.many.vaccineInventory({
			from: r.clinic.id,
			to: r.vaccineInventory.clinicId
		}),
		immunizations: r.many.immunization({
			from: r.clinic.id,
			to: r.immunization.clinicId
		}),
		adverseEvents: r.many.adverseEvent({
			from: r.clinic.id,
			to: r.adverseEvent.clinicId
		}),
		notifications: r.many.notification({
			from: r.clinic.id,
			to: r.notification.clinicId
		}),
		feedingLogs: r.many.feedingLog({
			from: r.clinic.id,
			to: r.feedingLog.clinicId
		}),
		measurements: r.many.measurement({
			from: r.clinic.id,
			to: r.measurement.clinicId
		}),
		growthAlerts: r.many.growthAlert({
			from: r.clinic.id,
			to: r.growthAlert.clinicId
		}),
		growthChartCaches: r.many.growthChartCache({
			from: r.clinic.id,
			to: r.growthChartCache.clinicId
		}),
		growthPercentileHistories: r.many.growthPercentileHistory({
			from: r.clinic.id,
			to: r.growthPercentileHistory.clinicId
		}),
		importBatches: r.many.importBatch({
			from: r.clinic.id,
			to: r.importBatch.clinicId
		}),
		users: r.many.user({
			from: r.clinic.id,
			to: r.user.clinicId
		})
	},

	clinicMember: {
		user: r.one.user({
			from: r.clinicMember.userId,
			to: r.user.id
		}),
		clinic: r.one.clinic({
			from: r.clinicMember.clinicId,
			to: r.clinic.id
		})
	},

	clinicSetting: {
		clinic: r.one.clinic({
			from: r.clinicSetting.clinicId,
			to: r.clinic.id
		})
	},

	// ============================================
	// STAFF & DOCTORS
	// ============================================

	doctor: {
		user: r.one.user({
			from: r.doctor.userId,
			to: r.user.id
		}),
		clinic: r.one.clinic({
			from: r.doctor.clinicId,
			to: r.clinic.id
		}),
		workingDays: r.many.workingDay({
			from: r.doctor.id,
			to: r.workingDay.doctorId
		}),
		appointments: r.many.appointment({
			from: r.doctor.id,
			to: r.appointment.doctorId
		}),
		medicalRecords: r.many.medicalRecord({
			from: r.doctor.id,
			to: r.medicalRecord.doctorId
		}),
		diagnoses: r.many.diagnosis({
			from: r.doctor.id,
			to: r.diagnosis.doctorId
		}),
		prescriptions: r.many.prescription({
			from: r.doctor.id,
			to: r.prescription.doctorId
		}),
		vitalSigns: r.many.vitalSign({
			from: r.doctor.id,
			to: r.vitalSign.doctorId
		})
	},

	workingDay: {
		doctor: r.one.doctor({
			from: r.workingDay.doctorId,
			to: r.doctor.id
		})
	},

	staff: {
		user: r.one.user({
			from: r.staff.userId,
			to: r.user.id
		}),
		clinic: r.one.clinic({
			from: r.staff.clinicId,
			to: r.clinic.id
		}),
		administeredImmunizations: r.many.immunization({
			from: r.staff.id,
			to: r.immunization.administeredByStaffId
		}),
		reportedAdverseEvents: r.many.adverseEvent({
			from: r.staff.id,
			to: r.adverseEvent.reportedByStaffId
		})
	},

	// ============================================
	// PATIENT MANAGEMENT
	// ============================================

	patient: {
		clinic: r.one.clinic({
			from: r.patient.clinicId,
			to: r.clinic.id
		}),
		user: r.one.user({
			from: r.patient.userId,
			to: r.user.id
		}),
		createdBy: r.one.user({
			from: r.patient.createdById,
			to: r.user.id
		}),
		updatedByUser: r.one.user({
			from: r.patient.updatedById,
			to: r.user.id
		}),
		// Patient-Guardian many-to-many through junction table
		guardians: r.many.guardian({
			from: r.patient.id.through(r.patientGuardian.patientId),
			to: r.guardian.id.through(r.patientGuardian.guardianId)
		}),
		developmentalMilestones: r.many.developmentalMilestones({
			from: r.patient.id,
			to: r.developmentalMilestones.patientId
		}),
		appointments: r.many.appointment({
			from: r.patient.id,
			to: r.appointment.patientId
		}),
		medicalRecords: r.many.medicalRecord({
			from: r.patient.id,
			to: r.medicalRecord.patientId
		}),
		diagnoses: r.many.diagnosis({
			from: r.patient.id,
			to: r.diagnosis.patientId
		}),
		vitalSigns: r.many.vitalSign({
			from: r.patient.id,
			to: r.vitalSign.patientId
		}),
		immunizations: r.many.immunization({
			from: r.patient.id,
			to: r.immunization.patientId
		}),
		adverseEvents: r.many.adverseEvent({
			from: r.patient.id,
			to: r.adverseEvent.patientId
		}),
		payments: r.many.payment({
			from: r.patient.id,
			to: r.payment.patientId
		}),
		prescriptions: r.many.prescription({
			from: r.patient.id,
			to: r.prescription.patientId
		}),
		labTests: r.many.labTest({
			from: r.patient.id,
			to: r.labTest.patientId
		}),
		feedingLogs: r.many.feedingLog({
			from: r.patient.id,
			to: r.feedingLog.patientId
		}),
		measurements: r.many.measurement({
			from: r.patient.id,
			to: r.measurement.patientId
		}),
		growthAlerts: r.many.growthAlert({
			from: r.patient.id,
			to: r.growthAlert.patientId
		}),
		growthChartCaches: r.many.growthChartCache({
			from: r.patient.id,
			to: r.growthChartCache.patientId
		}),
		growthPercentileHistories: r.many.growthPercentileHistory({
			from: r.patient.id,
			to: r.growthPercentileHistory.patientId
		})
	},

	// ============================================
	// PATIENT-GUARDIAN JUNCTION
	// ============================================

	patientGuardian: {
		patient: r.one.patient({
			from: r.patientGuardian.patientId,
			to: r.patient.id
		}),
		guardian: r.one.guardian({
			from: r.patientGuardian.guardianId,
			to: r.guardian.id
		})
	},

	guardian: {
		clinic: r.one.clinic({
			from: r.guardian.clinicId,
			to: r.clinic.id
		}),
		user: r.one.user({
			from: r.guardian.userId,
			to: r.user.id
		}),
		patients: r.many.patient({
			from: r.guardian.id.through(r.patientGuardian.guardianId),
			to: r.patient.id.through(r.patientGuardian.patientId)
		})
	},

	// ============================================
	// APPOINTMENTS & SCHEDULING
	// ============================================

	appointment: {
		clinic: r.one.clinic({
			from: r.appointment.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.appointment.patientId,
			to: r.patient.id
		}),
		doctor: r.one.doctor({
			from: r.appointment.doctorId,
			to: r.doctor.id
		}),
		service: r.one.service({
			from: r.appointment.serviceId,
			to: r.service.id
		}),
		medicalRecords: r.many.medicalRecord({
			from: r.appointment.id,
			to: r.medicalRecord.appointmentId
		}),
		diagnoses: r.many.diagnosis({
			from: r.appointment.id,
			to: r.diagnosis.appointmentId
		}),
		payments: r.many.payment({
			from: r.appointment.id,
			to: r.payment.appointmentId
		})
	},

	service: {
		clinic: r.one.clinic({
			from: r.service.clinicId,
			to: r.clinic.id
		}),
		appointments: r.many.appointment({
			from: r.service.id,
			to: r.appointment.serviceId
		}),
		labTests: r.many.labTest({
			from: r.service.id,
			to: r.labTest.serviceId
		}),
		patientBills: r.many.patientBill({
			from: r.service.id,
			to: r.patientBill.serviceId
		})
	},

	// ============================================
	// MEDICAL RECORDS & CLINICAL DATA
	// ============================================

	medicalRecord: {
		clinic: r.one.clinic({
			from: r.medicalRecord.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.medicalRecord.patientId,
			to: r.patient.id
		}),
		appointment: r.one.appointment({
			from: r.medicalRecord.appointmentId,
			to: r.appointment.id
		}),
		doctor: r.one.doctor({
			from: r.medicalRecord.doctorId,
			to: r.doctor.id
		}),
		diagnoses: r.many.diagnosis({
			from: r.medicalRecord.id,
			to: r.diagnosis.medicalId
		}),
		vitalSigns: r.many.vitalSign({
			from: r.medicalRecord.id,
			to: r.vitalSign.medicalRecordId
		}),
		immunizations: r.many.immunization({
			from: r.medicalRecord.id,
			to: r.immunization.recordId
		}),
		prescriptions: r.many.prescription({
			from: r.medicalRecord.id,
			to: r.prescription.medicalRecordId
		}),
		measurements: r.many.measurement({
			from: r.medicalRecord.id,
			to: r.measurement.medicalRecordId
		}),
		labTests: r.many.labTest({
			from: r.medicalRecord.id,
			to: r.labTest.recordId
		})
	},

	diagnosis: {
		patient: r.one.patient({
			from: r.diagnosis.patientId,
			to: r.patient.id
		}),
		doctor: r.one.doctor({
			from: r.diagnosis.doctorId,
			to: r.doctor.id
		}),
		clinic: r.one.clinic({
			from: r.diagnosis.clinicId,
			to: r.clinic.id
		}),
		appointment: r.one.appointment({
			from: r.diagnosis.appointmentId,
			to: r.appointment.id
		}),
		medicalRecord: r.one.medicalRecord({
			from: r.diagnosis.medicalId,
			to: r.medicalRecord.id
		}),
		vitalSigns: r.many.vitalSign({
			from: r.diagnosis.id,
			to: r.vitalSign.encounterId
		}),
		labTests: r.many.labTest({
			from: r.diagnosis.id,
			to: r.labTest.diagnosisId
		}),
		prescriptions: r.many.prescription({
			from: r.diagnosis.id,
			to: r.prescription.encounterId
		})
	},

	vitalSign: {
		clinic: r.one.clinic({
			from: r.vitalSign.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.vitalSign.patientId,
			to: r.patient.id
		}),
		measurement: r.one.measurement({
			from: r.vitalSign.measurementId,
			to: r.measurement.id
		}),

		medicalRecord: r.one.medicalRecord({
			from: r.vitalSign.medicalRecordId,
			to: r.medicalRecord.id
		}),
		encounter: r.one.diagnosis({
			from: r.vitalSign.encounterId,
			to: r.diagnosis.id
		})
	},

	// ============================================
	// MEDICATIONS & PRESCRIPTIONS
	// ============================================

	drug: {
		clinic: r.one.clinic({
			from: r.drug.clinicId,
			to: r.clinic.id
		}),
		doseGuidelines: r.many.doseGuideline({
			from: r.drug.id,
			to: r.doseGuideline.drugId
		}),
		prescribedItems: r.many.prescribedItem({
			from: r.drug.id,
			to: r.prescribedItem.drugId
		})
	},

	doseGuideline: {
		drug: r.one.drug({
			from: r.doseGuideline.drugId,
			to: r.drug.id
		})
	},

	prescription: {
		clinic: r.one.clinic({
			from: r.prescription.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.prescription.patientId,
			to: r.patient.id
		}),
		doctor: r.one.doctor({
			from: r.prescription.doctorId,
			to: r.doctor.id
		}),
		medicalRecord: r.one.medicalRecord({
			from: r.prescription.medicalRecordId,
			to: r.medicalRecord.id
		}),
		encounter: r.one.diagnosis({
			from: r.prescription.encounterId,
			to: r.diagnosis.id
		}),
		prescribedItems: r.many.prescribedItem({
			from: r.prescription.id,
			to: r.prescribedItem.prescriptionId
		}),
		medicationDispenses: r.many.medicationDispense({
			from: r.prescription.id,
			to: r.medicationDispense.prescriptionId
		}),
		logs: r.many.prescriptionLog({
			from: r.prescription.id,
			to: r.prescriptionLog.prescriptionId
		})
	},

	prescribedItem: {
		prescription: r.one.prescription({
			from: r.prescribedItem.prescriptionId,
			to: r.prescription.id
		}),
		clinic: r.one.clinic({
			from: r.prescribedItem.clinicId,
			to: r.clinic.id
		}),
		drug: r.one.drug({
			from: r.prescribedItem.drugId,
			to: r.drug.id
		}),
		medicationDispenses: r.many.medicationDispense({
			from: r.prescribedItem.id,
			to: r.medicationDispense.prescribedItemId
		})
	},

	medicationDispense: {
		prescribedItem: r.one.prescribedItem({
			from: r.medicationDispense.prescribedItemId,
			to: r.prescribedItem.id
		}),
		prescription: r.one.prescription({
			from: r.medicationDispense.prescriptionId,
			to: r.prescription.id
		}),
		dispensedByUser: r.one.user({
			from: r.medicationDispense.dispensedBy,
			to: r.user.id
		})
	},

	prescriptionLog: {
		prescription: r.one.prescription({
			from: r.prescriptionLog.prescriptionId,
			to: r.prescription.id
		}),
		performedByUser: r.one.user({
			from: r.prescriptionLog.performedBy,
			to: r.user.id
		})
	},

	// ============================================
	// IMMUNIZATIONS & VACCINES
	// ============================================

	vaccineSchedule: {
		clinic: r.one.clinic({
			from: r.vaccineSchedule.clinicId,
			to: r.clinic.id
		})
	},

	vaccineInventory: {
		clinic: r.one.clinic({
			from: r.vaccineInventory.clinicId,
			to: r.clinic.id
		}),
		immunizations: r.many.immunization({
			from: r.vaccineInventory.id,
			to: r.immunization.vaccineInventoryId
		})
	},

	immunization: {
		clinic: r.one.clinic({
			from: r.immunization.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.immunization.patientId,
			to: r.patient.id
		}),
		administeredBy: r.one.staff({
			from: r.immunization.administeredByStaffId,
			to: r.staff.id
		}),
		medicalRecord: r.one.medicalRecord({
			from: r.immunization.recordId,
			to: r.medicalRecord.id
		}),
		vaccineInventory: r.one.vaccineInventory({
			from: r.immunization.vaccineInventoryId,
			to: r.vaccineInventory.id
		}),
		adverseEvents: r.many.adverseEvent({
			from: r.immunization.id,
			to: r.adverseEvent.immunizationId
		})
	},

	adverseEvent: {
		immunization: r.one.immunization({
			from: r.adverseEvent.immunizationId,
			to: r.immunization.id
		}),
		patient: r.one.patient({
			from: r.adverseEvent.patientId,
			to: r.patient.id
		}),
		reportedBy: r.one.staff({
			from: r.adverseEvent.reportedByStaffId,
			to: r.staff.id
		})
	},

	// ============================================
	// BILLING & PAYMENTS
	// ============================================

	patientBill: {
		clinic: r.one.clinic({
			from: r.patientBill.clinicId,
			to: r.clinic.id
		}),
		service: r.one.service({
			from: r.patientBill.serviceId,
			to: r.service.id
		}),
		payment: r.one.payment({
			from: r.patientBill.billId,
			to: r.payment.billId
		})
	},

	payment: {
		clinic: r.one.clinic({
			from: r.payment.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.payment.patientId,
			to: r.patient.id
		}),
		appointment: r.one.appointment({
			from: r.payment.appointmentId,
			to: r.appointment.id
		}),
		bill: r.one.patientBill({
			from: r.payment.billId,
			to: r.patientBill.billId
		})
	},

	// ============================================
	// LABS & DIAGNOSTICS
	// ============================================

	labTest: {
		clinic: r.one.clinic({
			from: r.labTest.clinicId,
			to: r.clinic.id
		}),
		patient: r.one.patient({
			from: r.labTest.patientId,
			to: r.patient.id
		}),
		medicalRecord: r.one.medicalRecord({
			from: r.labTest.recordId,
			to: r.medicalRecord.id
		}),
		service: r.one.service({
			from: r.labTest.serviceId,
			to: r.service.id
		}),
		diagnosis: r.one.diagnosis({
			from: r.labTest.diagnosisId,
			to: r.diagnosis.id
		})
	},

	// ============================================
	// FEEDING & NUTRITION
	// ============================================

	feedingLog: {
		patient: r.one.patient({
			from: r.feedingLog.patientId,
			to: r.patient.id
		}),
		clinic: r.one.clinic({
			from: r.feedingLog.clinicId,
			to: r.clinic.id
		})
	},

	// ============================================
	// NOTIFICATIONS & ALERTS
	// ============================================

	notification: {
		user: r.one.user({
			from: r.notification.userId,
			to: r.user.id
		}),
		clinic: r.one.clinic({
			from: r.notification.clinicId,
			to: r.clinic.id
		})
	},

	growthAlert: {
		patient: r.one.patient({
			from: r.growthAlert.patientId,
			to: r.patient.id
		}),
		measurement: r.one.measurement({
			from: r.growthAlert.measurementId,
			to: r.measurement.id
		})
	},

	// ============================================
	// GROWTH & DEVELOPMENT (HIGH PRECISION)
	// ============================================

	measurement: {
		patient: r.one.patient({
			from: r.measurement.patientId,
			to: r.patient.id
		}),
		createdByUser: r.one.user({
			from: r.measurement.createdBy,
			to: r.user.id
		}),
		updatedByUser: r.one.user({
			from: r.measurement.updatedBy,
			to: r.user.id
		}),
		growthAlerts: r.many.growthAlert({
			from: r.measurement.id,
			to: r.growthAlert.measurementId
		}),
		growthPercentileHistories: r.many.growthPercentileHistory({
			from: r.measurement.id,
			to: r.growthPercentileHistory.measurementId
		})
	},

	lmsReference: {
		// Self-referential for age interpolation
		nextAgePoint: r.one.lmsReference({
			from: [r.lmsReference.gender, r.lmsReference.metric, r.lmsReference.ageMonths],
			to: [r.lmsReference.gender, r.lmsReference.metric, r.lmsReference.ageMonths]
		}),
		previousAgePoint: r.one.lmsReference({
			from: [r.lmsReference.gender, r.lmsReference.metric, r.lmsReference.ageMonths],
			to: [r.lmsReference.gender, r.lmsReference.metric, r.lmsReference.ageMonths]
		})
	},

	growthChartCache: {
		patient: r.one.patient({
			from: r.growthChartCache.patientId,
			to: r.patient.id
		})
	},

	growthPercentileHistory: {
		patient: r.one.patient({
			from: r.growthPercentileHistory.patientId,
			to: r.patient.id
		}),
		measurement: r.one.measurement({
			from: r.growthPercentileHistory.measurementId,
			to: r.measurement.id
		})
	},

	velocityStandard: {
		// Self-referential for age range lookups
		nextAgeRange: r.one.velocityStandard({
			from: [r.velocityStandard.gender, r.velocityStandard.parameter],
			to: [r.velocityStandard.gender, r.velocityStandard.parameter]
		})
	},

	// ============================================
	// FILE MANAGEMENT
	// ============================================

	folder: {
		user: r.one.user({
			from: r.folder.userId,
			to: r.user.id
		}),
		parent: r.one.folder({
			from: r.folder.parentId,
			to: r.folder.id
		}),
		subfolders: r.many.folder({
			from: r.folder.id,
			to: r.folder.parentId
		}),
		files: r.many.file({
			from: r.folder.id,
			to: r.file.folderId
		})
	},

	file: {
		user: r.one.user({
			from: r.file.userId,
			to: r.user.id
		}),
		folder: r.one.folder({
			from: r.file.folderId,
			to: r.folder.id
		})
	},

	// ============================================
	// CONFIGURATION & SYSTEM
	// ============================================

	invite: {
		createdByUser: r.one.user({
			from: r.invite.createdBy,
			to: r.user.id
		}),
		usedByUser: r.one.user({
			from: r.invite.usedBy,
			to: r.user.id
		})
	},

	// ============================================
	// IMPORT & DATA MANAGEMENT
	// ============================================

	importBatch: {
		clinic: r.one.clinic({
			from: r.importBatch.clinicId,
			to: r.clinic.id
		})
	}

	// ============================================
	// LEGACY TABLES
	// ============================================
}));

export default relations;
