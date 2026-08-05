import { z } from "zod";

export const agencyManualTimeLogSchema = z
  .object({
    taskId: z.string().min(1, "Pick a task"),
    startedAt: z.string().min(1, "Start time is required"),
    endedAt: z.string().min(1, "End time is required"),
    note: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.endedAt) > new Date(data.startedAt), {
    message: "End time must be after start time",
    path: ["endedAt"],
  });

export type AgencyManualTimeLogValues = z.infer<typeof agencyManualTimeLogSchema>;
