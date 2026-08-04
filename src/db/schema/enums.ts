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

export const agencyTaskStatusEnum = pgEnum("agency_task_status", [
  "inbox",
  "todo",
  "today",
  "in_progress",
  "blocked",
  "waiting_review",
  "waiting_client",
  "completed",
  "archived",
]);

export const agencyTaskPriorityEnum = pgEnum("agency_task_priority", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const agencyTaskTypeEnum = pgEnum("agency_task_type", [
  "feature",
  "bug",
  "research",
  "meeting",
  "documentation",
  "testing",
  "deployment",
]);

export const agencyTaskSourceEnum = pgEnum("agency_task_source", [
  "manual",
  "inbox",
  "meeting_action_item",
]);

export const agencyInboxSourceEnum = pgEnum("agency_inbox_source", [
  "slack",
  "manager_request",
  "voice_note",
  "screenshot",
  "meeting_action_item",
  "idea",
  "bug",
  "other",
]);

export const agencyProjectHealthEnum = pgEnum("agency_project_health", [
  "on_track",
  "at_risk",
  "off_track",
]);

export const agencyTimeLogSourceEnum = pgEnum("agency_time_log_source", [
  "timer",
  "manual",
]);

export const agencyReportTypeEnum = pgEnum("agency_report_type", [
  "daily",
  "weekly",
  "monthly",
]);

export const agencyKnowledgeTypeEnum = pgEnum("agency_knowledge_type", [
  "note",
  "snippet",
  "command",
  "link",
  "checklist",
]);

export const agencyFileEntityEnum = pgEnum("agency_file_entity", [
  "task",
  "meeting",
  "project",
  "note",
  "knowledge",
]);
