import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { agencyTimeLogSourceEnum } from "./enums";
import { profiles } from "./profiles";
import { agencyTasks } from "./agency-tasks";

export const agencyTimeLogs = pgTable("agency_time_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => agencyTasks.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  source: agencyTimeLogSourceEnum("source").default("timer").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyTimeLog = typeof agencyTimeLogs.$inferSelect;
export type NewAgencyTimeLog = typeof agencyTimeLogs.$inferInsert;
