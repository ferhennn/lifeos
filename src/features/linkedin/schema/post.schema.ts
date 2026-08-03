import { z } from "zod";
import { linkedinPostPipelineStatuses } from "@/lib/status-config";

export const linkedinPostStatuses = linkedinPostPipelineStatuses;

const carouselSlideSchema = z.object({
  order: z.number(),
  title: z.string().max(200),
  body: z.string().max(2000),
});

export const linkedinPostSchema = z.object({
  status: z.enum(linkedinPostStatuses),
  topic: z.string().max(200).optional().or(z.literal("")),
  hook: z.string().max(500).optional().or(z.literal("")),
  caption: z.string().max(5000),
  cta: z.string().max(300).optional().or(z.literal("")),
  hashtags: z.string().max(500).optional().or(z.literal("")), // space/comma separated in the form
  carouselSlides: z.array(carouselSlideSchema),
  imagePrompt: z.string().max(1000).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  estimatedReadingTime: z.number().int().min(0).max(60).optional().nullable(),
  targetAudience: z.string().max(300).optional().or(z.literal("")),
  scheduledDate: z.string().optional().or(z.literal("")),
  strategyId: z.string().optional().or(z.literal("")),
  goalId: z.string().optional().or(z.literal("")),
  pillarIds: z.array(z.string()),
});

export type LinkedinPostValues = z.infer<typeof linkedinPostSchema>;

export const bulkLinkedinPostSchema = z.object({
  posts: z.array(linkedinPostSchema).min(1, "Add at least one post"),
});

export type BulkLinkedinPostValues = z.infer<typeof bulkLinkedinPostSchema>;

export function hashtagsToArray(hashtags: string | undefined): string[] {
  if (!hashtags) return [];
  return hashtags
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

export function hashtagsToString(hashtags: string[] | null | undefined): string {
  return (hashtags ?? []).join(" ");
}
