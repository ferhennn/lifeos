import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { agencyProjects } from "./agency-projects";

export const agencyEpics = pgTable("agency_epics", {
  id: uuid("id").defaultRandom().primaryKey(),
  agencyProjectId: uuid("agency_project_id").notNull().references(() => agencyProjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyEpic = typeof agencyEpics.$inferSelect;
export type NewAgencyEpic = typeof agencyEpics.$inferInsert;
