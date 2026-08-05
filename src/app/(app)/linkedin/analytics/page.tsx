import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsView } from "@/features/linkedin/components/analytics/analytics-view";
import { RecordStatsDialog } from "@/features/linkedin/components/dashboard/record-stats-dialog";
import { getLinkedinAnalyticsData } from "@/features/linkedin/actions/analytics.actions";
import { getLatestProfileSnapshot } from "@/features/linkedin/actions/profile-snapshots.actions";

export const metadata: Metadata = { title: "LinkedIn Analytics — LifeOS" };

export default async function LinkedinAnalyticsPage() {
  const [data, latestSnapshot] = await Promise.all([getLinkedinAnalyticsData(), getLatestProfileSnapshot()]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Analytics" actions={<RecordStatsDialog latest={latestSnapshot} />} />
      <Suspense>
        <AnalyticsView data={data} />
      </Suspense>
    </div>
  );
}
