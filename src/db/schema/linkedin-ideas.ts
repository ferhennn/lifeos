import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { goalPriorityEnum, linkedinIdeaStatusEnum } from "./enums";
import { profiles } from "./profiles";
import { linkedinPosts } from "./linkedin-posts";

export const linkedinIdeas = pgTable("linkedin_ideas", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  referenceLinks: text("reference_links").array().default([]).notNull(),
  attachmentUrls: text("attachment_urls").array().default([]).notNull(),
  priority: goalPriorityEnum("priority").default("medium").notNull(),
  status: linkedinIdeaStatusEnum("status").default("inbox").notNull(),
  convertedPostId: uuid("converted_post_id").references(() => linkedinPosts.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinIdea = typeof linkedinIdeas.$inferSelect;
export type NewLinkedinIdea = typeof linkedinIdeas.$inferInsert;
