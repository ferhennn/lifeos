import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { linkedinPosts } from "./linkedin-posts";

export const linkedinPostRevisions = pgTable("linkedin_post_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull().references(() => linkedinPosts.id, { onDelete: "cascade" }),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  editedAt: timestamp("edited_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinPostRevision = typeof linkedinPostRevisions.$inferSelect;
export type NewLinkedinPostRevision = typeof linkedinPostRevisions.$inferInsert;
