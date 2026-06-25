// products/patients/constants/patient-options.ts
export const genderOptions = [
	{ value: "boy", label: "Boy" },
	{ value: "girl", label: "Girl" },
	{ value: "other", label: "Other" }
];

export const bloodGroupOptions = [
	{ value: "A_POSITIVE", label: "A+" },
	{ value: "A_NEGATIVE", label: "A-" },
	{ value: "B_POSITIVE", label: "B+" },
	{ value: "B_NEGATIVE", label: "B-" },
	{ value: "O_POSITIVE", label: "O+" },
	{ value: "O_NEGATIVE", label: "O-" },
	{ value: "AB_POSITIVE", label: "AB+" },
	{ value: "AB_NEGATIVE", label: "AB-" }
];

export const maritalStatusOptions = [
	{ value: "SINGLE", label: "Single" },
	{ value: "MARRIED", label: "Married" },
	{ value: "DIVORCED", label: "Divorced" },
	{ value: "WIDOWED", label: "Widowed" },
	{ value: "SEPARATED", label: "Separated" }
];

export const nutritionalStatusOptions = [
	{ value: "NORMAL", label: "Normal" },
	{ value: "UNDERWEIGHT", label: "Underweight" },
	{ value: "OVERWEIGHT", label: "Overweight" },
	{ value: "OBESE", label: "Obese" },
	{ value: "MALNOURISHED", label: "Malnourished" }
];

export const statusOptions = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "INACTIVE", label: "Inactive" },
	{ value: "PENDING", label: "Pending" },
	{ value: "SUSPENDED", label: "Suspended" }
];

export const relationOptions = [
	{ value: "Father", label: "Father" },
	{ value: "Mother", label: "Mother" },
	{ value: "Guardian", label: "Guardian" },
	{ value: "Grandparent", label: "Grandparent" },
	{ value: "Sibling", label: "Sibling" },
	{ value: "Spouse", label: "Spouse" },
	{ value: "Other", label: "Other" }
];

export const measurementTypeOptions = [
	{ value: "WEIGHT", label: "Weight" },
	{ value: "HEIGHT", label: "Height" },
	{ value: "BMI", label: "BMI" },
	{ value: "HEAD_CIRCUMFERENCE", label: "Head Circumference" }
];

export const stuntingStatusOptions = [
	{ value: "SEVERE_STUNTING", label: "Severe Stunting" },
	{ value: "MODERATE_STUNTING", label: "Moderate Stunting" },
	{ value: "NORMAL", label: "Normal" },
	{ value: "TALL", label: "Tall" }
];

export const wastingStatusOptions = [
	{ value: "SEVERE_WASTING", label: "Severe Wasting" },
	{ value: "MODERATE_WASTING", label: "Moderate Wasting" },
	{ value: "NORMAL", label: "Normal" },
	{ value: "OVERWEIGHT", label: "Overweight" }
];

export const STATUS_BADGE_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
	ACTIVE: "success",
	INACTIVE: "destructive",
	PENDING: "warning",
	SUSPENDED: "destructive",
	NORMAL: "success",
	UNDERWEIGHT: "warning",
	OVERWEIGHT: "warning",
	OBESE: "destructive",
	MALNOURISHED: "destructive"
};
