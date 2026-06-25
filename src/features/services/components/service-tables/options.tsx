// products/services/components/service-tables/options.tsx
import { categoryOptions, statusOptions } from "../../constants/service-options";

export const CATEGORY_OPTIONS = categoryOptions;
export const STATUS_OPTIONS = statusOptions;

export const STATUS_BADGE_VARIANTS: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
	ACTIVE: "success",
	INACTIVE: "destructive",
	ARCHIVED: "outline"
};

export const CATEGORY_COLORS: Record<string, string> = {
	CONSULTATION: "#3b82f6",
	LAB_TEST: "#8b5cf6",
	VACCINATION: "#22c55e",
	PROCEDURE: "#ef4444",
	PHARMACY: "#f59e0b",
	DIAGNOSIS: "#06b6d4",
	THERAPY: "#ec4899",
	OTHER: "#6b7280"
};

export const CATEGORY_ICONS: Record<string, string> = {
	CONSULTATION: "👨‍⚕️",
	LAB_TEST: "🧪",
	VACCINATION: "💉",
	PROCEDURE: "🩺",
	PHARMACY: "💊",
	DIAGNOSIS: "📋",
	THERAPY: "🧠",
	OTHER: "📌"
};
