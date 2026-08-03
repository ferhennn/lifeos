import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const linkedinProfileSnapshots = pgTable("linkedin_profile_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  followers: integer("followers"),
  profileViews: integer("profile_views"),
  connections: integer("connections"),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinProfileSnapshot = typeof linkedinProfileSnapshots.$inferSelect;
export type NewLinkedinProfileSnapshot = typeof linkedinProfileSnapshots.$inferInsert;
