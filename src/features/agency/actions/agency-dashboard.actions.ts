"use server";

import { eq, and, gte, lte } from "drizzle-orm";
import { format, subDays, addDays, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { db } from "@/db";
import { agencyMeetings, agencyTimeLogs } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { listAgencyTasks, type AgencyTaskWithMeta } from "./agency-tasks.actions";
import { listAgencyProjects, type AgencyProjectWithMeta } from "./agency-projects.actions";

function priorityWeight(p: string) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

const isActive = (t: AgencyTaskWithMeta) => t.status !== "completed" && t.status !== "archived";

export type AgencyActivityItem = {
  id: string;
  title: string;
  type: "task" | "project" | "meeting";
  action: "created" | "completed";
  at: Date;
};

export type AgencyDeadlineItem = {
  id: string;
  title: string;
  type: "task" | "project";
  date: string;
  href: string;
};

export type AgencyMeetingSummary = { id: string; title: string; meetingDate: string; durationMinutes: number | null };

export type AgencyDashboardData = {
  todayFocus: AgencyTaskWithMeta | null;
  todayTasks: AgencyTaskWithMeta[];
  highPriorityTasks: AgencyTaskWithMeta[];
  overdueTasks: AgencyTaskWithMeta[];
  blockedTasks: AgencyTaskWithMeta[];
  todaysMeetings: AgencyMeetingSummary[];
  progressToday: { completed: number; total: number };
  hoursWorkedToday: number;
  weeklyProgress: { date: string; label: string; completed: number }[];
  projectProgress: AgencyProjectWithMeta[];
  recentActivity: AgencyActivityItem[];
  upcomingDeadlines: AgencyDeadlineItem[];
  lastActiveTask: AgencyTaskWithMeta | null;
};

export async function getAgencyDashboardData(): Promise<AgencyDashboardData> {
  const user = await requireUser();
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const [tasks, projects, todaysMeetingRows, timeLogRows] = await Promise.all([
    listAgencyTasks(),
    listAgencyProjects(),
    db
      .select({ id: agencyMeetings.id, title: agencyMeetings.title, meetingDate: agencyMeetings.meetingDate, durationMinutes: agencyMeetings.durationMinutes })
      .from(agencyMeetings)
      .where(and(eq(agencyMeetings.userId, user.id), eq(agencyMeetings.meetingDate, todayStr))),
    db
      .select({ durationMinutes: agencyTimeLogs.durationMinutes })
      .from(agencyTimeLogs)
      .where(and(eq(agencyTimeLogs.userId, user.id), gte(agencyTimeLogs.startedAt, dayStart), lte(agencyTimeLogs.startedAt, dayEnd))),
  ]);

  const activeTasks = tasks.filter(isActive);
  const dueToday = tasks.filter((t) => t.dueDate === todayStr);
  const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
  const blockedTasks = activeTasks.filter((t) => t.status === "blocked");
  const highPriorityTasks = activeTasks
    .filter((t) => t.priority === "critical" || t.priority === "high")
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
    .slice(0, 6);

  const focusCandidates = [...overdueTasks, ...dueToday.filter((t) => isActive(t))].sort(
    (a, b) => priorityWeight(a.priority) - priorityWeight(b.priority),
  );
  const todayFocus = focusCandidates[0] ?? [...activeTasks].sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))[0] ?? null;

  const progressToday = {
    completed: dueToday.filter((t) => t.status === "completed").length,
    total: dueToday.length,
  };

  const hoursWorkedToday = Math.round(((timeLogRows.reduce((sum, r) => sum + r.durationMinutes, 0)) / 60) * 10) / 10;

  const weeklyProgress = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(now, 6 - i);
    const completed = tasks.filter((t) => t.completedAt && isSameDay(new Date(t.completedAt), date)).length;
    return { date: format(date, "yyyy-MM-dd"), label: format(date, "EEE"), completed };
  });

  const projectProgress = projects.filter((p) => p.status === "active").sort((a, b) => a.progress - b.progress).slice(0, 6);

  const recentActivity: AgencyActivityItem[] = [
    ...tasks.map((t): AgencyActivityItem =>
      t.completedAt
        ? { id: t.id, title: t.title, type: "task", action: "completed", at: new Date(t.completedAt) }
        : { id: t.id, title: t.title, type: "task", action: "created", at: new Date(t.createdAt) },
    ),
    ...projects.map((p): AgencyActivityItem => ({ id: p.id, title: p.title, type: "project", action: "created", at: new Date(p.createdAt) })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const rangeEnd = addDays(now, 7);
  const upcomingDeadlines: AgencyDeadlineItem[] = [
    ...tasks
      .filter((t) => t.dueDate && isActive(t) && isWithinInterval(parseISO(t.dueDate), { start: dayStart, end: rangeEnd }))
      .map((t): AgencyDeadlineItem => ({ id: t.id, title: t.title, type: "task", date: t.dueDate!, href: "/agency/tasks" })),
    ...projects
      .filter((p) => p.deadline && p.status !== "completed" && isWithinInterval(parseISO(p.deadline), { start: dayStart, end: rangeEnd }))
      .map((p): AgencyDeadlineItem => ({ id: p.id, title: p.title, type: "project", date: p.deadline!, href: `/agency/projects/${p.id}` })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const lastActiveTask = [...activeTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null;

  return {
    todayFocus,
    todayTasks: dueToday,
    highPriorityTasks,
    overdueTasks,
    blockedTasks,
    todaysMeetings: todaysMeetingRows,
    progressToday,
    hoursWorkedToday,
    weeklyProgress,
    projectProgress,
    recentActivity,
    upcomingDeadlines,
    lastActiveTask,
  };
}
