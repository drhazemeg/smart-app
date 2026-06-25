import { env } from "@/env";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./relations";

if (!env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

// Global cache for the pool during dev hot-reloads
const globalForDb = globalThis as unknown as { pool: Pool | undefined };

const pool =
	globalForDb.pool ??
	new Pool({
		connectionString: env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 30000
	});

if (env.NODE_ENV !== "production") {
	globalForDb.pool = pool;
}

export const db = drizzle({
	client: pool,
	relations,
	logger: env.NODE_ENV === "development"
});

// Helper for logger to keep it server-only
const logger = {
	info: (msg: string, ...args: unknown[]) => console.log(`[DB-INFO] ${msg}`, ...args),
	error: (msg: string, ...args: unknown[]) => console.error(`[DB-ERROR] ${msg}`, ...args),
	debug: (msg: string, ...args: unknown[]) =>
		env.NODE_ENV !== "production" && console.debug(`[DB-DEBUG] ${msg}`, ...args)
};

export async function checkIsDbReady(): Promise<boolean> {
	try {
		await db.execute(sql`SELECT 1`);
		return true;
	} catch (error) {
		logger.error("Database connection check failed", error);
		return false;
	}
}

let migrationFnCalled = false;

export async function runMigrations(): Promise<void> {
	// Dynamic import of node:path and node:process ONLY when needed
	// This prevents them from being bundled into client code
	const { migrate } = await import("drizzle-orm/node-postgres/migrator");
	const path = await import("node:path");
	const { cwd } = await import("node:process");

	if (migrationFnCalled) return;
	migrationFnCalled = true;

	const migrationsFolder = path.join(cwd(), "packages/db/src/migrations");

	try {
		logger.info("Starting database migration...");
		await migrate(db, { migrationsFolder });
		logger.info("✅ Database migration completed successfully");
	} catch (error) {
		logger.error("❌ Database migration failed", error);
		throw error;
	}
}

export type DB = typeof db;
export type DBType = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DBorTx = DB | DBType;
