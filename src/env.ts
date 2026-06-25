import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		// Auth
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),

		// OAuth
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),

		// Database
		DATABASE_URL: z.string().min(1),

		// App
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.string().default("3000").transform(Number),
		CORS_ORIGIN: z.url().default("http://localhost:3000")
	},

	clientPrefix: "VITE_",
	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
		VITE_API_URL: z.url().default("http://localhost:3000")
	},

	runtimeEnv: {
		// Server vars — read from process.env on the server
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		PORT: process.env.PORT,
		CORS_ORIGIN: process.env.CORS_ORIGIN,
		// Client vars — read from import.meta.env in the browser
		VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
		VITE_API_URL: import.meta.env.VITE_API_URL
	},
	emptyStringAsUndefined: true
});
