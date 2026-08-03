"use server";

import { eq, and, gte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format, subDays } from "date-fns";
import { db } from "@/db";
import { linkedinEngagementLogs, type LinkedinEngagementLog } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { linkedinEngagementItems } from "../schema/engagement.schema";

export async function listRecentEngagementLogs(days = 30): Promise<LinkedinEngagementLog[]> {
  const user = await requireUser();
  const since = format(subDays(new Date(), days), "yyyy-MM-dd");
  return db
    .select()
    .from(linkedinEngagementLogs)
    .where(and(eq(linkedinEngagementLogs.userId, user.id), gte(linkedinEngagementLogs.date, since)))
    .orderBy(desc(linkedinEngagementLogs.date));
}

export async function getTodayEngagementLog(): Promise<LinkedinEngagementLog | null> {
  const user = await requireUser();
  const today = format(new Date(), "yyyy-MM-dd");
  const [row] = await db
    .select()
    .from(linkedinEngagementLogs)
    .where(and(eq(linkedinEngagementLogs.userId, user.id), eq(linkedinEngagementLogs.date, today)))
    .limit(1);
  return row ?? null;
}

type EngagementItem = (typeof linkedinEngagementItems)[number];

function itemPatch(item: EngagementItem, checked: boolean): Record<EngagementItem, boolean> {
  return Object.fromEntries(linkedinEngagementItems.map((key) => [key, key === item ? checked : false])) as Record<
    EngagementItem,
    boolean
  >;
}

export async function setEngagementItem(item: EngagementItem, checked: boolean, date?: string) {
  const user = await requireUser();
  const targetDate = date ?? format(new Date(), "yyyy-MM-dd");

  const [existing] = await db
    .select()
    .from(linkedinEngagementLogs)
    .where(and(eq(linkedinEngagementLogs.userId, user.id), eq(linkedinEngagementLogs.date, targetDate)))
    .limit(1);

  let row;
  if (existing) {
    const patch: Partial<Record<EngagementItem, boolean>> = { [item]: checked };
    [row] = await db
      .update(linkedinEngagementLogs)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(linkedinEngagementLogs.id, existing.id))
      .returning();
  } else {
    [row] = await db
      .insert(linkedinEngagementLogs)
      .values({ userId: user.id, date: targetDate, ...itemPatch(item, checked) })
      .returning();
  }

  revalidatePath("/linkedin/engagement");
  revalidatePath("/linkedin");
  return row;
}
