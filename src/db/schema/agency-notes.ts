import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { agencyProjects } from "./agency-projects";
import { agencyTasks } from "./agency-tasks";
import { agencyMeetings } from "./agency-meetings";

export const agencyNotes = pgTable("agency_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  contentMarkdown: text("content_markdown").default("").notNull(),
  agencyProjectId: uuid("agency_project_id").references(() => agencyProjects.id, { onDelete: "set null" }),
  agencyTaskId: uuid("agency_task_id").references(() => agencyTasks.id, { onDelete: "set null" }),
  meetingId: uuid("meeting_id").references(() => agencyMeetings.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyNote = typeof agencyNotes.$inferSelect;
export type NewAgencyNote = typeof agencyNotes.$inferInsert;
