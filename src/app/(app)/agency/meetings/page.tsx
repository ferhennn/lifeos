import type { Metadata } from "next";
import { Suspense } from "react";
import { Users, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MeetingsView } from "@/features/agency/components/meetings/meetings-view";
import { CalendarView } from "@/features/agency/components/calendar/calendar-view";
import { listAgencyMeetings } from "@/features/agency/actions/agency-meetings.actions";
import { listAgencyProjectOptions } from "@/features/agency/actions/agency-projects.actions";
import { getAgencyCalendarItems } from "@/features/agency/actions/agency-calendar.actions";

export const metadata: Metadata = { title: "Meetings — LifeOS" };

export default async function AgencyMeetingsPage() {
  const [meetings, projectOptions, calendarItems] = await Promise.all([
    listAgencyMeetings(),
    listAgencyProjectOptions(),
    getAgencyCalendarItems(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Meetings" description="Store every meeting — agenda, notes, decisions, and action items." />
      <Suspense>
        <Tabs defaultValue="meetings" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="meetings"><Users className="h-3.5 w-3.5" /> Meetings</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarDays className="h-3.5 w-3.5" /> Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="meetings" className="flex flex-1 flex-col overflow-y-auto">
            <MeetingsView meetings={meetings} projectOptions={projectOptions} />
          </TabsContent>
          <TabsContent value="calendar" className="flex flex-1 flex-col overflow-y-auto">
            <CalendarView items={calendarItems} />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
}
