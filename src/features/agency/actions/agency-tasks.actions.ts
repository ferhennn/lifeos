"use server";

import { eq, and, ne, desc, asc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  agencyTasks,
  agencyTaskChecklist,
  agencyTaskDependencies,
  agencyTaskComments,
  agencyProjects,
  agencyEpics,
  goals,
  type AgencyTask,
  type AgencyTaskChecklistItem,
  type AgencyTaskComment,
} from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import {
  agencyTaskSchema,
  quickAgencyTaskSchema,
  agencyTaskStatuses,
  type AgencyTaskValues,
  type QuickAgencyTaskValues,
} from "../schema/agency-task.schema";

type AgencyTaskStatus = (typeof agencyTaskStatuses)[number];

export type AgencyTaskWithMeta = AgencyTask & {
  agencyProjectTitle: string | null;
  agencyEpicTitle: string | null;
  goalTitle: string | null;
  checklistTotal: number;
  checklistDone: number;
  dependsOnCount: number;
  commentCount: number;
};

const agencyTaskSelectShape = {
  id: agencyTasks.id,
  userId: agencyTasks.userId,
  title: agencyTasks.title,
  description: agencyTasks.description,
  status: agencyTasks.status,
  priority: agencyTasks.priority,
  taskType: agencyTasks.taskType,
  dueDate: agencyTasks.dueDate,
  startDate: agencyTasks.startDate,
  completedDate: agencyTasks.completedDate,
  estimatedTime: agencyTasks.estimatedTime,
  actualTime: agencyTasks.actualTime,
  labels: agencyTasks.labels,
  sortOrder: agencyTasks.sortOrder,
  source: agencyTasks.source,
  sourceType: agencyTasks.sourceType,
  rawCapture: agencyTasks.rawCapture,
  clientName: agencyTasks.clientName,
  manager: agencyTasks.manager,
  assignee: agencyTasks.assignee,
  githubUrl: agencyTasks.githubUrl,
  prUrl: agencyTasks.prUrl,
  slackThreadUrl: agencyTasks.slackThreadUrl,
  figmaUrl: agencyTasks.figmaUrl,
  vercelPreviewUrl: agencyTasks.vercelPreviewUrl,
  productionUrl: agencyTasks.productionUrl,
  goalId: agencyTasks.goalId,
  agencyProjectId: agencyTasks.agencyProjectId,
  agencyEpicId: agencyTasks.agencyEpicId,
  meetingId: agencyTasks.meetingId,
  createdAt: agencyTasks.createdAt,
  updatedAt: agencyTasks.updatedAt,
  completedAt: agencyTasks.completedAt,
  agencyProjectTitle: agencyProjects.title,
  agencyEpicTitle: agencyEpics.title,
  goalTitle: goals.title,
};

async function attachCounts(rows: AgencyTask[]): Promise<AgencyTaskWithMeta[]> {
  const base = rows as unknown as (AgencyTask & {
    agencyProjectTitle: string | null;
    agencyEpicTitle: string | null;
    goalTitle: string | null;
  })[];
  if (base.length === 0) return [];
  const ids = base.map((t) => t.id);

  const [checklistCounts, depCounts, commentCounts] = await Promise.all([
    db
      .select({
        taskId: agencyTaskChecklist.taskId,
        total: sql<number>`count(*)`.mapWith(Number),
        done: sql<number>`count(*) filter (where ${agencyTaskChecklist.isDone} = true)`.mapWith(Number),
      })
      .from(agencyTaskChecklist)
      .where(inArray(agencyTaskChecklist.taskId, ids))
      .groupBy(agencyTaskChecklist.taskId),
    db
      .select({ taskId: agencyTaskDependencies.taskId, total: sql<number>`count(*)`.mapWith(Number) })
      .from(agencyTaskDependencies)
      .where(inArray(agencyTaskDependencies.taskId, ids))
      .groupBy(agencyTaskDependencies.taskId),
    db
      .select({ taskId: agencyTaskComments.taskId, total: sql<number>`count(*)`.mapWith(Number) })
      .from(agencyTaskComments)
      .where(inArray(agencyTaskComments.taskId, ids))
      .groupBy(agencyTaskComments.taskId),
  ]);

  const checklistMap = new Map(checklistCounts.map((c) => [c.taskId, c]));
  const depMap = new Map(depCounts.map((d) => [d.taskId, d.total]));
  const commentMap = new Map(commentCounts.map((c) => [c.taskId, c.total]));

  return base.map((t) => ({
    ...t,
    checklistTotal: checklistMap.get(t.id)?.total ?? 0,
    checklistDone: checklistMap.get(t.id)?.done ?? 0,
    dependsOnCount: depMap.get(t.id) ?? 0,
    commentCount: commentMap.get(t.id) ?? 0,
  }));
}

export async function listAgencyTasks(): Promise<AgencyTaskWithMeta[]> {
  const user = await requireUser();
  const rows = await db
    .select(agencyTaskSelectShape)
    .from(agencyTasks)
    .leftJoin(agencyProjects, eq(agencyTasks.agencyProjectId, agencyProjects.id))
    .leftJoin(agencyEpics, eq(agencyTasks.agencyEpicId, agencyEpics.id))
    .leftJoin(goals, eq(agencyTasks.goalId, goals.id))
    .where(eq(agencyTasks.userId, user.id))
    .orderBy(asc(agencyTasks.sortOrder), desc(agencyTasks.createdAt));

  return attachCounts(rows as unknown as AgencyTask[]);
}

export type AgencyTaskDetail = AgencyTaskWithMeta & {
  checklist: AgencyTaskChecklistItem[];
  comments: AgencyTaskComment[];
  dependsOn: { id: string; title: string; status: string }[];
};

export async function getAgencyTaskDetail(id: string): Promise<AgencyTaskDetail | null> {
  const user = await requireUser();
  const [row] = await db
    .select(agencyTaskSelectShape)
    .from(agencyTasks)
    .leftJoin(agencyProjects, eq(agencyTasks.agencyProjectId, agencyProjects.id))
    .leftJoin(agencyEpics, eq(agencyTasks.agencyEpicId, agencyEpics.id))
    .leftJoin(goals, eq(agencyTasks.goalId, goals.id))
    .where(and(eq(agencyTasks.id, id), eq(agencyTasks.userId, user.id)))
    .limit(1);

  if (!row) return null;

  const [checklistRows, commentRows, depRows, [withCounts]] = await Promise.all([
    db.select().from(agencyTaskChecklist).where(eq(agencyTaskChecklist.taskId, id)).orderBy(asc(agencyTaskChecklist.sortOrder)),
    db.select().from(agencyTaskComments).where(eq(agencyTaskComments.taskId, id)).orderBy(desc(agencyTaskComments.createdAt)),
    db
      .select({ id: agencyTasks.id, title: agencyTasks.title, status: agencyTasks.status })
      .from(agencyTaskDependencies)
      .innerJoin(agencyTasks, eq(agencyTaskDependencies.dependsOnTaskId, agencyTasks.id))
      .where(eq(agencyTaskDependencies.taskId, id)),
    attachCounts([row as unknown as AgencyTask]),
  ]);

  return { ...withCounts, checklist: checklistRows, comments: commentRows, dependsOn: depRows };
}

export type AgencyTaskOption = { id: string; title: string };

export async function listAgencyTaskOptions(excludeId?: string): Promise<AgencyTaskOption[]> {
  const user = await requireUser();
  const rows = await db
    .select({ id: agencyTasks.id, title: agencyTasks.title })
    .from(agencyTasks)
    .where(excludeId ? and(eq(agencyTasks.userId, user.id), ne(agencyTasks.id, excludeId)) : eq(agencyTasks.userId, user.id))
    .orderBy(desc(agencyTasks.createdAt))
    .limit(200);
  return rows;
}

function buildAgencyTaskValues(user: { id: string }, parsed: AgencyTaskValues) {
  return {
    userId: user.id,
    title: parsed.title,
    description: parsed.description || null,
    status: parsed.status,
    priority: parsed.priority,
    taskType: parsed.taskType,
    dueDate: parsed.dueDate || null,
    startDate: parsed.startDate || null,
    completedDate: parsed.completedDate || null,
    estimatedTime: parsed.estimatedTime ?? null,
    actualTime: parsed.actualTime ?? null,
    labels: parsed.labels,
    clientName: parsed.clientName || null,
    manager: parsed.manager || null,
    assignee: parsed.assignee || null,
    githubUrl: parsed.githubUrl || null,
    prUrl: parsed.prUrl || null,
    slackThreadUrl: parsed.slackThreadUrl || null,
    figmaUrl: parsed.figmaUrl || null,
    vercelPreviewUrl: parsed.vercelPreviewUrl || null,
    productionUrl: parsed.productionUrl || null,
    goalId: parsed.goalId || null,
    agencyProjectId: parsed.agencyProjectId || null,
    agencyEpicId: parsed.agencyEpicId || null,
    completedAt: parsed.status === "completed" ? new Date() : null,
  };
}

export async function createAgencyTask(values: AgencyTaskValues) {
  const user = await requireUser();
  const parsed = agencyTaskSchema.parse(values);

  const [task] = await db.insert(agencyTasks).values(buildAgencyTaskValues(user, parsed)).returning();

  if (parsed.dependsOn.length > 0) {
    await db.insert(agencyTaskDependencies).values(parsed.dependsOn.map((depId) => ({ taskId: task.id, dependsOnTaskId: depId })));
  }

  revalidatePath("/agency");
  revalidatePath("/agency/tasks");
  revalidatePath("/agency/kanban");
  revalidatePath("/agency/inbox");
  if (parsed.agencyProjectId) revalidatePath(`/agency/projects/${parsed.agencyProjectId}`);
  return task;
}

export async function quickCaptureAgencyTask(values: QuickAgencyTaskValues, sourceType: AgencyTask["sourceType"] = "other") {
  const user = await requireUser();
  const parsed = quickAgencyTaskSchema.parse(values);

  const [task] = await db
    .insert(agencyTasks)
    .values({
      userId: user.id,
      title: parsed.title,
      status: "inbox",
      priority: "medium",
      source: "inbox",
      sourceType,
      rawCapture: parsed.title,
    })
    .returning();

  revalidatePath("/agency");
  revalidatePath("/agency/inbox");
  return task;
}

export async function updateAgencyTask(id: string, values: AgencyTaskValues) {
  const user = await requireUser();
  const parsed = agencyTaskSchema.parse(values);

  const [task] = await db
    .update(agencyTasks)
    .set({ ...buildAgencyTaskValues(user, parsed), updatedAt: new Date() })
    .where(and(eq(agencyTasks.id, id), eq(agencyTasks.userId, user.id)))
    .returning();

  await db.delete(agencyTaskDependencies).where(eq(agencyTaskDependencies.taskId, id));
  if (parsed.dependsOn.length > 0) {
    await db.insert(agencyTaskDependencies).values(parsed.dependsOn.map((depId) => ({ taskId: id, dependsOnTaskId: depId })));
  }

  revalidatePath("/agency");
  revalidatePath("/agency/tasks");
  revalidatePath("/agency/kanban");
  if (parsed.agencyProjectId) revalidatePath(`/agency/projects/${parsed.agencyProjectId}`);
  return task;
}

export async function updateAgencyTaskStatus(id: string, status: AgencyTaskStatus) {
  const user = await requireUser();
  const [task] = await db
    .update(agencyTasks)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
      completedDate: status === "completed" ? new Date().toISOString().slice(0, 10) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(agencyTasks.id, id), eq(agencyTasks.userId, user.id)))
    .returning();

  revalidatePath("/agency");
  revalidatePath("/agency/tasks");
  revalidatePath("/agency/kanban");
  revalidatePath("/agency/inbox");
  return task;
}

export async function deleteAgencyTask(id: string) {
  const user = await requireUser();
  await db.delete(agencyTasks).where(and(eq(agencyTasks.id, id), eq(agencyTasks.userId, user.id)));
  revalidatePath("/agency");
  revalidatePath("/agency/tasks");
  revalidatePath("/agency/kanban");
  revalidatePath("/agency/inbox");
}

export async function deleteAgencyTasks(ids: string[]) {
  if (ids.length === 0) return;
  const user = await requireUser();
  await db.delete(agencyTasks).where(and(inArray(agencyTasks.id, ids), eq(agencyTasks.userId, user.id)));
  revalidatePath("/agency");
  revalidatePath("/agency/tasks");
  revalidatePath("/agency/kanban");
}

// --- Checklist ---

export async function addAgencyChecklistItem(taskId: string, title: string) {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${agencyTaskChecklist.sortOrder}), -1)`.mapWith(Number) })
    .from(agencyTaskChecklist)
    .where(eq(agencyTaskChecklist.taskId, taskId));

  const [item] = await db.insert(agencyTaskChecklist).values({ taskId, title, sortOrder: max + 1 }).returning();
  revalidatePath("/agency/tasks");
  return item;
}

export async function toggleAgencyChecklistItem(id: string, isDone: boolean) {
  await db.update(agencyTaskChecklist).set({ isDone }).where(eq(agencyTaskChecklist.id, id));
  revalidatePath("/agency/tasks");
}

export async function deleteAgencyChecklistItem(id: string) {
  await db.delete(agencyTaskChecklist).where(eq(agencyTaskChecklist.id, id));
  revalidatePath("/agency/tasks");
}

// --- Comments ---

export async function addAgencyTaskComment(taskId: string, body: string) {
  const user = await requireUser();
  const [comment] = await db.insert(agencyTaskComments).values({ taskId, userId: user.id, body }).returning();
  revalidatePath("/agency/tasks");
  return comment;
}

export async function deleteAgencyTaskComment(id: string) {
  const user = await requireUser();
  await db.delete(agencyTaskComments).where(and(eq(agencyTaskComments.id, id), eq(agencyTaskComments.userId, user.id)));
  revalidatePath("/agency/tasks");
}
