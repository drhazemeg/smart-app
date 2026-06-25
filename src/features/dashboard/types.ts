export type AlertSeverity = "critical" | "warning" | "info" | "success";

export type AlertType = "weight" | "height" | "bmi" | "head_circumference" | "milestone" | "vaccination";

export interface GrowthAlert {
	id: string;
	type: AlertType;
	severity: AlertSeverity;
	patient: {
		id: string;
		name: string;
		initials: string;
		age: string;
		gender?: "boy" | "girl" | "other";
	};
	metric: string;
	value: string;
	message: string;
	recommendation?: string;
	date: Date;
	isResolved?: boolean;
	resolvedAt?: Date;
	resolvedBy?: string;
	resolutionNote?: string;
}
