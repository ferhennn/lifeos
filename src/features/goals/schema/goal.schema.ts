import { z } from "zod";

export const goalPriorities = ["low", "medium", "high", "critical"] as const;
export const goalStatuses = ["active", "completed", "paused", "archived"] as const;

export const goalCoverColors = [
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#64748b", // slate
] as const;

export const goalSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  targetDate: z.string().optional().or(z.literal("")),
  priority: z.enum(goalPriorities),
  status: z.enum(goalStatuses),
  coverColor: z.string(),
});

export type GoalValues = z.infer<typeof goalSchema>;
