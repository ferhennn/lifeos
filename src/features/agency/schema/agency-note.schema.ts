import { z } from "zod";

export const agencyNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  contentMarkdown: z.string().max(20000).optional().or(z.literal("")),
  agencyProjectId: z.string().optional().or(z.literal("")),
  agencyTaskId: z.string().optional().or(z.literal("")),
  meetingId: z.string().optional().or(z.literal("")),
});

export type AgencyNoteValues = z.infer<typeof agencyNoteSchema>;
