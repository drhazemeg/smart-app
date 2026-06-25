export const STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending" },
	{ value: "CONFIRMED", label: "Confirmed" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
	{ value: "NO_SHOW", label: "No Show" }
];

export const TYPE_OPTIONS = [
	{ value: "CHECKUP", label: "Checkup" },
	{ value: "FOLLOW_UP", label: "Follow-up" },
	{ value: "EMERGENCY", label: "Emergency" },
	{ value: "CONSULTATION", label: "Consultation" },
	{ value: "VACCINATION", label: "Vaccination" },
	{ value: "LAB_TEST", label: "Lab Test" }
];

export const STATUS_BADGE_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
	PENDING: "warning",
	CONFIRMED: "success",
	COMPLETED: "default",
	CANCELLED: "destructive",
	NO_SHOW: "outline"
};
