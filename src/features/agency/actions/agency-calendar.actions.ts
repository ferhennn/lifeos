"use server";

import { listAgencyTasks } from "./agency-tasks.actions";
import { listAgencyMeetings } from "./agency-meetings.actions";

export type CalendarItem =
  | { type: "task"; id: string; title: string; date: string; status: string; priority: string }
  | { type: "meeting"; id: string; title: string; date: string; durationMinutes: number | null };

export async function getAgencyCalendarItems(): Promise<CalendarItem[]> {
  const [tasks, meetings] = await Promise.all([listAgencyTasks(), listAgencyMeetings()]);

  const taskItems: CalendarItem[] = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({ type: "task", id: t.id, title: t.title, date: t.dueDate!, status: t.status, priority: t.priority }));

  const meetingItems: CalendarItem[] = meetings.map((m) => ({
    type: "meeting",
    id: m.id,
    title: m.title,
    date: m.meetingDate,
    durationMinutes: m.durationMinutes,
  }));

  return [...taskItems, ...meetingItems];
}
