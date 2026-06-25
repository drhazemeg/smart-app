// 1. Export the database client and types from your client setup
export * from "./client.server";

// 2. Import everything from your new schema directory
// This provides access to all table definitions for queries/actions
import * as schema from "./schema";

// 4. Optionally re-export specific types if you use them frequently
export * from "./zod";

// 3. Export the schema object for use in Drizzle queries (e.g., db.query.user...)
export { schema };
