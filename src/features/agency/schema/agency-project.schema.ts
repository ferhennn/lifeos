import { z } from "zod";

export const agencyProjectStatuses = ["planning", "active", "on_hold", "completed", "archived"] as const;
export const agencyProjectHealths = ["on_track", "at_risk", "off_track"] as const;

export const agencyProjectSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  client: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(agencyProjectStatuses),
  health: z.enum(agencyProjectHealths),
  deadline: z.string().optional().or(z.literal("")),
  githubRepo: z.string().max(500).optional().or(z.literal("")),
  techStack: z.array(z.string()),
  links: z.array(z.object({ label: z.string().min(1), url: z.url("Enter a valid URL") })),
});

export type AgencyProjectValues = z.infer<typeof agencyProjectSchema>;

export const agencyEpicSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
});

export type AgencyEpicValues = z.infer<typeof agencyEpicSchema>;
