"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { linkedinGoals, type LinkedinGoal } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinGoalSchema, type LinkedinGoalValues } from "../schema/goal.schema";

export async function listLinkedinGoals(): Promise<LinkedinGoal[]> {
  const user = await requireUser();
  return db.select().from(linkedinGoals).where(eq(linkedinGoals.userId, user.id)).orderBy(desc(linkedinGoals.createdAt));
}

export async function createLinkedinGoal(values: LinkedinGoalValues) {
  const user = await requireUser();
  const parsed = linkedinGoalSchema.parse(values);

  const [goal] = await db
    .insert(linkedinGoals)
    .values({
      userId: user.id,
      title: parsed.title,
      metric: parsed.metric,
      targetValue: parsed.targetValue,
      currentValue: parsed.currentValue,
      targetDate: parsed.targetDate || null,
      status: parsed.status,
    })
    .returning();

  revalidatePath("/linkedin/goals");
  revalidatePath("/linkedin");
  return goal;
}

export async function updateLinkedinGoal(id: string, values: LinkedinGoalValues) {
  const user = await requireUser();
  const parsed = linkedinGoalSchema.parse(values);

  const [goal] = await db
    .update(linkedinGoals)
    .set({
      title: parsed.title,
      metric: parsed.metric,
      targetValue: parsed.targetValue,
      currentValue: parsed.currentValue,
      targetDate: parsed.targetDate || null,
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(and(eq(linkedinGoals.id, id), eq(linkedinGoals.userId, user.id)))
    .returning();

  revalidatePath("/linkedin/goals");
  revalidatePath("/linkedin");
  return goal;
}

export async function logLinkedinGoalProgress(id: string, delta: number) {
  const user = await requireUser();
  const [existing] = await db.select().from(linkedinGoals).where(and(eq(linkedinGoals.id, id), eq(linkedinGoals.userId, user.id))).limit(1);
  if (!existing) return null;

  const nextValue = Math.max(0, existing.currentValue + delta);
  const [goal] = await db
    .update(linkedinGoals)
    .set({
      currentValue: nextValue,
      status: nextValue >= existing.targetValue && existing.status === "active" ? "completed" : existing.status,
      updatedAt: new Date(),
    })
    .where(eq(linkedinGoals.id, id))
    .returning();

  revalidatePath("/linkedin/goals");
  revalidatePath("/linkedin");
  return goal;
}

export async function deleteLinkedinGoal(id: string) {
  const user = await requireUser();
  await db.delete(linkedinGoals).where(and(eq(linkedinGoals.id, id), eq(linkedinGoals.userId, user.id)));
  revalidatePath("/linkedin/goals");
  revalidatePath("/linkedin");
}
