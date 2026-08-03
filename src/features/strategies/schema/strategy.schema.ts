import { z } from "zod";

export const strategyPriorities = ["low", "medium", "high", "critical"] as const;
export const strategyStatuses = ["active", "paused"] as const;
export const recurrenceTypes = ["none", "daily", "weekly", "monthly", "custom"] as const;
export const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export const strategySchema = z
  .object({
    goalId: z.string().min(1, "Select a goal"),
    title: z.string().min(2, "Title is required").max(120),
    description: z.string().max(2000).optional().or(z.literal("")),
    expectedOutcome: z.string().max(500).optional().or(z.literal("")),
    successMetrics: z.string().max(500).optional().or(z.literal("")),
    estimatedEffort: z.string().max(120).optional().or(z.literal("")),
    priority: z.enum(strategyPriorities),
    status: z.enum(strategyStatuses),
    recurrenceType: z.enum(recurrenceTypes),
    weeklyDays: z.array(z.number().min(0).max(6)),
    monthlyDay: z.number().min(1).max(31).nullable().optional(),
    customDates: z.array(z.string()),
    taskTitle: z.string().max(120).optional().or(z.literal("")),
    taskPriority: z.enum(taskPriorities),
    taskEstimatedTime: z.number().min(0).nullable().optional(),
  })
  .refine((data) => data.recurrenceType !== "weekly" || data.weeklyDays.length > 0, {
    message: "Pick at least one day",
    path: ["weeklyDays"],
  })
  .refine((data) => data.recurrenceType !== "monthly" || !!data.monthlyDay, {
    message: "Pick a day of the month",
    path: ["monthlyDay"],
  })
  .refine((data) => data.recurrenceType !== "custom" || data.customDates.length > 0, {
    message: "Add at least one date",
    path: ["customDates"],
  });

export type StrategyValues = z.infer<typeof strategySchema>;
