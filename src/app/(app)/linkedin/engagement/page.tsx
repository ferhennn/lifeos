import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EngagementView } from "@/features/linkedin/components/engagement/engagement-view";
import { getTodayEngagementLog, listRecentEngagementLogs } from "@/features/linkedin/actions/engagement.actions";

export const metadata: Metadata = { title: "Engagement — LifeOS" };

export default async function EngagementPage() {
  const [todayLog, recentLogs] = await Promise.all([getTodayEngagementLog(), listRecentEngagementLogs(30)]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Engagement" description="Show up in other people's feeds, not just your own." />
      <Suspense>
        <EngagementView todayLog={todayLog} recentLogs={recentLogs} />
      </Suspense>
    </div>
  );
}
