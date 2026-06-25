import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/features/auth";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});
	if (!session?.user?.clinic?.id) {
		throw new Error("Unauthorized: Clinic not found");
	}
	return next({
		context: {
			session,
			// 👇 Flatten it here so it's always available and typed
			clinicId: session.user.clinic.id
		}
	});
});

export const getUser = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.session;
	});

// export const getUser = createServerFn({ method: "GET" })
// 	.middleware([authMiddleware])
// 	.handler(async ({ context }) => UserSchema.parse(context.session?.user));

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	return session;
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (!session) {
		throw new Error("Unauthorized");
	}

	return session;
});
