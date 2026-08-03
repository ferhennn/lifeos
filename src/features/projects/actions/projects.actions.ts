"use server";

import { eq, and, desc, asc, isNotNull, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects, strategies, goals, epics, tasks, type Project, type Epic } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { projectSchema, epicSchema, type ProjectValues, type EpicValues } from "../schema/project.schema";

export type ProjectWithMeta = Project & {
  strategyTitle: string;
  goalTitle: string;
  goalCoverColor: string;
  progress: number;
  totalTasks: number;
  epicCount: number;
};

async function attachMeta(
  rows: (Project & { strategyTitle: string; goalTitle: string; goalCoverColor: string })[],
): Promise<ProjectWithMeta[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);

  const taskCounts = await db
    .select({
      projectId: tasks.projectId,
      total: sql<number>`count(*)`.mapWith(Number),
      completed: sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(Number),
    })
    .from(tasks)
    .where(and(isNotNull(tasks.projectId), inArray(tasks.projectId, ids)))
    .groupBy(tasks.projectId);

  const epicCounts = await db
    .select({ projectId: epics.projectId, total: sql<number>`count(*)`.mapWith(Number) })
    .from(epics)
    .where(inArray(epics.projectId, ids))
    .groupBy(epics.projectId);

  const taskMap = new Map(taskCounts.map((t) => [t.projectId, t]));
  const epicMap = new Map(epicCounts.map((e) => [e.projectId, e.total]));

  return rows.map((p) => {
    const t = taskMap.get(p.id);
    const progress = t && t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
    return { ...p, progress, totalTasks: t?.total ?? 0, epicCount: epicMap.get(p.id) ?? 0 };
  });
}

const projectSelectShape = {
  id: projects.id,
  strategyId: projects.strategyId,
  userId: projects.userId,
  title: projects.title,
  description: projects.description,
  status: projects.status,
  deadline: projects.deadline,
  links: projects.links,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  strategyTitle: strategies.title,
  goalTitle: goals.title,
  goalCoverColor: goals.coverColor,
};

export async function listProjects(): Promise<ProjectWithMeta[]> {
  const user = await requireUser();
  const rows = await db
    .select(projectSelectShape)
    .from(projects)
    .innerJoin(strategies, eq(projects.strategyId, strategies.id))
    .innerJoin(goals, eq(strategies.goalId, goals.id))
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt));

  return attachMeta(rows);
}

export async function getProject(id: string): Promise<ProjectWithMeta | null> {
  const user = await requireUser();
  const [row] = await db
    .select(projectSelectShape)
    .from(projects)
    .innerJoin(strategies, eq(projects.strategyId, strategies.id))
    .innerJoin(goals, eq(strategies.goalId, goals.id))
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);

  if (!row) return null;
  const [withMeta] = await attachMeta([row]);
  return withMeta;
}

export async function createProject(values: ProjectValues) {
  const user = await requireUser();
  const parsed = projectSchema.parse(values);

  const [project] = await db
    .insert(projects)
    .values({
      strategyId: parsed.strategyId,
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      status: parsed.status,
      deadline: parsed.deadline || null,
      links: parsed.links,
    })
    .returning();

  revalidatePath("/projects");
  revalidatePath("/strategies");
  revalidatePath("/dashboard");
  return project;
}

export async function updateProject(id: string, values: ProjectValues) {
  const user = await requireUser();
  const parsed = projectSchema.parse(values);

  const [project] = await db
    .update(projects)
    .set({
      strategyId: parsed.strategyId,
      title: parsed.title,
      description: parsed.description || null,
      status: parsed.status,
      deadline: parsed.deadline || null,
      links: parsed.links,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .returning();

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
  return project;
}

export type ProjectOption = { id: string; title: string; strategyId: string };

/** Lightweight list for project-picker selects (tasks form). */
export async function listProjectOptions(): Promise<ProjectOption[]> {
  const user = await requireUser();
  return db
    .select({ id: projects.id, title: projects.title, strategyId: projects.strategyId })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt));
}

export type EpicOption = { id: string; title: string; projectId: string };

/** Lightweight list for epic-picker selects across all projects (tasks form). */
export async function listAllEpicOptions(): Promise<EpicOption[]> {
  const user = await requireUser();
  return db
    .select({ id: epics.id, title: epics.title, projectId: epics.projectId })
    .from(epics)
    .innerJoin(projects, eq(epics.projectId, projects.id))
    .where(eq(projects.userId, user.id))
    .orderBy(asc(epics.sortOrder));
}

export async function deleteProject(id: string) {
  const user = await requireUser();
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id)));
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

// --- Epics (lightweight, inline within a project) ---

async function assertProjectOwnership(projectId: string, userId: string) {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!row) throw new Error("Project not found");
}

export async function listEpics(projectId: string): Promise<Epic[]> {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  return db.select().from(epics).where(eq(epics.projectId, projectId)).orderBy(asc(epics.sortOrder), asc(epics.createdAt));
}

export async function createEpic(projectId: string, values: EpicValues) {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  const parsed = epicSchema.parse(values);

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${epics.sortOrder}), -1)`.mapWith(Number) })
    .from(epics)
    .where(eq(epics.projectId, projectId));

  const [epic] = await db.insert(epics).values({ projectId, title: parsed.title, sortOrder: max + 1 }).returning();
  revalidatePath(`/projects/${projectId}`);
  return epic;
}

export async function renameEpic(epicId: string, projectId: string, values: EpicValues) {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  const parsed = epicSchema.parse(values);
  const [epic] = await db.update(epics).set({ title: parsed.title }).where(eq(epics.id, epicId)).returning();
  revalidatePath(`/projects/${projectId}`);
  return epic;
}

export async function reorderEpic(epicId: string, projectId: string, direction: "up" | "down") {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);

  const rows = await db
    .select()
    .from(epics)
    .where(eq(epics.projectId, projectId))
    .orderBy(asc(epics.sortOrder), asc(epics.createdAt));

  const index = rows.findIndex((e) => e.id === epicId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= rows.length) return;

  const a = rows[index];
  const b = rows[swapWith];
  await db.update(epics).set({ sortOrder: b.sortOrder }).where(eq(epics.id, a.id));
  await db.update(epics).set({ sortOrder: a.sortOrder }).where(eq(epics.id, b.id));
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteEpic(epicId: string, projectId: string) {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  await db.delete(epics).where(eq(epics.id, epicId));
  revalidatePath(`/projects/${projectId}`);
}
