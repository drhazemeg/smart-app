// Appointment status options
export const statusOptions = [
	{ value: "PENDING", label: "Pending" },
	{ value: "CONFIRMED", label: "Confirmed" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
	{ value: "NO_SHOW", label: "No Show" }
];

// Appointment type options
export const typeOptions = [
	{ value: "CHECKUP", label: "Checkup" },
	{ value: "FOLLOW_UP", label: "Follow-up" },
	{ value: "EMERGENCY", label: "Emergency" },
	{ value: "CONSULTATION", label: "Consultation" },
	{ value: "VACCINATION", label: "Vaccination" },
	{ value: "LAB_TEST", label: "Lab Test" }
];

// Status badge variants for UI
export const statusBadgeVariants: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
	PENDING: "warning",
	CONFIRMED: "success",
	COMPLETED: "default",
	CANCELLED: "destructive",
	NO_SHOW: "outline"
};

// Status colors for UI
export const statusColors: Record<string, string> = {
	PENDING: "#f59e0b", // amber
	CONFIRMED: "#22c55e", // green
	COMPLETED: "#3b82f6", // blue
	CANCELLED: "#ef4444", // red
	NO_SHOW: "#6b7280" // gray
};

// Appointment filter options for DataTable toolbar
export const appointmentFilterOptions = [
	{
		id: "status",
		title: "Status",
		options: statusOptions
	},
	{
		id: "type",
		title: "Type",
		options: typeOptions
	}
];

// Export as default for backward compatibility
export default {
	statusOptions,
	typeOptions,
	statusBadgeVariants,
	statusColors,
	appointmentFilterOptions
};
