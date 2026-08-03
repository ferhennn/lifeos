import { pgTable, uuid, text, timestamp, jsonb, date, integer } from "drizzle-orm/pg-core";
import { goalPriorityEnum, strategyStatusEnum, recurrenceTypeEnum } from "./enums";
import { profiles } from "./profiles";
import { goals } from "./goals";

export type RecurrenceConfig =
  | { type: "none" }
  | { type: "daily" }
  | { type: "weekly"; daysOfWeek: number[] } // 0=Sun..6=Sat
  | { type: "monthly"; dayOfMonth: number }
  | { type: "custom"; dates: string[] }; // ISO date strings

export type TaskTemplate = {
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedTime?: number; // minutes
};

export const strategies = pgTable("strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id").notNull().references(() => goals.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  expectedOutcome: text("expected_outcome"),
  successMetrics: text("success_metrics"),
  estimatedEffort: text("estimated_effort"),
  priority: goalPriorityEnum("priority").default("medium").notNull(),
  status: strategyStatusEnum("status").default("active").notNull(),
  recurrenceType: recurrenceTypeEnum("recurrence_type").default("none").notNull(),
  recurrenceConfig: jsonb("recurrence_config").$type<RecurrenceConfig>(),
  taskTemplate: jsonb("task_template").$type<TaskTemplate>(),
  lastGeneratedThrough: date("last_generated_through"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Strategy = typeof strategies.$inferSelect;
export type NewStrategy = typeof strategies.$inferInsert;
