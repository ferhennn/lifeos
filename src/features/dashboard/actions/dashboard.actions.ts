"use server";

import { format, subDays, addDays, getDayOfYear, parseISO, isWithinInterval } from "date-fns";
import { listTasks, type TaskWithMeta } from "@/features/tasks/actions/tasks.actions";
import { listGoals } from "@/features/goals/actions/goals.actions";
import { listStrategies } from "@/features/strategies/actions/strategies.actions";
import { listProjects } from "@/features/projects/actions/projects.actions";
import { getTodayLinkedinPost } from "@/features/linkedin/actions/posts.actions";
import { listAgencyTasks } from "@/features/agency/actions/agency-tasks.actions";
import type { LinkedinPost } from "@/db/schema";

function priorityWeight(p: string) {
  return { urgent: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

export type ActivityItem = {
  id: string;
  title: string;
  type: "task" | "goal" | "strategy" | "project";
  action: "created" | "completed";
  at: Date;
};

export type DeadlineItem = {
  id: string;
  title: string;
  type: "task" | "project" | "goal";
  date: string;
  href: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  priority: string;
  done: boolean;
  href: string;
  source: "task" | "agency";
};

export type DashboardData = {
  todayFocus: TaskWithMeta | null;
  todayLinkedinPost: LinkedinPost | null;
  todayPriority: TaskWithMeta[];
  todaySchedule: ScheduleItem[];
  unscheduled: TaskWithMeta[];
  progressToday: { completed: number; total: number };
  weeklyProgress: { date: string; label: string; completed: number }[];
  monthlyGoalProgress: { id: string; title: string; coverColor: string; progress: number }[];
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
  quote: string;
};

const QUOTES = [
  "Small daily improvements lead to staggering long-term results.",
  "Discipline is choosing what you want most over what you want now.",
  "The strategy is only as good as the tasks it produces today.",
  "Progress, not perfection.",
  "You don't rise to the level of your goals — you fall to the level of your systems.",
  "Every task you finish today is a vote for who you're becoming.",
  "Momentum is built one completed task at a time.",
  "Consistency compounds quietly, then all at once.",
  "Focus on the next right action, not the whole mountain.",
  "What gets scheduled gets done.",
];

export async function getDashboardData(): Promise<DashboardData> {
  const [tasks, goals, strategies, projects, todayLinkedinPost, agencyTasks] = await Promise.all([
    listTasks(),
    listGoals(),
    listStrategies(),
    listProjects(),
    getTodayLinkedinPost(),
    listAgencyTasks(),
  ]);

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const activeTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const dueToday = tasks.filter((t) => t.dueDate === todayStr);
  const overdue = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);

  const focusCandidates = [...overdue, ...dueToday.filter((t) => t.status !== "done")].sort(
    (a, b) => priorityWeight(a.priority) - priorityWeight(b.priority),
  );
  const todayFocus =
    focusCandidates[0] ??
    [...activeTasks].sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))[0] ??
    null;

  const todayPriority = [...overdue, ...dueToday.filter((t) => t.status !== "done")]
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 5);

  const agencyDueToday = agencyTasks.filter((t) => t.dueDate === todayStr);

  const todaySchedule: ScheduleItem[] = [
    ...dueToday.map(
      (t): ScheduleItem => ({ id: t.id, title: t.title, priority: t.priority, done: t.status === "done", href: `/tasks?openTask=${t.id}`, source: "task" }),
    ),
    ...agencyDueToday.map(
      (t): ScheduleItem => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        done: t.status === "completed",
        href: `/agency/tasks?openTask=${t.id}`,
        source: "agency",
      }),
    ),
  ].sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));

  const unscheduled = activeTasks
    .filter((t) => !t.dueDate)
    .sort(
      (a, b) =>
        priorityWeight(a.priority) - priorityWeight(b.priority) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const progressToday = {
    completed: dueToday.filter((t) => t.status === "done").length + agencyDueToday.filter((t) => t.status === "completed").length,
    total: dueToday.length + agencyDueToday.length,
  };

  const weeklyProgress = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(now, 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const completed = tasks.filter((t) => t.completedAt && format(new Date(t.completedAt), "yyyy-MM-dd") === dateStr).length;
    return { date: dateStr, label: format(date, "EEE"), completed };
  });

  const monthlyGoalProgress = goals
    .filter((g) => g.status === "active")
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 6)
    .map((g) => ({ id: g.id, title: g.title, coverColor: g.coverColor, progress: g.progress }));

  const recentActivity: ActivityItem[] = [
    ...tasks.map((t): ActivityItem =>
      t.completedAt
        ? { id: t.id, title: t.title, type: "task", action: "completed", at: new Date(t.completedAt) }
        : { id: t.id, title: t.title, type: "task", action: "created", at: new Date(t.createdAt) },
    ),
    ...goals.map((g): ActivityItem => ({ id: g.id, title: g.title, type: "goal", action: "created", at: new Date(g.createdAt) })),
    ...strategies.map((s): ActivityItem => ({ id: s.id, title: s.title, type: "strategy", action: "created", at: new Date(s.createdAt) })),
    ...projects.map((p): ActivityItem => ({ id: p.id, title: p.title, type: "project", action: "created", at: new Date(p.createdAt) })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const rangeEnd = addDays(now, 7);
  const upcomingDeadlines: DeadlineItem[] = [
    ...tasks
      .filter((t) => t.dueDate && t.status !== "done" && isWithinInterval(parseISO(t.dueDate), { start: now, end: rangeEnd }))
      .map((t): DeadlineItem => ({ id: t.id, title: t.title, type: "task", date: t.dueDate!, href: "/tasks" })),
    ...projects
      .filter((p) => p.deadline && p.status !== "completed" && isWithinInterval(parseISO(p.deadline), { start: now, end: rangeEnd }))
      .map((p): DeadlineItem => ({ id: p.id, title: p.title, type: "project", date: p.deadline!, href: `/projects/${p.id}` })),
    ...goals
      .filter((g) => g.targetDate && g.status === "active" && isWithinInterval(parseISO(g.targetDate), { start: now, end: rangeEnd }))
      .map((g): DeadlineItem => ({ id: g.id, title: g.title, type: "goal", date: g.targetDate!, href: `/goals/${g.id}` })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return {
    todayFocus,
    todayLinkedinPost,
    todayPriority,
    todaySchedule,
    unscheduled,
    progressToday,
    weeklyProgress,
    monthlyGoalProgress,
    recentActivity,
    upcomingDeadlines,
    quote: QUOTES[getDayOfYear(now) % QUOTES.length],
  };
}
