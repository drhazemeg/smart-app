// features/encounters/constants/encounter-options.ts
export const encounterStatusOptions = [
	{ value: "PENDING", label: "PENDING" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
	{ value: "NO_SHOW", label: "No Show" }
];

export const encounterTypeOptions = [
	{ value: "CHECKUP", label: "Checkup" },
	{ value: "FOLLOW_UP", label: "Follow-up" },
	{ value: "EMERGENCY", label: "Emergency" },
	{ value: "CONSULTATION", label: "Consultation" },
	{ value: "VACCINATION", label: "Vaccination" },
	{ value: "LAB_TEST", label: "Lab Test" },
	{ value: "PROCEDURE", label: "Procedure" }
];

export const encounterStatusBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	PENDING: "secondary",
	IN_PROGRESS: "default",
	COMPLETED: "secondary",
	CANCELLED: "destructive",
	NO_SHOW: "outline"
};

export const encounterStatusColors: Record<string, string> = {
	PENDING: "#6b7280",
	IN_PROGRESS: "#f59e0b",
	COMPLETED: "#22c55e",
	CANCELLED: "#ef4444",
	NO_SHOW: "#6b7280"
};

export const encounterTypeColors: Record<string, string> = {
	CHECKUP: "#3b82f6",
	FOLLOW_UP: "#8b5cf6",
	EMERGENCY: "#ef4444",
	CONSULTATION: "#06b6d4",
	VACCINATION: "#22c55e",
	LAB_TEST: "#f59e0b",
	PROCEDURE: "#ec4899"
};

export const encounterFilterOptions = [
	{
		id: "status",
		title: "Status",
		options: encounterStatusOptions
	},
	{
		id: "type",
		title: "Type",
		options: encounterTypeOptions
	}
];

export const diagnosisStatusOptions = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "RESOLVED", label: "Resolved" },
	{ value: "CHRONIC", label: "Chronic" }
];

export const frequencyOptions = [
	{ value: "ONCE_DAILY", label: "Once Daily" },
	{ value: "TWICE_DAILY", label: "Twice Daily" },
	{ value: "THREE_TIMES_DAILY", label: "Three Times Daily" },
	{ value: "FOUR_TIMES_DAILY", label: "Four Times Daily" },
	{ value: "EVERY_OTHER_DAY", label: "Every Other Day" },
	{ value: "WEEKLY", label: "Weekly" },
	{ value: "MONTHLY", label: "Monthly" },
	{ value: "AS_NEEDED", label: "As Needed" }
];
