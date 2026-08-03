import { pgTable, uuid, text, date, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { linkedinPostStatusEnum } from "./enums";
import { profiles } from "./profiles";
import { goals } from "./goals";
import { linkedinStrategies } from "./linkedin-strategies";

export type CarouselSlide = {
  order: number;
  title: string;
  body: string;
};

export const linkedinPosts = pgTable("linkedin_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),

  status: linkedinPostStatusEnum("status").default("idea").notNull(),
  dayNumber: integer("day_number"),

  topic: text("topic"),
  hook: text("hook"),
  caption: text("caption").notNull().default(""),
  cta: text("cta"),
  hashtags: text("hashtags").array().default([]).notNull(),
  carouselSlides: jsonb("carousel_slides").$type<CarouselSlide[]>().default([]),
  imagePrompt: text("image_prompt"),
  notes: text("notes"),
  estimatedReadingTime: integer("estimated_reading_time"),
  targetAudience: text("target_audience"),

  scheduledDate: date("scheduled_date"),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  isFavorite: boolean("is_favorite").default(false).notNull(),

  // Manually entered until the screenshot-OCR importer lands (phase 2) — same columns it will fill.
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  impressions: integer("impressions"),
  views: integer("views"),
  followersGained: integer("followers_gained"),

  strategyId: uuid("strategy_id").references(() => linkedinStrategies.id, { onDelete: "set null" }),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LinkedinPost = typeof linkedinPosts.$inferSelect;
export type NewLinkedinPost = typeof linkedinPosts.$inferInsert;
