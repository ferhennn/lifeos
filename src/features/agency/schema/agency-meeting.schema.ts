import { z } from "zod";

export const agencyMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  meetingDate: z.string().min(1, "Date is required"),
  durationMinutes: z.number().int().min(0).nullable().optional(),
  participants: z.string().optional().or(z.literal("")), // comma-separated in the form
  agenda: z.string().max(5000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  decisions: z.string().max(5000).optional().or(z.literal("")),
  recordingUrl: z.string().max(500).optional().or(z.literal("")),
  agencyProjectId: z.string().optional().or(z.literal("")),
});

export type AgencyMeetingValues = z.infer<typeof agencyMeetingSchema>;

export function participantsToArray(participants: string | undefined): string[] {
  if (!participants) return [];
  return participants
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function participantsToString(participants: string[] | null | undefined): string {
  return (participants ?? []).join(", ");
}
