"use server";

import { eq, and, desc, isNotNull, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals, tasks, strategies, linkedinPosts, type Goal } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { goalSchema, type GoalValues } from "../schema/goal.schema";

export type GoalWithProgress = Goal & {
  progress: number;
  totalTasks: number;
  totalLinkedinPosts: number;
  strategyCount: number;
};

async function attachProgress(rows: Goal[]): Promise<GoalWithProgress[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((g) => g.id);

  const taskCounts = await db
    .select({
      goalId: tasks.goalId,
      total: sql<number>`count(*)`.mapWith(Number),
      completed: sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(Number),
    })
    .from(tasks)
    .where(and(isNotNull(tasks.goalId), inArray(tasks.goalId, ids)))
    .groupBy(tasks.goalId);

  const linkedinCounts = await db
    .select({
      goalId: linkedinPosts.goalId,
      total: sql<number>`count(*)`.mapWith(Number),
      completed: sql<number>`count(*) filter (where ${linkedinPosts.status} = 'published')`.mapWith(Number),
    })
    .from(linkedinPosts)
    .where(and(isNotNull(linkedinPosts.goalId), inArray(linkedinPosts.goalId, ids)))
    .groupBy(linkedinPosts.goalId);

  const strategyCounts = await db
    .select({
      goalId: strategies.goalId,
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(strategies)
    .where(inArray(strategies.goalId, ids))
    .groupBy(strategies.goalId);

  const taskMap = new Map(taskCounts.map((t) => [t.goalId, t]));
  const linkedinMap = new Map(linkedinCounts.map((l) => [l.goalId, l]));
  const strategyMap = new Map(strategyCounts.map((s) => [s.goalId, s.total]));

  return rows.map((goal) => {
    const t = taskMap.get(goal.id);
    const l = linkedinMap.get(goal.id);
    const total = (t?.total ?? 0) + (l?.total ?? 0);
    const completed = (t?.completed ?? 0) + (l?.completed ?? 0);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      ...goal,
      progress,
      totalTasks: t?.total ?? 0,
      totalLinkedinPosts: l?.total ?? 0,
      strategyCount: strategyMap.get(goal.id) ?? 0,
    };
  });
}

export async function listGoals(): Promise<GoalWithProgress[]> {
  const user = await requireUser();
  const rows = await db.select().from(goals).where(eq(goals.userId, user.id)).orderBy(desc(goals.createdAt));
  return attachProgress(rows);
}

export type GoalOption = { id: string; title: string; coverColor: string };

/** Lightweight list for goal-picker selects (strategies, and later projects/tasks forms). */
export async function listGoalOptions(): Promise<GoalOption[]> {
  const user = await requireUser();
  return db
    .select({ id: goals.id, title: goals.title, coverColor: goals.coverColor })
    .from(goals)
    .where(eq(goals.userId, user.id))
    .orderBy(desc(goals.createdAt));
}

export async function getGoal(id: string): Promise<GoalWithProgress | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .limit(1);
  if (!row) return null;
  const [withProgress] = await attachProgress([row]);
  return withProgress;
}

export async function createGoal(values: GoalValues) {
  const user = await requireUser();
  const parsed = goalSchema.parse(values);

  const [goal] = await db
    .insert(goals)
    .values({
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      targetDate: parsed.targetDate || null,
      priority: parsed.priority,
      status: parsed.status,
      coverColor: parsed.coverColor,
    })
    .returning();

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function updateGoal(id: string, values: GoalValues) {
  const user = await requireUser();
  const parsed = goalSchema.parse(values);

  const [goal] = await db
    .update(goals)
    .set({
      title: parsed.title,
      description: parsed.description || null,
      targetDate: parsed.targetDate || null,
      priority: parsed.priority,
      status: parsed.status,
      coverColor: parsed.coverColor,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .returning();

  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
  revalidatePath("/dashboard");
  return goal;
}

export async function deleteGoal(id: string) {
  const user = await requireUser();
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
