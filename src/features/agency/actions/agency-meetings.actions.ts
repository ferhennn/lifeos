"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { agencyMeetings, agencyProjects, agencyTasks, type AgencyMeeting, type AgencyMeetingActionItem } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { agencyMeetingSchema, participantsToArray, type AgencyMeetingValues } from "../schema/agency-meeting.schema";

export type AgencyMeetingWithProject = AgencyMeeting & { projectTitle: string | null };

function revalidateAll() {
  revalidatePath("/agency/meetings");
  revalidatePath("/agency/calendar");
  revalidatePath("/agency");
}

export async function listAgencyMeetings(): Promise<AgencyMeetingWithProject[]> {
  const user = await requireUser();
  return db
    .select({
      id: agencyMeetings.id,
      userId: agencyMeetings.userId,
      title: agencyMeetings.title,
      meetingDate: agencyMeetings.meetingDate,
      durationMinutes: agencyMeetings.durationMinutes,
      participants: agencyMeetings.participants,
      agenda: agencyMeetings.agenda,
      notes: agencyMeetings.notes,
      decisions: agencyMeetings.decisions,
      actionItems: agencyMeetings.actionItems,
      recordingUrl: agencyMeetings.recordingUrl,
      agencyProjectId: agencyMeetings.agencyProjectId,
      createdAt: agencyMeetings.createdAt,
      updatedAt: agencyMeetings.updatedAt,
      projectTitle: agencyProjects.title,
    })
    .from(agencyMeetings)
    .leftJoin(agencyProjects, eq(agencyMeetings.agencyProjectId, agencyProjects.id))
    .where(eq(agencyMeetings.userId, user.id))
    .orderBy(desc(agencyMeetings.meetingDate));
}

export type AgencyMeetingOption = { id: string; title: string };

export async function listAgencyMeetingOptions(): Promise<AgencyMeetingOption[]> {
  const user = await requireUser();
  return db
    .select({ id: agencyMeetings.id, title: agencyMeetings.title })
    .from(agencyMeetings)
    .where(eq(agencyMeetings.userId, user.id))
    .orderBy(desc(agencyMeetings.meetingDate));
}

function buildValues(parsed: AgencyMeetingValues) {
  return {
    title: parsed.title,
    meetingDate: parsed.meetingDate,
    durationMinutes: parsed.durationMinutes ?? null,
    participants: participantsToArray(parsed.participants),
    agenda: parsed.agenda || null,
    notes: parsed.notes || null,
    decisions: parsed.decisions || null,
    recordingUrl: parsed.recordingUrl || null,
    agencyProjectId: parsed.agencyProjectId || null,
  };
}

export async function createAgencyMeeting(values: AgencyMeetingValues) {
  const user = await requireUser();
  const parsed = agencyMeetingSchema.parse(values);

  const [meeting] = await db.insert(agencyMeetings).values({ userId: user.id, ...buildValues(parsed) }).returning();
  revalidateAll();
  return meeting;
}

export async function updateAgencyMeeting(id: string, values: AgencyMeetingValues) {
  const user = await requireUser();
  const parsed = agencyMeetingSchema.parse(values);

  const [meeting] = await db
    .update(agencyMeetings)
    .set({ ...buildValues(parsed), updatedAt: new Date() })
    .where(and(eq(agencyMeetings.id, id), eq(agencyMeetings.userId, user.id)))
    .returning();
  revalidateAll();
  return meeting;
}

export async function deleteAgencyMeeting(id: string) {
  const user = await requireUser();
  await db.delete(agencyMeetings).where(and(eq(agencyMeetings.id, id), eq(agencyMeetings.userId, user.id)));
  revalidateAll();
}

export async function rescheduleAgencyMeeting(id: string, meetingDate: string) {
  const user = await requireUser();
  const [meeting] = await db
    .update(agencyMeetings)
    .set({ meetingDate, updatedAt: new Date() })
    .where(and(eq(agencyMeetings.id, id), eq(agencyMeetings.userId, user.id)))
    .returning();
  revalidateAll();
  return meeting;
}

async function getOwnedMeeting(id: string, userId: string) {
  const [row] = await db.select().from(agencyMeetings).where(and(eq(agencyMeetings.id, id), eq(agencyMeetings.userId, userId))).limit(1);
  if (!row) throw new Error("Meeting not found");
  return row;
}

export async function addMeetingActionItem(meetingId: string, text: string) {
  const user = await requireUser();
  const meeting = await getOwnedMeeting(meetingId, user.id);

  const items: AgencyMeetingActionItem[] = [...(meeting.actionItems ?? []), { id: crypto.randomUUID(), text, done: false, taskId: null }];
  await db.update(agencyMeetings).set({ actionItems: items, updatedAt: new Date() }).where(eq(agencyMeetings.id, meetingId));
  revalidateAll();
  return items;
}

export async function toggleMeetingActionItem(meetingId: string, itemId: string, done: boolean) {
  const user = await requireUser();
  const meeting = await getOwnedMeeting(meetingId, user.id);

  const items = (meeting.actionItems ?? []).map((item) => (item.id === itemId ? { ...item, done } : item));
  await db.update(agencyMeetings).set({ actionItems: items, updatedAt: new Date() }).where(eq(agencyMeetings.id, meetingId));
  revalidateAll();
  return items;
}

export async function deleteMeetingActionItem(meetingId: string, itemId: string) {
  const user = await requireUser();
  const meeting = await getOwnedMeeting(meetingId, user.id);

  const items = (meeting.actionItems ?? []).filter((item) => item.id !== itemId);
  await db.update(agencyMeetings).set({ actionItems: items, updatedAt: new Date() }).where(eq(agencyMeetings.id, meetingId));
  revalidateAll();
  return items;
}

/** Creates a real task from a meeting action item and links it back via taskId. */
export async function convertMeetingActionItemToTask(meetingId: string, itemId: string) {
  const user = await requireUser();
  const meeting = await getOwnedMeeting(meetingId, user.id);

  const item = (meeting.actionItems ?? []).find((i) => i.id === itemId);
  if (!item) throw new Error("Action item not found");

  const [task] = await db
    .insert(agencyTasks)
    .values({ userId: user.id, title: item.text, status: "todo", source: "meeting_action_item", sourceType: "meeting_action_item" })
    .returning();

  const items = (meeting.actionItems ?? []).map((i) => (i.id === itemId ? { ...i, taskId: task.id } : i));
  await db.update(agencyMeetings).set({ actionItems: items, updatedAt: new Date() }).where(eq(agencyMeetings.id, meetingId));

  revalidateAll();
  revalidatePath("/agency/tasks");
  return task;
}
