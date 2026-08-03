import { z } from "zod";

export const linkedinIdeaPriorities = ["low", "medium", "high", "critical"] as const;
export const linkedinIdeaStatuses = ["inbox", "expanded", "converted", "archived"] as const;

export const linkedinIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  referenceLinks: z.array(z.string()),
  priority: z.enum(linkedinIdeaPriorities),
  status: z.enum(linkedinIdeaStatuses),
});

export type LinkedinIdeaValues = z.infer<typeof linkedinIdeaSchema>;
