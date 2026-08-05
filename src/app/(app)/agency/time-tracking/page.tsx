import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TimeTrackingView } from "@/features/agency/components/time-tracking/time-tracking-view";
import { listRecentTimeLogs, getTodayTimeLogMinutes } from "@/features/agency/actions/agency-time-logs.actions";
import { listAgencyTaskOptions } from "@/features/agency/actions/agency-tasks.actions";

export const metadata: Metadata = { title: "Time Tracking — LifeOS" };

export default async function AgencyTimeTrackingPage() {
  const [logs, taskOptions, todayMinutes] = await Promise.all([
    listRecentTimeLogs(),
    listAgencyTaskOptions(),
    getTodayTimeLogMinutes(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Time Tracking" description="Start a timer or log time manually against any task." />
      <Suspense>
        <TimeTrackingView logs={logs} taskOptions={taskOptions} todayMinutes={todayMinutes} />
      </Suspense>
    </div>
  );
}
