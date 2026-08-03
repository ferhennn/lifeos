"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { linkedinIdeas, linkedinPosts, type LinkedinIdea } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinIdeaSchema, type LinkedinIdeaValues } from "../schema/idea.schema";

function revalidateAll() {
  revalidatePath("/linkedin/ideas");
  revalidatePath("/linkedin/pipeline");
  revalidatePath("/linkedin/daily");
}

export async function listLinkedinIdeas(): Promise<LinkedinIdea[]> {
  const user = await requireUser();
  return db.select().from(linkedinIdeas).where(eq(linkedinIdeas.userId, user.id)).orderBy(desc(linkedinIdeas.createdAt));
}

export async function createLinkedinIdea(values: LinkedinIdeaValues, attachmentUrls: string[] = []) {
  const user = await requireUser();
  const parsed = linkedinIdeaSchema.parse(values);

  const [idea] = await db
    .insert(linkedinIdeas)
    .values({
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      referenceLinks: parsed.referenceLinks,
      attachmentUrls,
      priority: parsed.priority,
      status: parsed.status,
    })
    .returning();

  revalidateAll();
  return idea;
}

export async function updateLinkedinIdea(id: string, values: LinkedinIdeaValues, attachmentUrls?: string[]) {
  const user = await requireUser();
  const parsed = linkedinIdeaSchema.parse(values);

  const [idea] = await db
    .update(linkedinIdeas)
    .set({
      title: parsed.title,
      description: parsed.description || null,
      referenceLinks: parsed.referenceLinks,
      ...(attachmentUrls ? { attachmentUrls } : {}),
      priority: parsed.priority,
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(and(eq(linkedinIdeas.id, id), eq(linkedinIdeas.userId, user.id)))
    .returning();

  revalidateAll();
  return idea;
}

export async function deleteLinkedinIdea(id: string) {
  const user = await requireUser();
  await db.delete(linkedinIdeas).where(and(eq(linkedinIdeas.id, id), eq(linkedinIdeas.userId, user.id)));
  revalidateAll();
}

/** Creates a draft post seeded from the idea, and marks the idea converted. */
export async function convertLinkedinIdeaToDraft(id: string) {
  const user = await requireUser();
  const [idea] = await db.select().from(linkedinIdeas).where(and(eq(linkedinIdeas.id, id), eq(linkedinIdeas.userId, user.id))).limit(1);
  if (!idea) return null;

  const [post] = await db
    .insert(linkedinPosts)
    .values({
      userId: user.id,
      status: "draft",
      topic: idea.title,
      notes: idea.description,
      caption: "",
    })
    .returning();

  await db
    .update(linkedinIdeas)
    .set({ status: "converted", convertedPostId: post.id, updatedAt: new Date() })
    .where(eq(linkedinIdeas.id, id));

  revalidateAll();
  revalidatePath("/linkedin/library");
  return post;
}
