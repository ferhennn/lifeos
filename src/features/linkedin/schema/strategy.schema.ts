import { z } from "zod";

export const linkedinStrategyStatuses = ["active", "paused"] as const;

export const linkedinStrategySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  goal: z.string().max(500).optional().or(z.literal("")),
  postingFrequency: z.string().max(120).optional().or(z.literal("")),
  targetAudience: z.string().max(300).optional().or(z.literal("")),
  primaryCta: z.string().max(300).optional().or(z.literal("")),
  successMetric: z.string().max(300).optional().or(z.literal("")),
  status: z.enum(linkedinStrategyStatuses),
  pillarIds: z.array(z.string()),
});

export type LinkedinStrategyValues = z.infer<typeof linkedinStrategySchema>;
