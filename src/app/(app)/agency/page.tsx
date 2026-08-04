import type { Metadata } from "next";
import { ListTodo, AlertTriangle, Flame, Ban, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";
import { getAgencyDashboardData } from "@/features/agency/actions/agency-dashboard.actions";
import { AgencyGoodMorningHeader } from "@/features/agency/components/dashboard/good-morning-header";
import { StatCard } from "@/features/agency/components/dashboard/stat-card";
import { AgencyProgressRingCard } from "@/features/agency/components/dashboard/progress-ring-card";
import { AgencyTaskSection } from "@/features/agency/components/dashboard/task-section";
import { AgencyMeetingsToday } from "@/features/agency/components/dashboard/meetings-today";
import { AgencyQuickActions } from "@/features/agency/components/dashboard/quick-actions";
import { AgencyWeeklyProgressChart } from "@/features/agency/components/dashboard/weekly-progress-chart";
import { AgencyProjectProgress } from "@/features/agency/components/dashboard/project-progress";
import { AgencyRecentActivityFeed } from "@/features/agency/components/dashboard/recent-activity-feed";
import { AgencyUpcomingDeadlines } from "@/features/agency/components/dashboard/upcoming-deadlines";

export const metadata: Metadata = { title: "Agency — LifeOS" };

export default async function AgencyDashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getAgencyDashboardData()]);

  return (
    <div className="space-y-6 p-6">
      <AgencyGoodMorningHeader name={user.fullName} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ListTodo} label="Today's Tasks" value={data.todayTasks.length} href="/agency/tasks" />
        <StatCard icon={Flame} label="High Priority" value={data.highPriorityTasks.length} href="/agency/tasks" />
        <StatCard icon={AlertTriangle} label="Overdue" value={data.overdueTasks.length} href="/agency/tasks" />
        <StatCard icon={Ban} label="Blocked" value={data.blockedTasks.length} href="/agency/tasks" />
      </div>

      <AgencyQuickActions lastActiveTask={data.lastActiveTask} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AgencyTaskSection icon={ListTodo} title="Today's Tasks" tasks={data.todayTasks} emptyLabel="Nothing due today." />
          <AgencyTaskSection icon={Flame} title="High Priority" tasks={data.highPriorityTasks} emptyLabel="Nothing urgent — you're clear." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AgencyTaskSection icon={AlertTriangle} title="Overdue" tasks={data.overdueTasks} emptyLabel="Nothing overdue." />
            <AgencyTaskSection icon={Ban} title="Blocked" tasks={data.blockedTasks} emptyLabel="Nothing blocked." />
          </div>
        </div>
        <div className="space-y-4">
          <AgencyProgressRingCard completed={data.progressToday.completed} total={data.progressToday.total} />
          <StatCard icon={Clock} label="Hours Worked Today" value={data.hoursWorkedToday} sub="Across all timed tasks" />
          <AgencyMeetingsToday meetings={data.todaysMeetings} />
        </div>
      </div>

      <AgencyWeeklyProgressChart data={data.weeklyProgress} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AgencyProjectProgress projects={data.projectProgress} />
        <AgencyRecentActivityFeed items={data.recentActivity} />
        <AgencyUpcomingDeadlines items={data.upcomingDeadlines} />
      </div>
    </div>
  );
}
