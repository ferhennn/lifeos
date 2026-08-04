import { pgTable, uuid, text, date, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { agencyProjects } from "./agency-projects";

export type AgencyMeetingActionItem = {
  id: string;
  text: string;
  done: boolean;
  taskId: string | null;
};

export const agencyMeetings = pgTable("agency_meetings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  meetingDate: date("meeting_date").notNull(),
  durationMinutes: integer("duration_minutes"),
  participants: text("participants").array().default([]).notNull(),
  agenda: text("agenda"),
  notes: text("notes"),
  decisions: text("decisions"),
  actionItems: jsonb("action_items").$type<AgencyMeetingActionItem[]>().default([]),
  recordingUrl: text("recording_url"),
  agencyProjectId: uuid("agency_project_id").references(() => agencyProjects.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyMeeting = typeof agencyMeetings.$inferSelect;
export type NewAgencyMeeting = typeof agencyMeetings.$inferInsert;
