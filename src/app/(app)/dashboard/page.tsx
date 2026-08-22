import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/get-current-user";
import { getDashboardData } from "@/features/dashboard/actions/dashboard.actions";
import { GoodMorningHeader } from "@/features/dashboard/components/good-morning-header";
import { QuickCaptureFab } from "@/features/dashboard/components/quick-capture-fab";
import { TodayCard } from "@/features/dashboard/components/today-card";
import { TodayLinkedinCard } from "@/features/dashboard/components/today-linkedin-card";
import { ProgressCard } from "@/features/dashboard/components/progress-card";
import { RecentActivityFeed } from "@/features/dashboard/components/recent-activity-feed";
import { UpcomingDeadlines } from "@/features/dashboard/components/upcoming-deadlines";

export const metadata: Metadata = { title: "Dashboard — LifeOS" };

export default async function DashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);

  return (
    <div className="space-y-6 p-6">
      <GoodMorningHeader name={user.fullName} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TodayCard focus={data.todayFocus} queue={data.todayQueue} unscheduled={data.unscheduled} />
          <TodayLinkedinCard post={data.todayLinkedinPost} />
        </div>
        <ProgressCard
          completed={data.progressToday.completed}
          total={data.progressToday.total}
          weeklyData={data.weeklyProgress}
          goals={data.monthlyGoalProgress}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivityFeed items={data.recentActivity} />
        <UpcomingDeadlines items={data.upcomingDeadlines} />
      </div>

      <QuickCaptureFab />
    </div>
  );
}
