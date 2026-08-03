import { z } from "zod";

export const taskStatuses = ["backlog", "todo", "in_progress", "in_review", "done", "cancelled"] as const;
export const taskPriorities = ["low", "medium", "high", "urgent"] as const;
export const taskRepeatTypes = ["none", "daily", "weekly", "monthly"] as const;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  dueDate: z.string().optional().or(z.literal("")),
  estimatedTime: z.number().min(0).nullable().optional(),
  actualTime: z.number().min(0).nullable().optional(),
  labels: z.array(z.string()),
  goalId: z.string().optional().or(z.literal("")),
  strategyId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  epicId: z.string().optional().or(z.literal("")),
  repeatType: z.enum(taskRepeatTypes),
  reminderAt: z.string().optional().or(z.literal("")),
  dependsOn: z.array(z.string()),
});

export type TaskValues = z.infer<typeof taskSchema>;

export const quickTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export type QuickTaskValues = z.infer<typeof quickTaskSchema>;
