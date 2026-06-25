// db/queries/index.ts
export * from "./admin.repo";
export * from "./analytics.repo";
export * from "./appointment.repo";
export * from "./auth.repo";
export * from "./calendar.repo";
export * from "./clinic.repo";
export * from "./doctor.repo";
export * from "./growthAlerts";
export * from "./growthChart";
export * from "./growthChartCache";
export * from "./growthPercentileHistory";
export * from "./importBatches";
export * from "./labs.repo";
export * from "./medical.repo";
export * from "./patient.repo";
export * from "./patientRegistration";
export * from "./payment.repo";
export * from "./pediatric.repo";
export * from "./pharmacy.repo";
export * from "./report.repo";
export * from "./staff.repo";
export * from "./system.repo";
export * from "./visit.repo"; // NEW

// ... existing imports and exports ...

// Also export as named objects for convenience
import { adminQueries } from "./admin.repo";
import { analyticsRepo } from "./analytics.repo";
import { appointmentRepository } from "./appointment.repo";
import { authRepo } from "./auth.repo";
import { calendarRepo } from "./calendar.repo";
import { clinicRepo } from "./clinic.repo";
import { doctorRepo } from "./doctor.repo";
import { growthAlertRepo } from "./growthAlerts";
import { growthChartRepo } from "./growthChart";
import { growthChartCacheRepo } from "./growthChartCache";
import { growthPercentileRepo } from "./growthPercentileHistory";
import { importBatchRepo } from "./importBatches";
import { labsRepo } from "./labs.repo";
import { medicalRepo } from "./medical.repo";
import { patientRepo } from "./patient.repo";
import { patientRegistrationRepo } from "./patientRegistration";
import { pediatricRepo } from "./pediatric.repo";
import { pharmacyRepo } from "./pharmacy.repo";
import { staffRepo } from "./staff.repo";
import { systemRepo } from "./system.repo";
import { visitRepo } from "./visit.repo";

export const queries = {
	admin: adminQueries,
	analytics: analyticsRepo,
	appointment: appointmentRepository,
	auth: authRepo,
	calendar: calendarRepo,
	clinic: clinicRepo,
	doctor: doctorRepo,
	patientRegistration: patientRegistrationRepo,
	growthAlerts: growthAlertRepo,
	labs: labsRepo,
	medical: medicalRepo,
	growthPercentileHistory: growthPercentileRepo,
	importBatches: importBatchRepo,
	growthChart: growthChartRepo,
	growthChartCache: growthChartCacheRepo,
	patient: patientRepo,
	pediatric: pediatricRepo,
	pharmacy: pharmacyRepo,
	visit: visitRepo,
	staff: staffRepo,
	system: systemRepo
};
