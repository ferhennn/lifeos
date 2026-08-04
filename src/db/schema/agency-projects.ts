import { pgTable, uuid, text, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { projectStatusEnum, agencyProjectHealthEnum } from "./enums";
import { profiles } from "./profiles";

export type AgencyProjectLink = { label: string; url: string };

export const agencyProjects = pgTable("agency_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  client: text("client"),
  status: projectStatusEnum("status").default("planning").notNull(),
  health: agencyProjectHealthEnum("health").default("on_track").notNull(),
  deadline: date("deadline"),
  githubRepo: text("github_repo"),
  techStack: text("tech_stack").array().default([]).notNull(),
  links: jsonb("links").$type<AgencyProjectLink[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyProject = typeof agencyProjects.$inferSelect;
export type NewAgencyProject = typeof agencyProjects.$inferInsert;
