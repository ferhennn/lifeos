"use server";

import { format } from "date-fns";
import { requireUser } from "@/lib/require-user";
import { listAgencyTasks, type AgencyTaskWithMeta } from "./agency-tasks.actions";

function priorityWeight(p: string) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

const isActive = (t: AgencyTaskWithMeta) => t.status !== "completed" && t.status !== "archived";

export type AgencyDashboardData = {
  todayTasks: AgencyTaskWithMeta[];
  highPriorityCount: number;
  overdueCount: number;
  blockedCount: number;
  lastActiveTask: AgencyTaskWithMeta | null;
};

export async function getAgencyDashboardData(): Promise<AgencyDashboardData> {
  await requireUser();
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");

  const tasks = await listAgencyTasks();
  const activeTasks = tasks.filter(isActive);
  const dueToday = tasks
    .filter((t) => t.dueDate === todayStr)
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));

  const highPriorityCount = activeTasks.filter((t) => t.priority === "critical" || t.priority === "high").length;
  const overdueCount = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr).length;
  const blockedCount = activeTasks.filter((t) => t.status === "blocked").length;

  const lastActiveTask = [...activeTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null;

  return {
    todayTasks: dueToday,
    highPriorityCount,
    overdueCount,
    blockedCount,
    lastActiveTask,
  };
}
