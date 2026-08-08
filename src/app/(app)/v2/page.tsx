import type { Metadata } from "next";
import Link from "next/link";
import { format, formatDistanceToNow, parseISO, differenceInCalendarDays } from "date-fns";
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Circle,
  Compass,
  Flame,
  FolderKanban,
  History,
  ListTodo,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";
import { getDashboardData, type ActivityItem, type DeadlineItem, type ScheduleItem } from "@/features/dashboard/actions/dashboard.actions";
import type { TaskWithMeta } from "@/features/tasks/actions/tasks.actions";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/shared/progress-ring";
import { PriorityBadge } from "@/components/shared/status-badge";
import { WeeklyChart } from "./weekly-chart";

export const metadata: Metadata = { title: "Dashboard v2 — LifeOS" };

function getGreeting(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

const activityIcon = { task: ListTodo, goal: Target, strategy: Compass, project: FolderKanban };

export default async function DashboardV2Page() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);
  const now = new Date();

  const weekTotal = data.weeklyProgress.reduce((sum, d) => sum + d.completed, 0);
  const avgGoalProgress = data.monthlyGoalProgress.length
    ? Math.round(data.monthlyGoalProgress.reduce((sum, g) => sum + g.progress, 0) / data.monthlyGoalProgress.length)
    : 0;
  const todayPct = data.progressToday.total > 0 ? Math.round((data.progressToday.completed / data.progressToday.total) * 100) : 0;

  const kpis = [
    { label: "Today", value: `${data.progressToday.completed}/${data.progressToday.total}`, caption: "tasks done", icon: CheckCircle2 },
    { label: "This week", value: String(weekTotal), caption: "completed", icon: TrendingUp },
    { label: "Active goals", value: String(data.monthlyGoalProgress.length), caption: `${avgGoalProgress}% avg progress`, icon: Target },
    { label: "Deadlines", value: String(data.upcomingDeadlines.length), caption: "next 7 days", icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3" /> Dashboard v2
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            {getGreeting(now.getHours())}, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{format(now, "EEEE, MMMM d")}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <ProgressRing value={todayPct} size={44} strokeWidth={4} />
          <div className="text-sm">
            <p className="font-medium">{todayPct}% through today</p>
            <p className="text-xs text-muted-foreground">{data.progressToday.total > 0 ? `${data.progressToday.completed} of ${data.progressToday.total} due today` : "Nothing due today"}</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <kpi.icon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-xl font-semibold tabular-nums leading-none">{kpi.value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {kpi.label} · {kpi.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main bento row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TodayHero focus={data.todayFocus} schedule={data.todaySchedule} unscheduled={data.unscheduled} />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <TrendingUp className="size-4 text-primary" /> Weekly progress
              </span>
              <span className="text-xs text-muted-foreground">{weekTotal} completed</span>
            </div>
            <WeeklyChart data={data.weeklyProgress} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Target className="size-4 text-primary" /> Goal progress
              </span>
              <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground" render={<Link href="/goals" />}>
                All goals <ArrowUpRight className="size-3" />
              </Button>
            </div>
            {data.monthlyGoalProgress.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">No active goals yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {data.monthlyGoalProgress.map((g) => (
                  <li key={g.id}>
                    <Link href={`/goals/${g.id}`} className="block space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{g.title}</span>
                        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{g.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${g.progress}%`, backgroundColor: g.coverColor }}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ActivityFeed items={data.recentActivity} />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <DeadlinesCard items={data.upcomingDeadlines} />
          <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm italic text-muted-foreground">&ldquo;{data.quote}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TodayHero({
  focus,
  schedule,
  unscheduled,
}: {
  focus: TaskWithMeta | null;
  schedule: ScheduleItem[];
  unscheduled: TaskWithMeta[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary),transparent_85%),transparent)]"
        aria-hidden
      />

      <div className="relative flex items-center gap-1.5 text-xs font-medium text-primary">
        <Flame className="size-3.5" /> Today&apos;s focus
      </div>

      {focus ? (
        <div className="relative mt-2">
          <Link href={`/tasks?openTask=${focus.id}`} className="block">
            <h2 className="font-heading text-xl font-semibold leading-snug hover:underline">{focus.title}</h2>
          </Link>
          {(focus.goalTitle || focus.projectTitle) && (
            <p className="mt-1 text-xs text-muted-foreground">{focus.projectTitle ?? focus.strategyTitle ?? focus.goalTitle}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <PriorityBadge priority={focus.priority} />
            <Button size="sm" variant="outline" render={<Link href={`/tasks?openTask=${focus.id}`} />}>
              <CheckCircle2 className="size-3.5" /> Open task
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border p-4">
          <CheckCircle2 className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nothing urgent on your plate. Great time to plan ahead.</p>
        </div>
      )}

      <div className="relative mt-6 grid grid-cols-1 gap-6 border-t border-border pt-5 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Scheduled today</p>
          {schedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
          ) : (
            <ul className="space-y-2.5">
              {schedule.slice(0, 5).map((item) => (
                <li key={`${item.source}-${item.id}`}>
                  <Link href={item.href} className="flex items-center gap-2 text-sm hover:underline">
                    {item.done ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    ) : (
                      <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={item.done ? "truncate text-muted-foreground line-through" : "truncate"}>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Unscheduled</p>
          {unscheduled.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inbox zero. Nice.</p>
          ) : (
            <ul className="space-y-2.5">
              {unscheduled.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks?openTask=${task.id}`} className="flex items-center gap-2 text-sm hover:underline">
                    <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                    <span className="truncate">{task.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-1.5 text-sm font-medium">
        <History className="size-4 text-primary" /> Recent activity
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing yet — start creating.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = activityIcon[item.type];
            const ActionIcon = item.action === "completed" ? CheckCircle2 : Plus;
            return (
              <li key={`${item.type}-${item.id}-${item.action}`} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <ActionIcon className="mr-1 inline size-3 text-muted-foreground" />
                    {item.action === "completed" ? "Completed" : "Created"} <span className="font-medium">{item.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(item.at, { addSuffix: true })}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DeadlinesCard({ items }: { items: DeadlineItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-1.5 text-sm font-medium">
        <CalendarClock className="size-4 text-primary" /> Upcoming deadlines
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing due in the next 7 days.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const days = differenceInCalendarDays(parseISO(item.date), new Date());
            return (
              <li key={`${item.type}-${item.id}`}>
                <Link href={item.href} className="flex items-center justify-between gap-2 text-sm hover:underline">
                  <span className="truncate">{item.title}</span>
                  <span className={days <= 1 ? "shrink-0 text-xs font-medium text-destructive" : "shrink-0 text-xs text-muted-foreground"}>
                    {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : format(parseISO(item.date), "MMM d")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
