import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Timer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimeTrackingView } from "@/features/agency/components/time-tracking/time-tracking-view";
import { FocusView } from "@/features/agency/components/focus/focus-view";
import { listRecentTimeLogs, getTodayTimeLogMinutes } from "@/features/agency/actions/agency-time-logs.actions";
import { getActiveFocusSession, listRecentFocusSessions } from "@/features/agency/actions/agency-focus-sessions.actions";
import { listAgencyTaskOptions } from "@/features/agency/actions/agency-tasks.actions";

export const metadata: Metadata = { title: "Time Tracking — LifeOS" };

export default async function AgencyTimeTrackingPage() {
  const [logs, taskOptions, todayMinutes, activeFocusSession, recentFocusSessions] = await Promise.all([
    listRecentTimeLogs(),
    listAgencyTaskOptions(),
    getTodayTimeLogMinutes(),
    getActiveFocusSession(),
    listRecentFocusSessions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Time Tracking" description="Start a timer or log time manually against any task." />
      <Suspense>
        <Tabs defaultValue="timer" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="timer"><Clock className="h-3.5 w-3.5" /> Timer</TabsTrigger>
            <TabsTrigger value="focus"><Timer className="h-3.5 w-3.5" /> Focus Session</TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="flex flex-1 flex-col overflow-y-auto">
            <TimeTrackingView logs={logs} taskOptions={taskOptions} todayMinutes={todayMinutes} />
          </TabsContent>
          <TabsContent value="focus" className="flex flex-1 flex-col overflow-y-auto">
            <FocusView taskOptions={taskOptions} activeSession={activeFocusSession} recentSessions={recentFocusSessions} />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
}
