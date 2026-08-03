"use server";

import { eq, and, desc, isNotNull, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addDays, format, parseISO, isBefore } from "date-fns";
import { db } from "@/db";
import { strategies, goals, projects, tasks, type Strategy, type RecurrenceConfig, type TaskTemplate } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { computeOccurrences } from "../lib/recurrence";
import { strategySchema, type StrategyValues } from "../schema/strategy.schema";

export type StrategyWithMeta = Strategy & {
  goalTitle: string;
  goalCoverColor: string;
  progress: number;
  totalTasks: number;
  projectCount: number;
};

async function attachMeta(rows: (Strategy & { goalTitle: string; goalCoverColor: string })[]): Promise<StrategyWithMeta[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((s) => s.id);

  const taskCounts = await db
    .select({
      strategyId: tasks.strategyId,
      total: sql<number>`count(*)`.mapWith(Number),
      completed: sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(Number),
    })
    .from(tasks)
    .where(and(isNotNull(tasks.strategyId), inArray(tasks.strategyId, ids)))
    .groupBy(tasks.strategyId);

  const projectCounts = await db
    .select({ strategyId: projects.strategyId, total: sql<number>`count(*)`.mapWith(Number) })
    .from(projects)
    .where(inArray(projects.strategyId, ids))
    .groupBy(projects.strategyId);

  const taskMap = new Map(taskCounts.map((t) => [t.strategyId, t]));
  const projectMap = new Map(projectCounts.map((p) => [p.strategyId, p.total]));

  return rows.map((s) => {
    const t = taskMap.get(s.id);
    const progress = t && t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
    return { ...s, progress, totalTasks: t?.total ?? 0, projectCount: projectMap.get(s.id) ?? 0 };
  });
}

export async function listStrategies(): Promise<StrategyWithMeta[]> {
  const user = await requireUser();
  const rows = await db
    .select({
      id: strategies.id,
      goalId: strategies.goalId,
      userId: strategies.userId,
      title: strategies.title,
      description: strategies.description,
      expectedOutcome: strategies.expectedOutcome,
      successMetrics: strategies.successMetrics,
      estimatedEffort: strategies.estimatedEffort,
      priority: strategies.priority,
      status: strategies.status,
      recurrenceType: strategies.recurrenceType,
      recurrenceConfig: strategies.recurrenceConfig,
      taskTemplate: strategies.taskTemplate,
      lastGeneratedThrough: strategies.lastGeneratedThrough,
      sortOrder: strategies.sortOrder,
      createdAt: strategies.createdAt,
      updatedAt: strategies.updatedAt,
      goalTitle: goals.title,
      goalCoverColor: goals.coverColor,
    })
    .from(strategies)
    .innerJoin(goals, eq(strategies.goalId, goals.id))
    .where(eq(strategies.userId, user.id))
    .orderBy(desc(strategies.createdAt));

  return attachMeta(rows);
}

export type StrategyOption = { id: string; title: string; goalId: string; goalTitle: string; goalCoverColor: string };

/** Lightweight list for strategy-picker selects (projects and tasks forms). */
export async function listStrategyOptions(): Promise<StrategyOption[]> {
  const user = await requireUser();
  return db
    .select({
      id: strategies.id,
      title: strategies.title,
      goalId: strategies.goalId,
      goalTitle: goals.title,
      goalCoverColor: goals.coverColor,
    })
    .from(strategies)
    .innerJoin(goals, eq(strategies.goalId, goals.id))
    .where(eq(strategies.userId, user.id))
    .orderBy(desc(strategies.createdAt));
}

export async function getStrategy(id: string): Promise<StrategyWithMeta | null> {
  const user = await requireUser();
  const [row] = await db
    .select({
      id: strategies.id,
      goalId: strategies.goalId,
      userId: strategies.userId,
      title: strategies.title,
      description: strategies.description,
      expectedOutcome: strategies.expectedOutcome,
      successMetrics: strategies.successMetrics,
      estimatedEffort: strategies.estimatedEffort,
      priority: strategies.priority,
      status: strategies.status,
      recurrenceType: strategies.recurrenceType,
      recurrenceConfig: strategies.recurrenceConfig,
      taskTemplate: strategies.taskTemplate,
      lastGeneratedThrough: strategies.lastGeneratedThrough,
      sortOrder: strategies.sortOrder,
      createdAt: strategies.createdAt,
      updatedAt: strategies.updatedAt,
      goalTitle: goals.title,
      goalCoverColor: goals.coverColor,
    })
    .from(strategies)
    .innerJoin(goals, eq(strategies.goalId, goals.id))
    .where(and(eq(strategies.id, id), eq(strategies.userId, user.id)))
    .limit(1);

  if (!row) return null;
  const [withMeta] = await attachMeta([row]);
  return withMeta;
}

function buildConfigAndTemplate(values: StrategyValues): { config: RecurrenceConfig; template: TaskTemplate | null } {
  let config: RecurrenceConfig;
  switch (values.recurrenceType) {
    case "weekly":
      config = { type: "weekly", daysOfWeek: values.weeklyDays };
      break;
    case "monthly":
      config = { type: "monthly", dayOfMonth: values.monthlyDay ?? 1 };
      break;
    case "custom":
      config = { type: "custom", dates: values.customDates };
      break;
    case "daily":
      config = { type: "daily" };
      break;
    default:
      config = { type: "none" };
  }

  const template: TaskTemplate | null =
    values.recurrenceType === "none"
      ? null
      : {
          title: values.taskTitle || values.title,
          priority: values.taskPriority,
          estimatedTime: values.taskEstimatedTime ?? undefined,
        };

  return { config, template };
}

export async function createStrategy(values: StrategyValues) {
  const user = await requireUser();
  const parsed = strategySchema.parse(values);
  const { config, template } = buildConfigAndTemplate(parsed);

  const [strategy] = await db
    .insert(strategies)
    .values({
      goalId: parsed.goalId,
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      expectedOutcome: parsed.expectedOutcome || null,
      successMetrics: parsed.successMetrics || null,
      estimatedEffort: parsed.estimatedEffort || null,
      priority: parsed.priority,
      status: parsed.status,
      recurrenceType: parsed.recurrenceType,
      recurrenceConfig: config,
      taskTemplate: template,
    })
    .returning();

  if (parsed.recurrenceType !== "none" && parsed.status === "active") {
    await generateUpcomingTasks(strategy.id);
  }

  revalidatePath("/strategies");
  revalidatePath("/goals");
  revalidatePath(`/goals/${parsed.goalId}`);
  revalidatePath("/dashboard");
  return strategy;
}

export async function updateStrategy(id: string, values: StrategyValues) {
  const user = await requireUser();
  const parsed = strategySchema.parse(values);
  const { config, template } = buildConfigAndTemplate(parsed);

  const [strategy] = await db
    .update(strategies)
    .set({
      goalId: parsed.goalId,
      title: parsed.title,
      description: parsed.description || null,
      expectedOutcome: parsed.expectedOutcome || null,
      successMetrics: parsed.successMetrics || null,
      estimatedEffort: parsed.estimatedEffort || null,
      priority: parsed.priority,
      status: parsed.status,
      recurrenceType: parsed.recurrenceType,
      recurrenceConfig: config,
      taskTemplate: template,
      updatedAt: new Date(),
    })
    .where(and(eq(strategies.id, id), eq(strategies.userId, user.id)))
    .returning();

  if (parsed.recurrenceType !== "none" && parsed.status === "active") {
    await generateUpcomingTasks(id);
  }

  revalidatePath("/strategies");
  revalidatePath(`/strategies/${id}`);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return strategy;
}

export async function deleteStrategy(id: string) {
  const user = await requireUser();
  await db.delete(strategies).where(and(eq(strategies.id, id), eq(strategies.userId, user.id)));
  revalidatePath("/strategies");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

const ROLLING_WINDOW_DAYS = 14;

/**
 * Materializes tasks for every occurrence between the last generated date
 * and a 14-day rolling window from today, then advances the watermark.
 * Idempotent-ish: calling it twice in the same day is a no-op once the
 * watermark has caught up to the window end.
 */
export async function generateUpcomingTasks(strategyId: string) {
  const user = await requireUser();
  const [strategy] = await db
    .select()
    .from(strategies)
    .where(and(eq(strategies.id, strategyId), eq(strategies.userId, user.id)))
    .limit(1);

  if (!strategy || strategy.recurrenceType === "none" || !strategy.recurrenceConfig) {
    return { created: 0 };
  }

  const today = new Date();
  const windowEnd = addDays(today, ROLLING_WINDOW_DAYS - 1);
  const windowStart = strategy.lastGeneratedThrough
    ? addDays(parseISO(strategy.lastGeneratedThrough), 1)
    : today;

  if (isBefore(windowEnd, windowStart)) {
    return { created: 0 };
  }

  const occurrences = computeOccurrences(strategy.recurrenceConfig, windowStart, windowEnd);

  if (occurrences.length > 0) {
    const template = strategy.taskTemplate;
    const fallbackPriority: "low" | "medium" | "high" | "urgent" =
      strategy.priority === "critical" ? "urgent" : strategy.priority;
    await db.insert(tasks).values(
      occurrences.map((dateStr) => ({
        userId: user.id,
        title: template?.title || strategy.title,
        status: "todo" as const,
        priority: template?.priority ?? fallbackPriority,
        dueDate: dateStr,
        estimatedTime: template?.estimatedTime ?? null,
        source: "strategy_generated" as const,
        strategyId: strategy.id,
        goalId: strategy.goalId,
      })),
    );
  }

  await db
    .update(strategies)
    .set({ lastGeneratedThrough: format(windowEnd, "yyyy-MM-dd") })
    .where(eq(strategies.id, strategyId));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/strategies/${strategyId}`);

  return { created: occurrences.length };
}
