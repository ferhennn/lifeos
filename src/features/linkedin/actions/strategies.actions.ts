"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { linkedinStrategies, linkedinStrategyPillars, linkedinPillars, type LinkedinStrategy } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinStrategySchema, type LinkedinStrategyValues } from "../schema/strategy.schema";

export type StrategyWithPillars = LinkedinStrategy & { pillars: { id: string; name: string; color: string }[] };

async function attachPillars(rows: LinkedinStrategy[]): Promise<StrategyWithPillars[]> {
  if (rows.length === 0) return [];
  const links = await db
    .select({
      strategyId: linkedinStrategyPillars.strategyId,
      id: linkedinPillars.id,
      name: linkedinPillars.name,
      color: linkedinPillars.color,
    })
    .from(linkedinStrategyPillars)
    .innerJoin(linkedinPillars, eq(linkedinStrategyPillars.pillarId, linkedinPillars.id))
    .where(inArray(linkedinStrategyPillars.strategyId, rows.map((r) => r.id)));

  const map = new Map<string, { id: string; name: string; color: string }[]>();
  for (const link of links) {
    map.set(link.strategyId, [...(map.get(link.strategyId) ?? []), { id: link.id, name: link.name, color: link.color }]);
  }
  return rows.map((s) => ({ ...s, pillars: map.get(s.id) ?? [] }));
}

export async function listLinkedinStrategies(): Promise<StrategyWithPillars[]> {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(linkedinStrategies)
    .where(eq(linkedinStrategies.userId, user.id))
    .orderBy(desc(linkedinStrategies.createdAt));
  return attachPillars(rows);
}

export type LinkedinStrategyOption = { id: string; name: string };

export async function listLinkedinStrategyOptions(): Promise<LinkedinStrategyOption[]> {
  const user = await requireUser();
  return db
    .select({ id: linkedinStrategies.id, name: linkedinStrategies.name })
    .from(linkedinStrategies)
    .where(eq(linkedinStrategies.userId, user.id))
    .orderBy(desc(linkedinStrategies.createdAt));
}

async function setPillarLinks(strategyId: string, pillarIds: string[]) {
  await db.delete(linkedinStrategyPillars).where(eq(linkedinStrategyPillars.strategyId, strategyId));
  if (pillarIds.length > 0) {
    await db.insert(linkedinStrategyPillars).values(pillarIds.map((pillarId) => ({ strategyId, pillarId })));
  }
}

export async function createLinkedinStrategy(values: LinkedinStrategyValues) {
  const user = await requireUser();
  const parsed = linkedinStrategySchema.parse(values);

  const [strategy] = await db
    .insert(linkedinStrategies)
    .values({
      userId: user.id,
      name: parsed.name,
      goal: parsed.goal || null,
      postingFrequency: parsed.postingFrequency || null,
      targetAudience: parsed.targetAudience || null,
      primaryCta: parsed.primaryCta || null,
      successMetric: parsed.successMetric || null,
      status: parsed.status,
    })
    .returning();

  await setPillarLinks(strategy.id, parsed.pillarIds);
  revalidatePath("/linkedin/strategies");
  return strategy;
}

export async function updateLinkedinStrategy(id: string, values: LinkedinStrategyValues) {
  const user = await requireUser();
  const parsed = linkedinStrategySchema.parse(values);

  const [strategy] = await db
    .update(linkedinStrategies)
    .set({
      name: parsed.name,
      goal: parsed.goal || null,
      postingFrequency: parsed.postingFrequency || null,
      targetAudience: parsed.targetAudience || null,
      primaryCta: parsed.primaryCta || null,
      successMetric: parsed.successMetric || null,
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(and(eq(linkedinStrategies.id, id), eq(linkedinStrategies.userId, user.id)))
    .returning();

  if (strategy) await setPillarLinks(strategy.id, parsed.pillarIds);
  revalidatePath("/linkedin/strategies");
  return strategy;
}

export async function deleteLinkedinStrategy(id: string) {
  const user = await requireUser();
  await db.delete(linkedinStrategies).where(and(eq(linkedinStrategies.id, id), eq(linkedinStrategies.userId, user.id)));
  revalidatePath("/linkedin/strategies");
}
