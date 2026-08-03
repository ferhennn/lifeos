"use server";

import { eq, and, asc, desc, inArray, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { db } from "@/db";
import {
  linkedinPosts,
  linkedinPostPillars,
  linkedinPillars,
  linkedinPostRevisions,
  type LinkedinPost,
} from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinPostSchema, hashtagsToArray, type LinkedinPostValues } from "../schema/post.schema";

export type PillarTag = { id: string; name: string; color: string };
export type LinkedinPostWithPillars = LinkedinPost & { pillars: PillarTag[] };

function revalidateAll() {
  revalidatePath("/linkedin");
  revalidatePath("/linkedin/daily");
  revalidatePath("/linkedin/calendar");
  revalidatePath("/linkedin/pipeline");
  revalidatePath("/linkedin/library");
  revalidatePath("/dashboard");
  revalidatePath("/goals");
}

async function attachPillars(rows: LinkedinPost[]): Promise<LinkedinPostWithPillars[]> {
  if (rows.length === 0) return [];
  const links = await db
    .select({
      postId: linkedinPostPillars.postId,
      id: linkedinPillars.id,
      name: linkedinPillars.name,
      color: linkedinPillars.color,
    })
    .from(linkedinPostPillars)
    .innerJoin(linkedinPillars, eq(linkedinPostPillars.pillarId, linkedinPillars.id))
    .where(inArray(linkedinPostPillars.postId, rows.map((r) => r.id)));

  const map = new Map<string, PillarTag[]>();
  for (const link of links) {
    map.set(link.postId, [...(map.get(link.postId) ?? []), { id: link.id, name: link.name, color: link.color }]);
  }
  return rows.map((p) => ({ ...p, pillars: map.get(p.id) ?? [] }));
}

async function setPillarLinks(postId: string, pillarIds: string[]) {
  await db.delete(linkedinPostPillars).where(eq(linkedinPostPillars.postId, postId));
  if (pillarIds.length > 0) {
    await db.insert(linkedinPostPillars).values(pillarIds.map((pillarId) => ({ postId, pillarId })));
  }
}

export async function listLinkedinPosts(): Promise<LinkedinPostWithPillars[]> {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(linkedinPosts)
    .where(eq(linkedinPosts.userId, user.id))
    .orderBy(asc(linkedinPosts.scheduledDate), desc(linkedinPosts.createdAt));
  return attachPillars(rows);
}

export async function getLinkedinPost(id: string): Promise<LinkedinPostWithPillars | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .limit(1);
  if (!row) return null;
  const [withPillars] = await attachPillars([row]);
  return withPillars;
}

export async function listPostRevisions(postId: string) {
  return db
    .select()
    .from(linkedinPostRevisions)
    .where(eq(linkedinPostRevisions.postId, postId))
    .orderBy(desc(linkedinPostRevisions.editedAt));
}

export async function listRelatedPosts(postId: string, pillarIds: string[]): Promise<LinkedinPostWithPillars[]> {
  const user = await requireUser();
  if (pillarIds.length === 0) return [];
  const relatedIds = await db
    .select({ postId: linkedinPostPillars.postId })
    .from(linkedinPostPillars)
    .where(inArray(linkedinPostPillars.pillarId, pillarIds));
  const ids = [...new Set(relatedIds.map((r) => r.postId))].filter((id) => id !== postId);
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.userId, user.id), inArray(linkedinPosts.id, ids)))
    .orderBy(desc(linkedinPosts.createdAt))
    .limit(6);
  return attachPillars(rows);
}

/** Strict "scheduled for today" lookup — used by the global LifeOS dashboard card. */
export async function getTodayLinkedinPost(): Promise<LinkedinPost | null> {
  const user = await requireUser();
  const today = format(new Date(), "yyyy-MM-dd");
  const [row] = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.userId, user.id), eq(linkedinPosts.scheduledDate, today)))
    .limit(1);
  return row ?? null;
}

/** Daily Posting "queue" — today's post if scheduled, else the next upcoming unpublished post. */
export async function getQueuePost(): Promise<LinkedinPostWithPillars | null> {
  const user = await requireUser();
  const today = format(new Date(), "yyyy-MM-dd");

  const [todayPost] = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.userId, user.id), eq(linkedinPosts.scheduledDate, today)))
    .limit(1);
  if (todayPost) return (await attachPillars([todayPost]))[0];

  const [next] = await db
    .select()
    .from(linkedinPosts)
    .where(
      and(
        eq(linkedinPosts.userId, user.id),
        sql`${linkedinPosts.status} != 'published'`,
        isNotNull(linkedinPosts.scheduledDate),
        sql`${linkedinPosts.scheduledDate} >= ${today}`,
      ),
    )
    .orderBy(asc(linkedinPosts.scheduledDate))
    .limit(1);
  if (next) return (await attachPillars([next]))[0];

  return null;
}

function buildValues(parsed: LinkedinPostValues) {
  return {
    status: parsed.status,
    topic: parsed.topic || null,
    hook: parsed.hook || null,
    caption: parsed.caption,
    cta: parsed.cta || null,
    hashtags: hashtagsToArray(parsed.hashtags),
    carouselSlides: parsed.carouselSlides,
    imagePrompt: parsed.imagePrompt || null,
    notes: parsed.notes || null,
    estimatedReadingTime: parsed.estimatedReadingTime ?? null,
    targetAudience: parsed.targetAudience || null,
    scheduledDate: parsed.scheduledDate || null,
    strategyId: parsed.strategyId || null,
    goalId: parsed.goalId || null,
  };
}

export async function createLinkedinPost(values: LinkedinPostValues) {
  const user = await requireUser();
  const parsed = linkedinPostSchema.parse(values);

  const [post] = await db.insert(linkedinPosts).values({ userId: user.id, ...buildValues(parsed) }).returning();
  await setPillarLinks(post.id, parsed.pillarIds);

  revalidateAll();
  return post;
}

export async function bulkCreateLinkedinPosts(items: LinkedinPostValues[]) {
  if (items.length === 0) return [];
  const user = await requireUser();
  const parsed = items.map((item) => linkedinPostSchema.parse(item));

  const rows = await db
    .insert(linkedinPosts)
    .values(parsed.map((p, i) => ({ userId: user.id, dayNumber: i + 1, ...buildValues(p) })))
    .returning();

  await Promise.all(rows.map((row, i) => setPillarLinks(row.id, parsed[i].pillarIds)));

  revalidateAll();
  return rows;
}

export async function updateLinkedinPost(id: string, values: LinkedinPostValues) {
  const user = await requireUser();
  const parsed = linkedinPostSchema.parse(values);

  const [existing] = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .limit(1);
  if (!existing) return null;

  await db.insert(linkedinPostRevisions).values({ postId: id, snapshot: existing });

  const [post] = await db
    .update(linkedinPosts)
    .set({ ...buildValues(parsed), updatedAt: new Date() })
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .returning();

  await setPillarLinks(id, parsed.pillarIds);
  revalidateAll();
  revalidatePath(`/linkedin/library/${id}`);
  return post;
}

export async function duplicateLinkedinPost(id: string) {
  const user = await requireUser();
  const [existing] = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .limit(1);
  if (!existing) return null;

  const [copy] = await db
    .insert(linkedinPosts)
    .values({
      userId: user.id,
      status: "draft",
      topic: existing.topic,
      hook: existing.hook,
      caption: existing.caption,
      cta: existing.cta,
      hashtags: existing.hashtags,
      carouselSlides: existing.carouselSlides,
      imagePrompt: existing.imagePrompt,
      notes: existing.notes,
      estimatedReadingTime: existing.estimatedReadingTime,
      targetAudience: existing.targetAudience,
      strategyId: existing.strategyId,
      goalId: existing.goalId,
      scheduledDate: null,
    })
    .returning();

  const pillarLinks = await db.select({ pillarId: linkedinPostPillars.pillarId }).from(linkedinPostPillars).where(eq(linkedinPostPillars.postId, id));
  if (pillarLinks.length > 0) {
    await db.insert(linkedinPostPillars).values(pillarLinks.map((l) => ({ postId: copy.id, pillarId: l.pillarId })));
  }

  revalidateAll();
  return copy;
}

export async function setLinkedinPostStatus(id: string, status: LinkedinPost["status"]) {
  const user = await requireUser();
  const [post] = await db
    .update(linkedinPosts)
    .set({ status, updatedAt: new Date(), postedAt: status === "published" ? new Date() : undefined })
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return post;
}

export async function markLinkedinPostPosted(id: string) {
  const user = await requireUser();
  const [post] = await db
    .update(linkedinPosts)
    .set({ status: "published", postedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return post;
}

export async function reschedulePost(id: string, scheduledDate: string | null) {
  const user = await requireUser();
  const [existing] = await db
    .select()
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .limit(1);
  if (!existing) return null;

  const nextStatus = scheduledDate && existing.status === "idea" ? "scheduled" : existing.status;

  const [post] = await db
    .update(linkedinPosts)
    .set({ scheduledDate, status: nextStatus, updatedAt: new Date() })
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return post;
}

export async function toggleLinkedinPostFavorite(id: string, isFavorite: boolean) {
  const user = await requireUser();
  const [post] = await db
    .update(linkedinPosts)
    .set({ isFavorite, updatedAt: new Date() })
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return post;
}

export async function setLinkedinPostMetrics(
  id: string,
  metrics: { likes?: number | null; comments?: number | null; shares?: number | null; impressions?: number | null; views?: number | null; followersGained?: number | null },
) {
  const user = await requireUser();
  const [post] = await db
    .update(linkedinPosts)
    .set({ ...metrics, updatedAt: new Date() })
    .where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return post;
}

export async function deleteLinkedinPost(id: string) {
  const user = await requireUser();
  await db.delete(linkedinPosts).where(and(eq(linkedinPosts.id, id), eq(linkedinPosts.userId, user.id)));
  revalidateAll();
}

export async function bulkDeleteLinkedinPosts(ids: string[]) {
  if (ids.length === 0) return;
  const user = await requireUser();
  await db.delete(linkedinPosts).where(and(eq(linkedinPosts.userId, user.id), inArray(linkedinPosts.id, ids)));
  revalidateAll();
}

export async function bulkSetLinkedinPostsStatus(ids: string[], status: LinkedinPost["status"]) {
  if (ids.length === 0) return;
  const user = await requireUser();
  await db
    .update(linkedinPosts)
    .set({ status, updatedAt: new Date(), postedAt: status === "published" ? new Date() : undefined })
    .where(and(eq(linkedinPosts.userId, user.id), inArray(linkedinPosts.id, ids)));
  revalidateAll();
}

export async function bulkRescheduleLinkedinPosts(ids: string[], scheduledDate: string | null) {
  if (ids.length === 0) return;
  const user = await requireUser();
  const rows = await db
    .select({ id: linkedinPosts.id, status: linkedinPosts.status })
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.userId, user.id), inArray(linkedinPosts.id, ids)));

  await Promise.all(
    rows.map((row) => {
      const nextStatus = scheduledDate && row.status === "idea" ? "scheduled" : row.status;
      return db
        .update(linkedinPosts)
        .set({ scheduledDate, status: nextStatus, updatedAt: new Date() })
        .where(and(eq(linkedinPosts.id, row.id), eq(linkedinPosts.userId, user.id)));
    }),
  );
  revalidateAll();
}

export async function bulkAssignLinkedinPostsPillar(ids: string[], pillarId: string) {
  if (ids.length === 0) return;
  const user = await requireUser();
  const rows = await db
    .select({ id: linkedinPosts.id })
    .from(linkedinPosts)
    .where(and(eq(linkedinPosts.userId, user.id), inArray(linkedinPosts.id, ids)));
  const validIds = rows.map((r) => r.id);
  if (validIds.length === 0) return;

  await db.insert(linkedinPostPillars).values(validIds.map((postId) => ({ postId, pillarId }))).onConflictDoNothing();
  revalidateAll();
}

export async function deleteLinkedinPosts(ids: string[]) {
  if (ids.length === 0) return;
  const user = await requireUser();
  await db.delete(linkedinPosts).where(and(inArray(linkedinPosts.id, ids), eq(linkedinPosts.userId, user.id)));
  revalidateAll();
}

export async function setLinkedinPostsStatus(ids: string[], status: LinkedinPost["status"]) {
  if (ids.length === 0) return [];
  const user = await requireUser();
  const rows = await db
    .update(linkedinPosts)
    .set({ status, updatedAt: new Date(), postedAt: status === "published" ? new Date() : undefined })
    .where(and(inArray(linkedinPosts.id, ids), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return rows;
}

export async function setLinkedinPostsGoal(ids: string[], goalId: string | null) {
  if (ids.length === 0) return [];
  const user = await requireUser();
  const rows = await db
    .update(linkedinPosts)
    .set({ goalId, updatedAt: new Date() })
    .where(and(inArray(linkedinPosts.id, ids), eq(linkedinPosts.userId, user.id)))
    .returning();
  revalidateAll();
  return rows;
}
