import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { agencyTasks } from "./agency-tasks";

export const agencyTaskComments = pgTable("agency_task_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").notNull().references(() => agencyTasks.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyTaskComment = typeof agencyTaskComments.$inferSelect;
export type NewAgencyTaskComment = typeof agencyTaskComments.$inferInsert;
