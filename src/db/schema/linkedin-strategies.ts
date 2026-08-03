import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { strategyStatusEnum } from "./enums";
import { profiles } from "./profiles";

export const linkedinStrategies = pgTable("linkedin_strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  goal: text("goal"),
  postingFrequency: text("posting_frequency"),
  targetAudience: text("target_audience"),
  primaryCta: text("primary_cta"),
  successMetric: text("success_metric"),
  status: strategyStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinStrategy = typeof linkedinStrategies.$inferSelect;
export type NewLinkedinStrategy = typeof linkedinStrategies.$inferInsert;
