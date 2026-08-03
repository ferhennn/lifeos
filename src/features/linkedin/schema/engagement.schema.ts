import { z } from "zod";
import type { LinkedinEngagementLog } from "@/db/schema";

export const linkedinEngagementItems = [
  "repliedToComments",
  "commentedOnPosts",
  "connectedWithPeople",
  "repliedToDms",
  "acceptedRequests",
  "visitedProfiles",
] as const;

export const linkedinEngagementLabels: Record<(typeof linkedinEngagementItems)[number], string> = {
  repliedToComments: "Reply to Comments",
  commentedOnPosts: "Comment on Posts",
  connectedWithPeople: "Connect with People",
  repliedToDms: "Reply to DMs",
  acceptedRequests: "Accept Requests",
  visitedProfiles: "Visit Profiles",
};

export const linkedinEngagementSchema = z.object({
  date: z.string().min(1),
  repliedToComments: z.boolean(),
  commentedOnPosts: z.boolean(),
  connectedWithPeople: z.boolean(),
  repliedToDms: z.boolean(),
  acceptedRequests: z.boolean(),
  visitedProfiles: z.boolean(),
});

export type LinkedinEngagementValues = z.infer<typeof linkedinEngagementSchema>;

export function isFullyChecked(log: LinkedinEngagementLog): boolean {
  return linkedinEngagementItems.every((item) => log[item]);
}

export function completionRatio(log: LinkedinEngagementLog | undefined): number {
  if (!log) return 0;
  const checked = linkedinEngagementItems.filter((item) => log[item]).length;
  return checked / linkedinEngagementItems.length;
}
