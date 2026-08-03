import { z } from "zod";

export const linkedinProfileSnapshotSchema = z.object({
  followers: z.number().int().min(0).optional().nullable(),
  profileViews: z.number().int().min(0).optional().nullable(),
  connections: z.number().int().min(0).optional().nullable(),
});

export type LinkedinProfileSnapshotValues = z.infer<typeof linkedinProfileSnapshotSchema>;
