"use server";

import { eq, and, inArray, sql, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { agencyProjects, agencyEpics, agencyTasks, agencyTimeLogs, type AgencyProject, type AgencyEpic } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { agencyProjectSchema, agencyEpicSchema, type AgencyProjectValues, type AgencyEpicValues } from "../schema/agency-project.schema";

export type AgencyProjectWithMeta = AgencyProject & {
  progress: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  openBugs: number;
  blockedTasks: number;
  hoursWorked: number;
};

async function attachMeta(rows: AgencyProject[]): Promise<AgencyProjectWithMeta[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);

  const [taskCounts, timeTotals] = await Promise.all([
    db
      .select({
        projectId: agencyTasks.agencyProjectId,
        total: sql<number>`count(*)`.mapWith(Number),
        completed: sql<number>`count(*) filter (where ${agencyTasks.status} = 'completed')`.mapWith(Number),
        openBugs: sql<number>`count(*) filter (where ${agencyTasks.taskType} = 'bug' and ${agencyTasks.status} not in ('completed', 'archived'))`.mapWith(Number),
        blocked: sql<number>`count(*) filter (where ${agencyTasks.status} = 'blocked')`.mapWith(Number),
      })
      .from(agencyTasks)
      .where(inArray(agencyTasks.agencyProjectId, ids))
      .groupBy(agencyTasks.agencyProjectId),
    db
      .select({
        projectId: agencyTasks.agencyProjectId,
        minutes: sql<number>`coalesce(sum(${agencyTimeLogs.durationMinutes}), 0)`.mapWith(Number),
      })
      .from(agencyTimeLogs)
      .innerJoin(agencyTasks, eq(agencyTimeLogs.taskId, agencyTasks.id))
      .where(inArray(agencyTasks.agencyProjectId, ids))
      .groupBy(agencyTasks.agencyProjectId),
  ]);

  const taskMap = new Map(taskCounts.map((t) => [t.projectId, t]));
  const timeMap = new Map(timeTotals.map((t) => [t.projectId, t.minutes]));

  return rows.map((p) => {
    const t = taskMap.get(p.id);
    const total = t?.total ?? 0;
    const completed = t?.completed ?? 0;
    return {
      ...p,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalTasks: total,
      completedTasks: completed,
      remainingTasks: total - completed,
      openBugs: t?.openBugs ?? 0,
      blockedTasks: t?.blocked ?? 0,
      hoursWorked: Math.round(((timeMap.get(p.id) ?? 0) / 60) * 10) / 10,
    };
  });
}

export async function listAgencyProjects(): Promise<AgencyProjectWithMeta[]> {
  const user = await requireUser();
  const rows = await db.select().from(agencyProjects).where(eq(agencyProjects.userId, user.id)).orderBy(desc(agencyProjects.createdAt));
  return attachMeta(rows);
}

export async function getAgencyProject(id: string): Promise<AgencyProjectWithMeta | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(agencyProjects)
    .where(and(eq(agencyProjects.id, id), eq(agencyProjects.userId, user.id)))
    .limit(1);
  if (!row) return null;
  const [withMeta] = await attachMeta([row]);
  return withMeta;
}

export async function createAgencyProject(values: AgencyProjectValues) {
  const user = await requireUser();
  const parsed = agencyProjectSchema.parse(values);

  const [project] = await db
    .insert(agencyProjects)
    .values({
      userId: user.id,
      title: parsed.title,
      description: parsed.description || null,
      client: parsed.client || null,
      status: parsed.status,
      health: parsed.health,
      deadline: parsed.deadline || null,
      githubRepo: parsed.githubRepo || null,
      techStack: parsed.techStack,
      links: parsed.links,
    })
    .returning();

  revalidatePath("/agency/projects");
  revalidatePath("/agency");
  return project;
}

export async function updateAgencyProject(id: string, values: AgencyProjectValues) {
  const user = await requireUser();
  const parsed = agencyProjectSchema.parse(values);

  const [project] = await db
    .update(agencyProjects)
    .set({
      title: parsed.title,
      description: parsed.description || null,
      client: parsed.client || null,
      status: parsed.status,
      health: parsed.health,
      deadline: parsed.deadline || null,
      githubRepo: parsed.githubRepo || null,
      techStack: parsed.techStack,
      links: parsed.links,
      updatedAt: new Date(),
    })
    .where(and(eq(agencyProjects.id, id), eq(agencyProjects.userId, user.id)))
    .returning();

  revalidatePath("/agency/projects");
  revalidatePath(`/agency/projects/${id}`);
  revalidatePath("/agency");
  return project;
}

export async function deleteAgencyProject(id: string) {
  const user = await requireUser();
  await db.delete(agencyProjects).where(and(eq(agencyProjects.id, id), eq(agencyProjects.userId, user.id)));
  revalidatePath("/agency/projects");
  revalidatePath("/agency");
}

export type AgencyProjectOption = { id: string; title: string };

export async function listAgencyProjectOptions(): Promise<AgencyProjectOption[]> {
  const user = await requireUser();
  return db
    .select({ id: agencyProjects.id, title: agencyProjects.title })
    .from(agencyProjects)
    .where(eq(agencyProjects.userId, user.id))
    .orderBy(desc(agencyProjects.createdAt));
}

export type AgencyEpicOption = { id: string; title: string; projectId: string };

export async function listAgencyEpicOptions(): Promise<AgencyEpicOption[]> {
  const user = await requireUser();
  return db
    .select({ id: agencyEpics.id, title: agencyEpics.title, projectId: agencyEpics.agencyProjectId })
    .from(agencyEpics)
    .innerJoin(agencyProjects, eq(agencyEpics.agencyProjectId, agencyProjects.id))
    .where(eq(agencyProjects.userId, user.id))
    .orderBy(asc(agencyEpics.sortOrder));
}

// --- Epics (lightweight, inline within a project) ---

async function assertProjectOwnership(projectId: string, userId: string) {
  const [row] = await db
    .select({ id: agencyProjects.id })
    .from(agencyProjects)
    .where(and(eq(agencyProjects.id, projectId), eq(agencyProjects.userId, userId)))
    .limit(1);
  if (!row) throw new Error("Project not found");
}

export async function listAgencyEpics(projectId: string): Promise<AgencyEpic[]> {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  return db.select().from(agencyEpics).where(eq(agencyEpics.agencyProjectId, projectId)).orderBy(asc(agencyEpics.sortOrder), asc(agencyEpics.createdAt));
}

export async function createAgencyEpic(projectId: string, values: AgencyEpicValues) {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  const parsed = agencyEpicSchema.parse(values);

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${agencyEpics.sortOrder}), -1)`.mapWith(Number) })
    .from(agencyEpics)
    .where(eq(agencyEpics.agencyProjectId, projectId));

  const [epic] = await db.insert(agencyEpics).values({ agencyProjectId: projectId, title: parsed.title, sortOrder: max + 1 }).returning();
  revalidatePath(`/agency/projects/${projectId}`);
  return epic;
}

export async function renameAgencyEpic(epicId: string, projectId: string, values: AgencyEpicValues) {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  const parsed = agencyEpicSchema.parse(values);
  const [epic] = await db.update(agencyEpics).set({ title: parsed.title }).where(eq(agencyEpics.id, epicId)).returning();
  revalidatePath(`/agency/projects/${projectId}`);
  return epic;
}

export async function reorderAgencyEpic(epicId: string, projectId: string, direction: "up" | "down") {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);

  const rows = await db.select().from(agencyEpics).where(eq(agencyEpics.agencyProjectId, projectId)).orderBy(asc(agencyEpics.sortOrder), asc(agencyEpics.createdAt));

  const index = rows.findIndex((e) => e.id === epicId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= rows.length) return;

  const a = rows[index];
  const b = rows[swapWith];
  await db.update(agencyEpics).set({ sortOrder: b.sortOrder }).where(eq(agencyEpics.id, a.id));
  await db.update(agencyEpics).set({ sortOrder: a.sortOrder }).where(eq(agencyEpics.id, b.id));
  revalidatePath(`/agency/projects/${projectId}`);
}

export async function deleteAgencyEpic(epicId: string, projectId: string) {
  const user = await requireUser();
  await assertProjectOwnership(projectId, user.id);
  await db.delete(agencyEpics).where(eq(agencyEpics.id, epicId));
  revalidatePath(`/agency/projects/${projectId}`);
}
