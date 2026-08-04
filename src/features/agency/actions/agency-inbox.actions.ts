"use server";

import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { agencyTasks, agencyMeetings, agencyNotes, agencyProjects, type AgencyTask } from "@/db/schema";
import { requireUser } from "@/lib/require-user";

export type InboxItem = Pick<AgencyTask, "id" | "title" | "rawCapture" | "sourceType" | "createdAt">;

export async function listInboxTasks(): Promise<InboxItem[]> {
  const user = await requireUser();
  return db
    .select({
      id: agencyTasks.id,
      title: agencyTasks.title,
      rawCapture: agencyTasks.rawCapture,
      sourceType: agencyTasks.sourceType,
      createdAt: agencyTasks.createdAt,
    })
    .from(agencyTasks)
    .where(and(eq(agencyTasks.userId, user.id), eq(agencyTasks.status, "inbox")))
    .orderBy(asc(agencyTasks.createdAt));
}

async function getOwnedInboxTask(id: string, userId: string) {
  const [row] = await db.select().from(agencyTasks).where(and(eq(agencyTasks.id, id), eq(agencyTasks.userId, userId))).limit(1);
  if (!row) throw new Error("Inbox item not found");
  return row;
}

export async function convertInboxToMeeting(id: string) {
  const user = await requireUser();
  const item = await getOwnedInboxTask(id, user.id);

  const [meeting] = await db
    .insert(agencyMeetings)
    .values({
      userId: user.id,
      title: item.title,
      meetingDate: new Date().toISOString().slice(0, 10),
      notes: item.rawCapture ?? item.description ?? null,
    })
    .returning();

  await db.delete(agencyTasks).where(eq(agencyTasks.id, id));
  revalidatePath("/agency/inbox");
  revalidatePath("/agency/meetings");
  return meeting;
}

export async function convertInboxToNote(id: string) {
  const user = await requireUser();
  const item = await getOwnedInboxTask(id, user.id);

  const [note] = await db
    .insert(agencyNotes)
    .values({
      userId: user.id,
      title: item.title,
      contentMarkdown: item.rawCapture ?? item.description ?? "",
    })
    .returning();

  await db.delete(agencyTasks).where(eq(agencyTasks.id, id));
  revalidatePath("/agency/inbox");
  revalidatePath("/agency/notes");
  return note;
}

export async function convertInboxToProject(id: string) {
  const user = await requireUser();
  const item = await getOwnedInboxTask(id, user.id);

  const [project] = await db
    .insert(agencyProjects)
    .values({
      userId: user.id,
      title: item.title,
      description: item.rawCapture ?? item.description ?? null,
      status: "planning",
      health: "on_track",
      techStack: [],
      links: [],
    })
    .returning();

  await db.delete(agencyTasks).where(eq(agencyTasks.id, id));
  revalidatePath("/agency/inbox");
  revalidatePath("/agency/projects");
  return project;
}
