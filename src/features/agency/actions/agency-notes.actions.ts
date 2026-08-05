"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { agencyNotes, agencyProjects, agencyTasks, agencyMeetings, type AgencyNote } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { agencyNoteSchema, type AgencyNoteValues } from "../schema/agency-note.schema";

export type AgencyNoteWithLinks = AgencyNote & {
  projectTitle: string | null;
  taskTitle: string | null;
  meetingTitle: string | null;
};

function revalidateAll() {
  revalidatePath("/agency/notes");
  revalidatePath("/agency");
}

export async function listAgencyNotes(): Promise<AgencyNoteWithLinks[]> {
  const user = await requireUser();
  return db
    .select({
      id: agencyNotes.id,
      userId: agencyNotes.userId,
      title: agencyNotes.title,
      contentMarkdown: agencyNotes.contentMarkdown,
      agencyProjectId: agencyNotes.agencyProjectId,
      agencyTaskId: agencyNotes.agencyTaskId,
      meetingId: agencyNotes.meetingId,
      createdAt: agencyNotes.createdAt,
      updatedAt: agencyNotes.updatedAt,
      projectTitle: agencyProjects.title,
      taskTitle: agencyTasks.title,
      meetingTitle: agencyMeetings.title,
    })
    .from(agencyNotes)
    .leftJoin(agencyProjects, eq(agencyNotes.agencyProjectId, agencyProjects.id))
    .leftJoin(agencyTasks, eq(agencyNotes.agencyTaskId, agencyTasks.id))
    .leftJoin(agencyMeetings, eq(agencyNotes.meetingId, agencyMeetings.id))
    .where(eq(agencyNotes.userId, user.id))
    .orderBy(desc(agencyNotes.updatedAt));
}

function buildValues(parsed: AgencyNoteValues) {
  return {
    title: parsed.title,
    contentMarkdown: parsed.contentMarkdown || "",
    agencyProjectId: parsed.agencyProjectId || null,
    agencyTaskId: parsed.agencyTaskId || null,
    meetingId: parsed.meetingId || null,
  };
}

export async function createAgencyNote(values: AgencyNoteValues) {
  const user = await requireUser();
  const parsed = agencyNoteSchema.parse(values);

  const [note] = await db.insert(agencyNotes).values({ userId: user.id, ...buildValues(parsed) }).returning();
  revalidateAll();
  return note;
}

export async function updateAgencyNote(id: string, values: AgencyNoteValues) {
  const user = await requireUser();
  const parsed = agencyNoteSchema.parse(values);

  const [note] = await db
    .update(agencyNotes)
    .set({ ...buildValues(parsed), updatedAt: new Date() })
    .where(and(eq(agencyNotes.id, id), eq(agencyNotes.userId, user.id)))
    .returning();
  revalidateAll();
  return note;
}

export async function deleteAgencyNote(id: string) {
  const user = await requireUser();
  await db.delete(agencyNotes).where(and(eq(agencyNotes.id, id), eq(agencyNotes.userId, user.id)));
  revalidateAll();
}
