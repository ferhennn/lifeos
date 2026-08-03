import { z } from "zod";

export const linkedinGoalMetrics = [
  "posts_published",
  "followers",
  "connections",
  "inbound_leads",
  "profile_views",
  "comments",
  "impressions",
  "freelance_leads",
] as const;

export const linkedinGoalStatuses = ["active", "completed", "paused", "archived"] as const;

export const linkedinGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  metric: z.enum(linkedinGoalMetrics),
  targetValue: z.number().int().min(1),
  currentValue: z.number().int().min(0),
  targetDate: z.string().optional().or(z.literal("")),
  status: z.enum(linkedinGoalStatuses),
});

export type LinkedinGoalValues = z.infer<typeof linkedinGoalSchema>;
