// products/services/constants/service-options.ts
export const categoryOptions = [
	{ value: "CONSULTATION", label: "Consultation" },
	{ value: "LAB_TEST", label: "Lab Test" },
	{ value: "VACCINATION", label: "Vaccination" },
	{ value: "PROCEDURE", label: "Procedure" },
	{ value: "PHARMACY", label: "Pharmacy" },
	{ value: "DIAGNOSIS", label: "Diagnosis" },
	{ value: "THERAPY", label: "Therapy" },
	{ value: "OTHER", label: "Other" }
];

export const categoryColors: Record<string, string> = {
	CONSULTATION: "#3b82f6",
	LAB_TEST: "#8b5cf6",
	VACCINATION: "#22c55e",
	PROCEDURE: "#ef4444",
	PHARMACY: "#f59e0b",
	DIAGNOSIS: "#06b6d4",
	THERAPY: "#ec4899",
	OTHER: "#6b7280"
};

export const categoryIcons: Record<string, string> = {
	CONSULTATION: "👨‍⚕️",
	LAB_TEST: "🧪",
	VACCINATION: "💉",
	PROCEDURE: "🩺",
	PHARMACY: "💊",
	DIAGNOSIS: "📋",
	THERAPY: "🧠",
	OTHER: "📌"
};

export const statusOptions = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "INACTIVE", label: "Inactive" },
	{ value: "ARCHIVED", label: "Archived" }
];

export const serviceFilterOptions = [
	{ id: "category", title: "Category", options: categoryOptions },
	{
		id: "isAvailable",
		title: "Availability",
		options: [
			{ value: "true", label: "Available" },
			{ value: "false", label: "Unavailable" }
		]
	}
];

export const STATUS_BADGE_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
	ACTIVE: "success",
	INACTIVE: "destructive",
	ARCHIVED: "outline"
};
