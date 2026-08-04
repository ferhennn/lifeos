import { pgTable, uuid, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { agencyTasks } from "./agency-tasks";

export const agencyFocusSessions = pgTable("agency_focus_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => agencyTasks.id, { onDelete: "set null" }),
  plannedMinutes: integer("planned_minutes").notNull(),
  actualMinutes: integer("actual_minutes"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  completed: boolean("completed").default(false).notNull(),
  pomodoroCount: integer("pomodoro_count").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyFocusSession = typeof agencyFocusSessions.$inferSelect;
export type NewAgencyFocusSession = typeof agencyFocusSessions.$inferInsert;
