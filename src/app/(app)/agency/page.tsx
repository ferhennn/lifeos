import type { Metadata } from "next";
import { ListTodo, AlertTriangle, Flame, Ban } from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";
import { getAgencyDashboardData } from "@/features/agency/actions/agency-dashboard.actions";
import { AgencyGoodMorningHeader } from "@/features/agency/components/dashboard/good-morning-header";
import { StatCard } from "@/features/agency/components/dashboard/stat-card";
import { AgencyTaskSection } from "@/features/agency/components/dashboard/task-section";
import { AgencyQuickActions } from "@/features/agency/components/dashboard/quick-actions";

export const metadata: Metadata = { title: "Agency — LifeOS" };

export default async function AgencyDashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getAgencyDashboardData()]);

  return (
    <div className="space-y-6 p-6">
      <AgencyGoodMorningHeader name={user.fullName} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ListTodo} label="Today's Tasks" value={data.todayTasks.length} href="/agency/tasks" />
        <StatCard icon={Flame} label="High Priority" value={data.highPriorityCount} href="/agency/tasks" />
        <StatCard icon={AlertTriangle} label="Overdue" value={data.overdueCount} href="/agency/tasks" />
        <StatCard icon={Ban} label="Blocked" value={data.blockedCount} href="/agency/tasks" />
      </div>

      <AgencyQuickActions lastActiveTask={data.lastActiveTask} />

      <AgencyTaskSection icon={ListTodo} title="Today's Tasks" tasks={data.todayTasks} emptyLabel="Nothing due today." />
    </div>
  );
}
