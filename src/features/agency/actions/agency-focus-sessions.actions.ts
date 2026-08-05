"use server";

import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { agencyFocusSessions, agencyTimeLogs, agencyTasks, type AgencyFocusSession } from "@/db/schema";
import { requireUser } from "@/lib/require-user";

export type AgencyFocusSessionWithTask = AgencyFocusSession & { taskTitle: string | null };

function revalidateAll() {
  revalidatePath("/agency/focus");
  revalidatePath("/agency");
}

export async function listRecentFocusSessions(limit = 10): Promise<AgencyFocusSessionWithTask[]> {
  const user = await requireUser();
  const rows = await db
    .select({
      id: agencyFocusSessions.id,
      userId: agencyFocusSessions.userId,
      taskId: agencyFocusSessions.taskId,
      plannedMinutes: agencyFocusSessions.plannedMinutes,
      actualMinutes: agencyFocusSessions.actualMinutes,
      startedAt: agencyFocusSessions.startedAt,
      endedAt: agencyFocusSessions.endedAt,
      completed: agencyFocusSessions.completed,
      pomodoroCount: agencyFocusSessions.pomodoroCount,
      createdAt: agencyFocusSessions.createdAt,
      taskTitle: agencyTasks.title,
    })
    .from(agencyFocusSessions)
    .leftJoin(agencyTasks, eq(agencyFocusSessions.taskId, agencyTasks.id))
    .where(eq(agencyFocusSessions.userId, user.id))
    .orderBy(desc(agencyFocusSessions.startedAt))
    .limit(limit);
  return rows;
}

export async function getActiveFocusSession(): Promise<AgencyFocusSession | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(agencyFocusSessions)
    .where(and(eq(agencyFocusSessions.userId, user.id), isNull(agencyFocusSessions.endedAt)))
    .orderBy(desc(agencyFocusSessions.startedAt))
    .limit(1);
  return row ?? null;
}

export async function startFocusSession(values: { taskId: string | null; plannedMinutes: number }) {
  const user = await requireUser();
  const plannedMinutes = Math.max(1, Math.round(values.plannedMinutes));

  const [session] = await db
    .insert(agencyFocusSessions)
    .values({
      userId: user.id,
      taskId: values.taskId || null,
      plannedMinutes,
      startedAt: new Date(),
      completed: false,
      pomodoroCount: 1,
    })
    .returning();

  revalidateAll();
  return session;
}

export async function completeFocusSession(id: string, actualMinutes: number) {
  const user = await requireUser();
  const [existing] = await db
    .select()
    .from(agencyFocusSessions)
    .where(and(eq(agencyFocusSessions.id, id), eq(agencyFocusSessions.userId, user.id)))
    .limit(1);
  if (!existing) return null;

  const minutes = Math.max(0, Math.round(actualMinutes));

  const [session] = await db
    .update(agencyFocusSessions)
    .set({ endedAt: new Date(), actualMinutes: minutes, completed: minutes >= existing.plannedMinutes })
    .where(eq(agencyFocusSessions.id, id))
    .returning();

  if (existing.taskId && minutes > 0) {
    await db.insert(agencyTimeLogs).values({
      userId: user.id,
      taskId: existing.taskId,
      startedAt: existing.startedAt,
      endedAt: new Date(),
      durationMinutes: minutes,
      source: "timer",
      note: "Focus session",
    });
    await db
      .update(agencyTasks)
      .set({ actualTime: sql`greatest(coalesce(${agencyTasks.actualTime}, 0) + ${minutes}, 0)`, updatedAt: new Date() })
      .where(eq(agencyTasks.id, existing.taskId));
    revalidatePath("/agency/time-tracking");
  }

  revalidateAll();
  return session;
}
