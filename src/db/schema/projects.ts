import { pgTable, uuid, text, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { projectStatusEnum } from "./enums";
import { profiles } from "./profiles";
import { strategies } from "./strategies";

export type ProjectLink = { label: string; url: string };

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  strategyId: uuid("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("planning").notNull(),
  deadline: date("deadline"),
  links: jsonb("links").$type<ProjectLink[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
