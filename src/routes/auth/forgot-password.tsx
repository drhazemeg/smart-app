import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordViewPage from "@/features/auth/components/forgot-password-view";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordViewPage
});
