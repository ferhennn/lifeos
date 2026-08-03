import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/get-current-user";
import { getDashboardData } from "@/features/dashboard/actions/dashboard.actions";
import { GoodMorningHeader } from "@/features/dashboard/components/good-morning-header";
import { QuickCaptureFab } from "@/features/dashboard/components/quick-capture-fab";
import { TodayFocusCard } from "@/features/dashboard/components/today-focus-card";
import { TodayLinkedinCard } from "@/features/dashboard/components/today-linkedin-card";
import { TodayPriorityList } from "@/features/dashboard/components/today-priority-list";
import { TodaySchedule } from "@/features/dashboard/components/today-schedule";
import { UnscheduledTasksList } from "@/features/dashboard/components/unscheduled-tasks-list";
import { ProgressRingCard } from "@/features/dashboard/components/progress-ring-card";
import { WeeklyProgressChart } from "@/features/dashboard/components/weekly-progress-chart";
import { MonthlyGoalProgress } from "@/features/dashboard/components/monthly-goal-progress";
import { RecentActivityFeed } from "@/features/dashboard/components/recent-activity-feed";
import { UpcomingDeadlines } from "@/features/dashboard/components/upcoming-deadlines";
import { MotivationalQuote } from "@/features/dashboard/components/motivational-quote";

export const metadata: Metadata = { title: "Dashboard — LifeOS" };

export default async function DashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);

  return (
    <div className="space-y-6 p-6">
      <GoodMorningHeader name={user.fullName} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TodayFocusCard task={data.todayFocus} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TodaySchedule tasks={data.todaySchedule} />
            <TodayPriorityList tasks={data.todayPriority} />
          </div>
        </div>
        <div className="space-y-4">
          <ProgressRingCard completed={data.progressToday.completed} total={data.progressToday.total} />
          <MonthlyGoalProgress goals={data.monthlyGoalProgress} />
          <TodayLinkedinCard post={data.todayLinkedinPost} />
          <MotivationalQuote quote={data.quote} />
        </div>
      </div>

      <UnscheduledTasksList tasks={data.unscheduled} />

      <WeeklyProgressChart data={data.weeklyProgress} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivityFeed items={data.recentActivity} />
        <UpcomingDeadlines items={data.upcomingDeadlines} />
      </div>

      <QuickCaptureFab />
    </div>
  );
}
