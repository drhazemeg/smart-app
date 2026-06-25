// lib/auth.ts

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { admin, customSession, openAPI, twoFactor } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { generateId } from "@/utils/id";
import { ac, roles } from "./utils/roles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const customSessionPlugin = customSession(async (session) => {
// 	// session = { user: {...}, session: {...} }
// 	return {
// 		user: {
// 			...session.user,
// 			role: session.user.role, // or however you get the role
// 			clinic: await getUserClinic(session.user.id), // your custom logic
// 		},
// 		session: session.session, // ⚠️ IMPORTANT: Include the session object!
// 	};
// });
export function createAuth() {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema: schema
		}),
		trustedOrigins: [env.CORS_ORIGIN],

		appName: "Clinic",
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			minPasswordLength: 8,
			maxPasswordLength: 128
		},
		user: {
			additionalFields: {
				role: {
					type: ["doctor", "staff", "patient", "admin"],
					required: false,
					input: true
				},
				apiKey: { type: "string", required: false, input: false },
				clinicId: { type: "string", required: false, input: true },
				address: { type: "string", required: false, input: true },
				phone: { type: "string", required: false, input: true }
			},
			deleteUser: {
				enabled: true,
				beforeDelete: async user => {
					const result = await db
						.select({ role: schema.user.role })
						.from(schema.user)
						.where(eq(schema.user.id, user.id))
						.limit(1);
					const fullUser = result[0];

					if (fullUser?.role?.toLowerCase() === "admin") {
						throw new APIError("BAD_REQUEST", {
							message: "Admin accounts can't be deleted"
						});
					}
				}
			},
			changeEmail: {
				enabled: true
			}
		},
		experimental: { joins: true },
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
			storeSessionInDatabase: true,
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60
			}
		},
		account: {
			encryptOAuthTokens: true,
			accountLinking: {
				enabled: true
			}
		},
		advanced: {
			database: {
				generateId: () => generateId(),
				defaultFindManyLimit: 100
			},
			useSecureCookies: false,
			cookiePrefix: "auth",
			crossSubDomainCookies: {
				enabled: true,
				domain: "localhost"
			}
		},
		logger: {
			level: process.env.NODE_ENV === "production" ? "error" : "info",
			disabled: false
		},
		databaseHooks: {
			user: {
				create: {
					before: async user => {
						const email = user.email?.trim().toLowerCase();
						if (!(email && EMAIL_REGEX.test(email))) {
							throw new APIError("BAD_REQUEST", {
								message: "Invalid email format"
							});
						}
						return {
							data: {
								...user,
								email,
								name: user.name?.trim() || "Unnamed User",
								role: (user.role as string)?.toUpperCase() || "PATIENT",
								isAdmin: (user.role as string)?.toUpperCase() === "ADMIN"
							}
						};
					}
				}
			}
		},

		plugins: [
			admin({
				ac,
				roles,
				adminRoles: ["admin"] // only "ADMIN" gets full admin access
			}),
			openAPI({
				theme: "deepSpace"
			}),
			twoFactor(),
			customSession(async ({ user, session }) => {
				const result = await db
					.select({ role: schema.user.role, clinicId: schema.user.clinicId })
					.from(schema.user)
					.where(eq(schema.user.id, user.id))
					.limit(1);
				const dbUser = result[0];

				return {
					user: {
						...user,
						role: dbUser?.role ?? "patient",
						clinic: dbUser?.clinicId
							? {
									id: dbUser.clinicId,
									userRoleInClinic: dbUser.role
								}
							: undefined
					},
					session
				};
			}),
			tanstackStartCookies()
		]
	});
}

export const auth = createAuth();

export type AuthSession = typeof auth.$Infer.Session;
export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
export type Role = AuthUser["role"];
export type Auth = typeof auth;
