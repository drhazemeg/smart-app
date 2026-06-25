import path from "node:path";
import { cwd } from "node:process";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator"; // Updated import
import { Pool } from "pg";
import { env } from "@/env";

import { relations } from "./relations";

if (!env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}
const globalForDb = globalThis as unknown as {
	pool: Pool | undefined;
};

// Simple Logger Helper
const logger = {
	info: (msg: string, ...args: unknown[]) => console.log(`[DB-INFO] ${msg}`, ...args),
	warn: (msg: string, ...args: unknown[]) => console.warn(`[DB-WARN] ${msg}`, ...args),
	error: (msg: string, ...args: unknown[]) => console.error(`[DB-ERROR] ${msg}`, ...args),
	debug: (msg: string, ...args: unknown[]) =>
		env.NODE_ENV !== "production" && console.debug(`[DB-DEBUG] ${msg}`, ...args)
};

// Use pg Pool instead of postgres.js
const pool =
	globalForDb.pool ??
	new Pool({
		connectionString: env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 20_000,
		connectionTimeoutMillis: 10_000
	});

if (env.NODE_ENV !== "production") {
	globalForDb.pool = pool;
}

export const db = drizzle({
	client: pool,
	// Note: relations are passed via the schema object in the new Drizzle API
	relations,
	logger: env.NODE_ENV === "development"
});

export function createDb() {
	return drizzle({
		client: new Pool({ connectionString: env.DATABASE_URL }),
		relations
	});
}

// export const db = drizzle(pool, { schema });

export async function checkIsDbReady(): Promise<boolean> {
	try {
		await db.execute(sql`SELECT 1`);
		logger.debug("Database connection check successful");
		return true;
	} catch (error) {
		logger.error("Database connection check failed", error);
		return false;
	}
}

let migrationFnCalled = false;

export async function runMigrations(): Promise<void> {
	const fnName = "runMigrations";

	if (migrationFnCalled) {
		logger.debug(`[${fnName}] Skipping migration (already called)`);
		return;
	}

	migrationFnCalled = true;

	// Note: Usually you WANT to run migrations in production.
	// If you strictly want to skip them, keep this, but ensure your CI/CD handles it.
	if (env.NODE_ENV === "production") {
		logger.info(`[${fnName}] Applying migrations for production...`);
	} else {
		logger.info(`[${fnName}] Running in ${env.NODE_ENV}, applying migrations...`);
	}

	const migrationsFolder = path.join(cwd(), "packages/db/src/migrations");

	try {
		logger.info(`[${fnName}] Starting migration ..`);
		await migrate(db, { migrationsFolder });
		logger.info(`[${fnName}] ✅ Database migration completed successfully`);
	} catch (error) {
		logger.error(`[${fnName}] ❌ Database migration failed`, error);
		throw error;
	}
}

export type DB = typeof db;
export type DBType = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DBorTx = DB | DBType;
