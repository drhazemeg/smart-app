// products/doctors/index.ts
// API
export * from "./api/mutations";
export * from "./api/queries";
export * from "./api/service";
export * from "./api/types";

// Components
export { default as DoctorForm } from "./components/doctor-form";
export { default as DoctorListingPage } from "./components/doctor-listing";
export { default as DoctorSchedule } from "./components/doctor-schedule";
export * from "./components/doctor-tables";
export { default as DoctorViewPage } from "./components/doctor-view-page";

// Constants
export * from "./constants/doctor-options";

// Schemas
export * from "./schemas";
