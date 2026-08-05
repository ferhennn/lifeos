import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/features/agency/components/calendar/calendar-view";
import { getAgencyCalendarItems } from "@/features/agency/actions/agency-calendar.actions";

export const metadata: Metadata = { title: "Calendar — LifeOS" };

export default async function AgencyCalendarPage() {
  const items = await getAgencyCalendarItems();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Calendar" description="Meetings and task due dates, drag to reschedule." />
      <Suspense>
        <CalendarView items={items} />
      </Suspense>
    </div>
  );
}
