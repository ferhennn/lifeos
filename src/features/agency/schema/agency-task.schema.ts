import { z } from "zod";

export const agencyTaskStatuses = [
  "inbox",
  "todo",
  "today",
  "in_progress",
  "blocked",
  "waiting_review",
  "waiting_client",
  "completed",
  "archived",
] as const;

export const agencyTaskPriorities = ["critical", "high", "medium", "low"] as const;

export const agencyTaskTypes = [
  "feature",
  "bug",
  "research",
  "meeting",
  "documentation",
  "testing",
  "deployment",
] as const;

export const agencyTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(agencyTaskStatuses),
  priority: z.enum(agencyTaskPriorities),
  taskType: z.enum(agencyTaskTypes),

  dueDate: z.string().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  completedDate: z.string().optional().or(z.literal("")),
  estimatedTime: z.number().min(0).nullable().optional(),
  actualTime: z.number().min(0).nullable().optional(),

  labels: z.array(z.string()),

  clientName: z.string().max(200).optional().or(z.literal("")),
  manager: z.string().max(200).optional().or(z.literal("")),
  assignee: z.string().max(200).optional().or(z.literal("")),

  githubUrl: z.string().max(500).optional().or(z.literal("")),
  prUrl: z.string().max(500).optional().or(z.literal("")),
  slackThreadUrl: z.string().max(500).optional().or(z.literal("")),
  figmaUrl: z.string().max(500).optional().or(z.literal("")),
  vercelPreviewUrl: z.string().max(500).optional().or(z.literal("")),
  productionUrl: z.string().max(500).optional().or(z.literal("")),

  goalId: z.string().optional().or(z.literal("")),
  agencyProjectId: z.string().optional().or(z.literal("")),
  agencyEpicId: z.string().optional().or(z.literal("")),

  dependsOn: z.array(z.string()),
});

export type AgencyTaskValues = z.infer<typeof agencyTaskSchema>;

export const quickAgencyTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export type QuickAgencyTaskValues = z.infer<typeof quickAgencyTaskSchema>;
