// products/patients/components/patient-tables/options.tsx
import { bloodGroupOptions, genderOptions, statusOptions } from "../../constants/patient-options";

export const GENDER_OPTIONS = genderOptions;
export const BLOOD_GROUP_OPTIONS = bloodGroupOptions;
export const STATUS_OPTIONS = statusOptions;
export const RELATION_OPTIONS = [
	{ value: "Father", label: "Father" },
	{ value: "Mother", label: "Mother" },
	{ value: "Guardian", label: "Guardian" },
	{ value: "Grandparent", label: "Grandparent" },
	{ value: "Sibling", label: "Sibling" },
	{ value: "Spouse", label: "Spouse" },
	{ value: "Other", label: "Other" }
];

export const STATUS_BADGE_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
	ACTIVE: "success",
	INACTIVE: "destructive",
	PENDING: "warning",
	SUSPENDED: "destructive"
};
