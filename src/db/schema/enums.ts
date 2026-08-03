import { pgEnum } from "drizzle-orm/pg-core";

export const goalPriorityEnum = pgEnum("goal_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "paused",
  "archived",
]);

export const strategyStatusEnum = pgEnum("strategy_status", [
  "active",
  "paused",
]);

export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "none",
  "daily",
  "weekly",
  "monthly",
  "custom",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskSourceEnum = pgEnum("task_source", [
  "manual",
  "strategy_generated",
]);

export const linkedinPostStatusEnum = pgEnum("linkedin_post_status", [
  "idea",
  "research",
  "draft",
  "review",
  "ready",
  "scheduled",
  "published",
]);

export const linkedinIdeaStatusEnum = pgEnum("linkedin_idea_status", [
  "inbox",
  "expanded",
  "converted",
  "archived",
]);

export const linkedinGoalMetricEnum = pgEnum("linkedin_goal_metric", [
  "posts_published",
  "followers",
  "connections",
  "inbound_leads",
  "profile_views",
  "comments",
  "impressions",
  "freelance_leads",
]);
