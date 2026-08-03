"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { linkedinProfileSnapshots, type LinkedinProfileSnapshot } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinProfileSnapshotSchema, type LinkedinProfileSnapshotValues } from "../schema/profile-snapshot.schema";

export async function getLatestProfileSnapshot(): Promise<LinkedinProfileSnapshot | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(linkedinProfileSnapshots)
    .where(eq(linkedinProfileSnapshots.userId, user.id))
    .orderBy(desc(linkedinProfileSnapshots.capturedAt))
    .limit(1);
  return row ?? null;
}

export async function listProfileSnapshots(limit = 90): Promise<LinkedinProfileSnapshot[]> {
  const user = await requireUser();
  return db
    .select()
    .from(linkedinProfileSnapshots)
    .where(eq(linkedinProfileSnapshots.userId, user.id))
    .orderBy(desc(linkedinProfileSnapshots.capturedAt))
    .limit(limit);
}

export async function recordProfileSnapshot(values: LinkedinProfileSnapshotValues) {
  const user = await requireUser();
  const parsed = linkedinProfileSnapshotSchema.parse(values);

  const [snapshot] = await db
    .insert(linkedinProfileSnapshots)
    .values({ userId: user.id, followers: parsed.followers ?? null, profileViews: parsed.profileViews ?? null, connections: parsed.connections ?? null })
    .returning();

  revalidatePath("/linkedin");
  return snapshot;
}
