import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const linkedinPillars = pgTable("linkedin_pillars", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinPillar = typeof linkedinPillars.$inferSelect;
export type NewLinkedinPillar = typeof linkedinPillars.$inferInsert;
