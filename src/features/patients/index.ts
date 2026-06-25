// products/patients/index.ts
// API
export * from "./api/mutations";
export * from "./api/queries";
export * from "./api/service";
export * from "./api/types";

// Components
export { default as PatientAppointments } from "./components/patient-appointments";
export { default as PatientDetail } from "./components/patient-detail";
export { default as PatientForm } from "./components/patient-form";
export { default as PatientGrowthChart } from "./components/patient-growth-chart";
export { default as PatientListingPage } from "./components/patient-listing";
export { default as PatientMedicalHistory } from "./components/patient-medical-history";
export * from "./components/patient-tables";
export { default as PatientViewPage } from "./components/patient-view-page";

// Constants
export * from "./constants/patient-options";

// Schemas
export * from "./schemas/patient";
