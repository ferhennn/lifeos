import { pgTable, uuid, text, timestamp, date, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import {
  agencyTaskStatusEnum,
  agencyTaskPriorityEnum,
  agencyTaskTypeEnum,
  agencyTaskSourceEnum,
  agencyInboxSourceEnum,
} from "./enums";
import { profiles } from "./profiles";
import { goals } from "./goals";
import { agencyProjects } from "./agency-projects";
import { agencyEpics } from "./agency-epics";
import { agencyMeetings } from "./agency-meetings";

export const agencyTasks = pgTable("agency_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: agencyTaskStatusEnum("status").default("inbox").notNull(),
  priority: agencyTaskPriorityEnum("priority").default("medium").notNull(),
  taskType: agencyTaskTypeEnum("task_type").default("feature").notNull(),

  dueDate: date("due_date"),
  startDate: date("start_date"),
  completedDate: date("completed_date"),
  estimatedTime: integer("estimated_time"), // minutes
  actualTime: integer("actual_time"), // minutes

  labels: text("labels").array().default([]).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  source: agencyTaskSourceEnum("source").default("manual").notNull(),
  sourceType: agencyInboxSourceEnum("source_type"),
  rawCapture: text("raw_capture"),

  clientName: text("client_name"),
  manager: text("manager"),
  assignee: text("assignee"),

  githubUrl: text("github_url"),
  prUrl: text("pr_url"),
  slackThreadUrl: text("slack_thread_url"),
  figmaUrl: text("figma_url"),
  vercelPreviewUrl: text("vercel_preview_url"),
  productionUrl: text("production_url"),

  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
  agencyProjectId: uuid("agency_project_id").references(() => agencyProjects.id, { onDelete: "set null" }),
  agencyEpicId: uuid("agency_epic_id").references(() => agencyEpics.id, { onDelete: "set null" }),
  meetingId: uuid("meeting_id").references(() => agencyMeetings.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const agencyTaskDependencies = pgTable(
  "agency_task_dependencies",
  {
    taskId: uuid("task_id").notNull().references(() => agencyTasks.id, { onDelete: "cascade" }),
    dependsOnTaskId: uuid("depends_on_task_id").notNull().references(() => agencyTasks.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.dependsOnTaskId] })],
);

export const agencyTaskChecklist = pgTable("agency_task_checklist", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").notNull().references(() => agencyTasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isDone: boolean("is_done").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export type AgencyTask = typeof agencyTasks.$inferSelect;
export type NewAgencyTask = typeof agencyTasks.$inferInsert;
export type AgencyTaskDependency = typeof agencyTaskDependencies.$inferSelect;
export type AgencyTaskChecklistItem = typeof agencyTaskChecklist.$inferSelect;
export type NewAgencyTaskChecklistItem = typeof agencyTaskChecklist.$inferInsert;
