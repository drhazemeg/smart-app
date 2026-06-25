import { type AnyPgColumn, boolean, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { generateId } from "@/utils/id";
import { clinic } from "./clinic";
import { roleEnum } from "./enum";

export const user = pgTable(
	"user",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("email_verified").default(false).notNull(),
		image: text("image"),
		role: roleEnum("role").default("staff"),
		clinicId: text("clinic_id").references(() => clinic.id, {
			onDelete: "cascade"
		}),
		address: text("address"),
		phone: text("phone"),
		banned: boolean("banned").default(false),
		banReason: text("ban_reason"),
		banExpires: timestamp("ban_expires", { withTimezone: true }),
		twoFactorEnabled: boolean("two_factor_enabled").default(false),
		apiKey: text("api_key"),
		invitedBy: text("invited_by").references((): AnyPgColumn => user.id, {
			onDelete: "set null"
		}),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("user_email_idx").on(table.email),
		index("user_clinic_idx").on(table.clinicId),
		index("user_role_idx").on(table.role)
	]
);

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		token: text("token").notNull().unique(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		impersonatedBy: text("impersonated_by"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("session_user_idx").on(table.userId),
		index("session_token_idx").on(table.token),
		index("session_expires_idx").on(table.expiresAt)
	]
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		providerId: text("provider_id").notNull(),
		accountId: text("account_id").notNull(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("account_user_idx").on(table.userId),
		uniqueIndex("account_provider_account_idx").on(table.providerId, table.accountId)
	]
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("verification_identifier_idx").on(table.identifier)]
);

export const twoFactor = pgTable(
	"two_factor",
	{
		id: text("id").primaryKey().$defaultFn(generateId),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" })
			.unique(),
		secret: text("secret").notNull(),
		backupCodes: text("backup_codes").notNull(),
		verified: boolean("verified").default(true).notNull()
	},
	table => [index("two_factor_user_idx").on(table.userId)]
);
