"use server";

import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { linkedinPillars, linkedinPostPillars, type LinkedinPillar } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinPillarSchema, type LinkedinPillarValues } from "../schema/pillar.schema";

const DEFAULT_PILLARS = [
  { name: "Web Development", color: "#6366f1" },
  { name: "Next.js", color: "#0ea5e9" },
  { name: "Freelancing", color: "#10b981" },
  { name: "Portfolio", color: "#f59e0b" },
  { name: "Website Audits", color: "#ef4444" },
  { name: "AI", color: "#ec4899" },
  { name: "Career", color: "#8b5cf6" },
  { name: "Lessons Learned", color: "#64748b" },
  { name: "Agency Life", color: "#14b8a6" },
  { name: "Productivity", color: "#f97316" },
];

export type PillarWithCount = LinkedinPillar & { postCount: number };

export async function listLinkedinPillars(): Promise<PillarWithCount[]> {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(linkedinPillars)
    .where(eq(linkedinPillars.userId, user.id))
    .orderBy(asc(linkedinPillars.sortOrder), asc(linkedinPillars.createdAt));

  if (rows.length === 0) return [];

  const counts = await db
    .select({ pillarId: linkedinPostPillars.pillarId, total: sql<number>`count(*)`.mapWith(Number) })
    .from(linkedinPostPillars)
    .where(inArray(linkedinPostPillars.pillarId, rows.map((r) => r.id)))
    .groupBy(linkedinPostPillars.pillarId);
  const countMap = new Map(counts.map((c) => [c.pillarId, c.total]));

  return rows.map((p) => ({ ...p, postCount: countMap.get(p.id) ?? 0 }));
}

export type PillarOption = { id: string; name: string; color: string };

export async function listPillarOptions(): Promise<PillarOption[]> {
  const user = await requireUser();
  return db
    .select({ id: linkedinPillars.id, name: linkedinPillars.name, color: linkedinPillars.color })
    .from(linkedinPillars)
    .where(eq(linkedinPillars.userId, user.id))
    .orderBy(asc(linkedinPillars.sortOrder));
}

/** Seeds the 10 spec-default pillars the first time a user has none. */
export async function ensureDefaultPillars() {
  const user = await requireUser();
  const existing = await db.select({ id: linkedinPillars.id }).from(linkedinPillars).where(eq(linkedinPillars.userId, user.id)).limit(1);
  if (existing.length > 0) return;

  await db.insert(linkedinPillars).values(
    DEFAULT_PILLARS.map((p, i) => ({
      userId: user.id,
      name: p.name,
      color: p.color,
      isDefault: true,
      sortOrder: i,
    })),
  );
  revalidatePath("/linkedin/pillars");
}

export async function createPillar(values: LinkedinPillarValues) {
  const user = await requireUser();
  const parsed = linkedinPillarSchema.parse(values);

  const [pillar] = await db
    .insert(linkedinPillars)
    .values({ userId: user.id, name: parsed.name, description: parsed.description || null, color: parsed.color })
    .returning();

  revalidatePath("/linkedin/pillars");
  return pillar;
}

export async function updatePillar(id: string, values: LinkedinPillarValues) {
  const user = await requireUser();
  const parsed = linkedinPillarSchema.parse(values);

  const [pillar] = await db
    .update(linkedinPillars)
    .set({ name: parsed.name, description: parsed.description || null, color: parsed.color, updatedAt: new Date() })
    .where(and(eq(linkedinPillars.id, id), eq(linkedinPillars.userId, user.id)))
    .returning();

  revalidatePath("/linkedin/pillars");
  return pillar;
}

export async function deletePillar(id: string) {
  const user = await requireUser();
  await db.delete(linkedinPillars).where(and(eq(linkedinPillars.id, id), eq(linkedinPillars.userId, user.id)));
  revalidatePath("/linkedin/pillars");
}
