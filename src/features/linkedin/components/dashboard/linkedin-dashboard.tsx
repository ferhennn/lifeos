import { Hero } from "./hero";
import { TodayActions } from "./today-actions";
import { WeeklyProgress } from "./weekly-progress";
import { QuickStats } from "./quick-stats";
import { CoachCard } from "./coach-card";
import { RecentPosts } from "./recent-posts";
import { GoalProgressCard } from "./goal-progress-card";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";
import type { LinkedinEngagementLog } from "@/db/schema";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function LinkedinDashboard({
  data,
  engagementLog,
  pillarOptions,
  strategyOptions,
  goalOptions,
}: {
  data: LinkedinDashboardData;
  engagementLog: LinkedinEngagementLog | null;
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <Hero data={data} />
      <TodayActions data={data} engagementLog={engagementLog} />
      <WeeklyProgress data={data} />
      <QuickStats data={data} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CoachCard data={data} />
        </div>
        <div className="lg:col-span-2">
          <RecentPosts
            posts={data.recentPosts}
            pillarOptions={pillarOptions}
            strategyOptions={strategyOptions}
            goalOptions={goalOptions}
          />
        </div>
      </div>

      <GoalProgressCard data={data} />
    </div>
  );
}
