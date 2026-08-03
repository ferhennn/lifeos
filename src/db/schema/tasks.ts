import { pgTable, uuid, text, timestamp, jsonb, date, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { taskStatusEnum, taskPriorityEnum, taskSourceEnum } from "./enums";
import { profiles } from "./profiles";
import { goals } from "./goals";
import { strategies } from "./strategies";
import { projects } from "./projects";
import { epics } from "./epics";
import type { RecurrenceConfig } from "./strategies";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  dueDate: date("due_date"),
  estimatedTime: integer("estimated_time"), // minutes
  actualTime: integer("actual_time"), // minutes
  labels: text("labels").array().default([]).notNull(),
  repeatRule: jsonb("repeat_rule").$type<RecurrenceConfig>(),
  reminderAt: timestamp("reminder_at", { withTimezone: true }),
  customProperties: jsonb("custom_properties").$type<Record<string, string | number | boolean>>().default({}),
  source: taskSourceEnum("source").default("manual").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  // Denormalized traceability chain — every task knows WHY it exists.
  epicId: uuid("epic_id").references(() => epics.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  strategyId: uuid("strategy_id").references(() => strategies.id, { onDelete: "set null" }),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const taskDependencies = pgTable(
  "task_dependencies",
  {
    taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    dependsOnTaskId: uuid("depends_on_task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.dependsOnTaskId] })],
);

export const subtasks = pgTable("subtasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isDone: boolean("is_done").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type NewSubtask = typeof subtasks.$inferInsert;
