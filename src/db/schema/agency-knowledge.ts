import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { agencyKnowledgeTypeEnum } from "./enums";
import { profiles } from "./profiles";

export const agencyKnowledge = pgTable("agency_knowledge", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  contentType: agencyKnowledgeTypeEnum("content_type").default("note").notNull(),
  content: text("content").default("").notNull(),
  language: text("language"),
  url: text("url"),
  tags: text("tags").array().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyKnowledge = typeof agencyKnowledge.$inferSelect;
export type NewAgencyKnowledge = typeof agencyKnowledge.$inferInsert;
