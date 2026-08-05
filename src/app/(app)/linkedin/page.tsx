import type { Metadata } from "next";
import { Suspense } from "react";
import { LinkedinDashboard } from "@/features/linkedin/components/dashboard/linkedin-dashboard";
import { getLinkedinDashboardData } from "@/features/linkedin/actions/dashboard.actions";
import { getTodayEngagementLog } from "@/features/linkedin/actions/engagement.actions";
import { ensureDefaultPillars, listPillarOptions } from "@/features/linkedin/actions/pillars.actions";
import { listLinkedinStrategyOptions } from "@/features/linkedin/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "LinkedIn Dashboard — LifeOS" };

export default async function LinkedinDashboardPage() {
  await ensureDefaultPillars();
  const [data, engagementLog, pillarOptions, strategyOptions, goalOptions] = await Promise.all([
    getLinkedinDashboardData(),
    getTodayEngagementLog(),
    listPillarOptions(),
    listLinkedinStrategyOptions(),
    listGoalOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <Suspense>
        <LinkedinDashboard
          data={data}
          engagementLog={engagementLog}
          pillarOptions={pillarOptions}
          strategyOptions={strategyOptions}
          goalOptions={goalOptions}
        />
      </Suspense>
    </div>
  );
}
