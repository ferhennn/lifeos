import { pgTable, uuid, text, date, timestamp } from "drizzle-orm/pg-core";
import { goalPriorityEnum, goalStatusEnum } from "./enums";
import { profiles } from "./profiles";

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  priority: goalPriorityEnum("priority").default("medium").notNull(),
  status: goalStatusEnum("status").default("active").notNull(),
  coverColor: text("cover_color").default("#6366f1").notNull(),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
