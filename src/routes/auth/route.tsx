import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { PageSkeleton } from "@/components/common/PageSkeleton";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const user = await getUser();

		// Check if user exists
		if (!user.user.id) {
			throw redirect({
				to: "/auth/$path",
				params: { path: "login" },
				search: {
					redirect: "/auth/dashboard"
				}
			});
		}

		// Optional: Role-based access control
		// If you need to check the current path for role-based access,
		// you can use the context's location if available
		// For now, we'll keep it simple

		return { user };
	},
	loader: ({ context }) => {
		// User is guaranteed to exist from beforeLoad
		const { user } = context;

		return {
			user
		};
	},
	pendingComponent: () => (
		<div className='flex h-screen items-center justify-center'>
			<PageSkeleton />
		</div>
	)
});

function AuthLayout() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<Outlet />
		</Suspense>
	);
}
