import { z } from "zod";

export const linkedinPillarColors = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#64748b", "#14b8a6", "#f97316",
] as const;

export const linkedinPillarSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  color: z.string(),
});

export type LinkedinPillarValues = z.infer<typeof linkedinPillarSchema>;
