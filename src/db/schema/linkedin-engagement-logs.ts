import { pgTable, uuid, date, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const linkedinEngagementLogs = pgTable(
  "linkedin_engagement_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    repliedToComments: boolean("replied_to_comments").default(false).notNull(),
    commentedOnPosts: boolean("commented_on_posts").default(false).notNull(),
    connectedWithPeople: boolean("connected_with_people").default(false).notNull(),
    repliedToDms: boolean("replied_to_dms").default(false).notNull(),
    acceptedRequests: boolean("accepted_requests").default(false).notNull(),
    visitedProfiles: boolean("visited_profiles").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.date)],
);

export type LinkedinEngagementLog = typeof linkedinEngagementLogs.$inferSelect;
export type NewLinkedinEngagementLog = typeof linkedinEngagementLogs.$inferInsert;
