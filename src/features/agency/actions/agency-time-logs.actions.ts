"use server";

import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { agencyTimeLogs, agencyTasks, type AgencyTimeLog } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { agencyManualTimeLogSchema, type AgencyManualTimeLogValues } from "../schema/agency-time-log.schema";

export type AgencyTimeLogWithTask = AgencyTimeLog & { taskTitle: string | null };

function revalidateAll() {
  revalidatePath("/agency/time-tracking");
  revalidatePath("/agency");
}

async function adjustActualTime(taskId: string, deltaMinutes: number) {
  await db
    .update(agencyTasks)
    .set({ actualTime: sql`greatest(coalesce(${agencyTasks.actualTime}, 0) + ${deltaMinutes}, 0)`, updatedAt: new Date() })
    .where(eq(agencyTasks.id, taskId));
}

export async function listRecentTimeLogs(days = 14): Promise<AgencyTimeLogWithTask[]> {
  const user = await requireUser();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      id: agencyTimeLogs.id,
      userId: agencyTimeLogs.userId,
      taskId: agencyTimeLogs.taskId,
      startedAt: agencyTimeLogs.startedAt,
      endedAt: agencyTimeLogs.endedAt,
      durationMinutes: agencyTimeLogs.durationMinutes,
      source: agencyTimeLogs.source,
      note: agencyTimeLogs.note,
      createdAt: agencyTimeLogs.createdAt,
      taskTitle: agencyTasks.title,
    })
    .from(agencyTimeLogs)
    .leftJoin(agencyTasks, eq(agencyTimeLogs.taskId, agencyTasks.id))
    .where(and(eq(agencyTimeLogs.userId, user.id), gte(agencyTimeLogs.startedAt, since)))
    .orderBy(desc(agencyTimeLogs.startedAt));

  return rows;
}

export async function getTodayTimeLogMinutes(): Promise<number> {
  const user = await requireUser();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const rows = await db
    .select({ durationMinutes: agencyTimeLogs.durationMinutes })
    .from(agencyTimeLogs)
    .where(and(eq(agencyTimeLogs.userId, user.id), gte(agencyTimeLogs.startedAt, dayStart), lte(agencyTimeLogs.startedAt, dayEnd)));

  return rows.reduce((sum, r) => sum + r.durationMinutes, 0);
}

export async function createTimeLog(values: AgencyManualTimeLogValues & { source: "timer" | "manual" }) {
  const user = await requireUser();
  const parsed = agencyManualTimeLogSchema.parse(values);

  const startedAt = new Date(parsed.startedAt);
  const endedAt = new Date(parsed.endedAt);
  const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));

  const [log] = await db
    .insert(agencyTimeLogs)
    .values({
      userId: user.id,
      taskId: parsed.taskId,
      startedAt,
      endedAt,
      durationMinutes,
      source: values.source,
      note: parsed.note || null,
    })
    .returning();

  await adjustActualTime(parsed.taskId, durationMinutes);
  revalidateAll();
  return log;
}

export async function deleteTimeLog(id: string) {
  const user = await requireUser();
  const [existing] = await db
    .select()
    .from(agencyTimeLogs)
    .where(and(eq(agencyTimeLogs.id, id), eq(agencyTimeLogs.userId, user.id)))
    .limit(1);
  if (!existing) return;

  await db.delete(agencyTimeLogs).where(eq(agencyTimeLogs.id, id));
  await adjustActualTime(existing.taskId, -existing.durationMinutes);
  revalidateAll();
}
