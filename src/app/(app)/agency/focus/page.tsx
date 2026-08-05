import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FocusView } from "@/features/agency/components/focus/focus-view";
import { getActiveFocusSession, listRecentFocusSessions } from "@/features/agency/actions/agency-focus-sessions.actions";
import { listAgencyTaskOptions } from "@/features/agency/actions/agency-tasks.actions";

export const metadata: Metadata = { title: "Focus Mode — LifeOS" };

export default async function AgencyFocusPage() {
  const [taskOptions, activeSession, recentSessions] = await Promise.all([
    listAgencyTaskOptions(),
    getActiveFocusSession(),
    listRecentFocusSessions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Focus Mode" description="A distraction-free timer for a single task." />
      <Suspense>
        <FocusView taskOptions={taskOptions} activeSession={activeSession} recentSessions={recentSessions} />
      </Suspense>
    </div>
  );
}
