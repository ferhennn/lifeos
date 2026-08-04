"use server";

import { eq, and, ne, desc, asc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  tasks,
  subtasks,
  taskDependencies,
  projects,
  strategies,
  goals,
  epics,
  type Task,
  type Subtask,
  type RecurrenceConfig,
} from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { taskSchema, quickTaskSchema, taskStatuses, type TaskValues, type QuickTaskValues } from "../schema/task.schema";

type TaskStatus = (typeof taskStatuses)[number];

export type TaskWithMeta = Task & {
  projectTitle: string | null;
  strategyTitle: string | null;
  goalTitle: string | null;
  goalCoverColor: string | null;
  epicTitle: string | null;
  subtaskTotal: number;
  subtaskDone: number;
  dependsOnCount: number;
};

const taskSelectShape = {
  id: tasks.id,
  userId: tasks.userId,
  title: tasks.title,
  description: tasks.description,
  status: tasks.status,
  priority: tasks.priority,
  dueDate: tasks.dueDate,
  estimatedTime: tasks.estimatedTime,
  actualTime: tasks.actualTime,
  labels: tasks.labels,
  repeatRule: tasks.repeatRule,
  reminderAt: tasks.reminderAt,
  customProperties: tasks.customProperties,
  source: tasks.source,
  sortOrder: tasks.sortOrder,
  epicId: tasks.epicId,
  projectId: tasks.projectId,
  strategyId: tasks.strategyId,
  goalId: tasks.goalId,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt,
  completedAt: tasks.completedAt,
  projectTitle: projects.title,
  strategyTitle: strategies.title,
  goalTitle: goals.title,
  goalCoverColor: goals.coverColor,
  epicTitle: epics.title,
};

async function attachCounts(rows: Task[]): Promise<TaskWithMeta[]> {
  const base = rows as unknown as (Task & {
    projectTitle: string | null;
    strategyTitle: string | null;
    goalTitle: string | null;
    goalCoverColor: string | null;
    epicTitle: string | null;
  })[];
  if (base.length === 0) return [];
  const ids = base.map((t) => t.id);

  const subtaskCounts = await db
    .select({
      taskId: subtasks.taskId,
      total: sql<number>`count(*)`.mapWith(Number),
      done: sql<number>`count(*) filter (where ${subtasks.isDone} = true)`.mapWith(Number),
    })
    .from(subtasks)
    .where(inArray(subtasks.taskId, ids))
    .groupBy(subtasks.taskId);

  const depCounts = await db
    .select({ taskId: taskDependencies.taskId, total: sql<number>`count(*)`.mapWith(Number) })
    .from(taskDependencies)
    .where(inArray(taskDependencies.taskId, ids))
    .groupBy(taskDependencies.taskId);

  const subtaskMap = new Map(subtaskCounts.map((s) => [s.taskId, s]));
  const depMap = new Map(depCounts.map((d) => [d.taskId, d.total]));

  return base.map((t) => ({
    ...t,
    subtaskTotal: subtaskMap.get(t.id)?.total ?? 0,
    subtaskDone: subtaskMap.get(t.id)?.done ?? 0,
    dependsOnCount: depMap.get(t.id) ?? 0,
  }));
}

export async function listTasks(): Promise<TaskWithMeta[]> {
  const user = await requireUser();
  const rows = await db
    .select(taskSelectShape)
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(strategies, eq(tasks.strategyId, strategies.id))
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .leftJoin(epics, eq(tasks.epicId, epics.id))
    .where(eq(tasks.userId, user.id))
    .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));

  return attachCounts(rows as unknown as Task[]);
}

export type TaskDetail = TaskWithMeta & {
  subtasks: Subtask[];
  dependsOn: { id: string; title: string; status: string }[];
};

export async function getTaskDetail(id: string): Promise<TaskDetail | null> {
  const user = await requireUser();
  const [row] = await db
    .select(taskSelectShape)
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(strategies, eq(tasks.strategyId, strategies.id))
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .leftJoin(epics, eq(tasks.epicId, epics.id))
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .limit(1);

  if (!row) return null;

  const [subtaskRows, depRows, [withCounts]] = await Promise.all([
    db.select().from(subtasks).where(eq(subtasks.taskId, id)).orderBy(asc(subtasks.sortOrder)),
    db
      .select({ id: tasks.id, title: tasks.title, status: tasks.status })
      .from(taskDependencies)
      .innerJoin(tasks, eq(taskDependencies.dependsOnTaskId, tasks.id))
      .where(eq(taskDependencies.taskId, id)),
    attachCounts([row as unknown as Task]),
  ]);

  return { ...withCounts, subtasks: subtaskRows, dependsOn: depRows };
}

export type TaskOption = { id: string; title: string };

export async function listTaskOptions(excludeId?: string): Promise<TaskOption[]> {
  const user = await requireUser();
  const rows = await db
    .select({ id: tasks.id, title: tasks.title })
    .from(tasks)
    .where(
      excludeId
        ? and(eq(tasks.userId, user.id), ne(tasks.id, excludeId))
        : eq(tasks.userId, user.id),
    )
    .orderBy(desc(tasks.createdAt))
    .limit(200);
  return rows;
}

function buildRepeatRule(repeatType: TaskValues["repeatType"]): RecurrenceConfig | null {
  switch (repeatType) {
    case "daily":
      return { type: "daily" };
    case "weekly":
      return { type: "weekly", daysOfWeek: [] };
    case "monthly":
      return { type: "monthly", dayOfMonth: 1 };
    default:
      return null;
  }
}

function buildTaskValues(user: { id: string }, parsed: TaskValues) {
  return {
    userId: user.id,
    title: parsed.title,
    description: parsed.description || null,
    status: parsed.status,
    priority: parsed.priority,
    dueDate: parsed.dueDate || null,
    estimatedTime: parsed.estimatedTime ?? null,
    actualTime: parsed.actualTime ?? null,
    labels: parsed.labels,
    repeatRule: buildRepeatRule(parsed.repeatType),
    reminderAt: parsed.reminderAt ? new Date(parsed.reminderAt) : null,
    goalId: parsed.goalId || null,
    strategyId: parsed.strategyId || null,
    projectId: parsed.projectId || null,
    epicId: parsed.epicId || null,
    completedAt: parsed.status === "done" ? new Date() : null,
  };
}

export async function createTask(values: TaskValues) {
  const user = await requireUser();
  const parsed = taskSchema.parse(values);

  const [task] = await db.insert(tasks).values(buildTaskValues(user, parsed)).returning();

  if (parsed.dependsOn.length > 0) {
    await db.insert(taskDependencies).values(parsed.dependsOn.map((depId) => ({ taskId: task.id, dependsOnTaskId: depId })));
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (parsed.projectId) revalidatePath(`/projects/${parsed.projectId}`);
  return task;
}

export async function quickCreateTask(values: QuickTaskValues) {
  const user = await requireUser();
  const parsed = quickTaskSchema.parse(values);

  const [task] = await db
    .insert(tasks)
    .values({
      userId: user.id,
      title: parsed.title,
      status: "todo",
      priority: "medium",
      dueDate: new Date().toISOString().slice(0, 10),
    })
    .returning();

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTask(id: string, values: TaskValues) {
  const user = await requireUser();
  const parsed = taskSchema.parse(values);

  const [task] = await db
    .update(tasks)
    .set({ ...buildTaskValues(user, parsed), updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  await db.delete(taskDependencies).where(eq(taskDependencies.taskId, id));
  if (parsed.dependsOn.length > 0) {
    await db.insert(taskDependencies).values(parsed.dependsOn.map((depId) => ({ taskId: id, dependsOnTaskId: depId })));
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (parsed.projectId) revalidatePath(`/projects/${parsed.projectId}`);
  return task;
}

export async function updateTaskNotes(id: string, description: string) {
  const user = await requireUser();
  const [task] = await db
    .update(tasks)
    .set({ description: description || null, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const user = await requireUser();
  const [task] = await db
    .update(tasks)
    .set({ status, completedAt: status === "done" ? new Date() : null, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function deleteTask(id: string) {
  const user = await requireUser();
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTasks(ids: string[]) {
  if (ids.length === 0) return;
  const user = await requireUser();
  await db.delete(tasks).where(and(inArray(tasks.id, ids), eq(tasks.userId, user.id)));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

// --- Subtasks (checklist) ---

export async function addSubtask(taskId: string, title: string) {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${subtasks.sortOrder}), -1)`.mapWith(Number) })
    .from(subtasks)
    .where(eq(subtasks.taskId, taskId));

  const [subtask] = await db.insert(subtasks).values({ taskId, title, sortOrder: max + 1 }).returning();
  revalidatePath("/tasks");
  return subtask;
}

export async function toggleSubtask(id: string, isDone: boolean) {
  await db.update(subtasks).set({ isDone }).where(eq(subtasks.id, id));
  revalidatePath("/tasks");
}

export async function deleteSubtask(id: string) {
  await db.delete(subtasks).where(eq(subtasks.id, id));
  revalidatePath("/tasks");
}
