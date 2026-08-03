import { pgTable, uuid, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { goalStatusEnum, linkedinGoalMetricEnum } from "./enums";
import { profiles } from "./profiles";

export const linkedinGoals = pgTable("linkedin_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  metric: linkedinGoalMetricEnum("metric").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0).notNull(),
  targetDate: date("target_date"),
  status: goalStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinGoal = typeof linkedinGoals.$inferSelect;
export type NewLinkedinGoal = typeof linkedinGoals.$inferInsert;
