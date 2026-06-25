// products/doctors/components/doctor-tables/options.tsx
import {
	availabilityStatusOptions as availabilityOptions,
	departmentOptions,
	doctorTypeOptions,
	specialtyOptions,
	statusOptions
} from "../../constants/doctor-options";

export const SPECIALTY_OPTIONS = specialtyOptions;
export const DEPARTMENT_OPTIONS = departmentOptions;
export const AVAILABILITY_STATUS_OPTIONS = availabilityOptions;
export const DOCTOR_TYPE_OPTIONS = doctorTypeOptions;
export const STATUS_OPTIONS = statusOptions;

export const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	ACTIVE: "default",
	INACTIVE: "destructive",
	PENDING: "secondary",
	SUSPENDED: "destructive",
	AVAILABLE: "default",
	UNAVAILABLE: "destructive",
	ON_LEAVE: "secondary"
};
