import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Mirrors auth.users (id is a foreign key to auth.users.id, enforced via
 * migration SQL trigger, not Drizzle — Drizzle does not manage the auth schema).
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").default("UTC").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
