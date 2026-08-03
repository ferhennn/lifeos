import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const epics = pgTable("epics", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Epic = typeof epics.$inferSelect;
export type NewEpic = typeof epics.$inferInsert;
