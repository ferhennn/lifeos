import { z } from "zod";

export const projectStatuses = ["planning", "active", "on_hold", "completed", "archived"] as const;

export const projectSchema = z.object({
  strategyId: z.string().min(1, "Select a strategy"),
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(projectStatuses),
  deadline: z.string().optional().or(z.literal("")),
  links: z.array(z.object({ label: z.string().min(1), url: z.url("Enter a valid URL") })),
});

export type ProjectValues = z.infer<typeof projectSchema>;

export const epicSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
});

export type EpicValues = z.infer<typeof epicSchema>;
