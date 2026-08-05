import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { MeetingsView } from "@/features/agency/components/meetings/meetings-view";
import { listAgencyMeetings } from "@/features/agency/actions/agency-meetings.actions";
import { listAgencyProjectOptions } from "@/features/agency/actions/agency-projects.actions";

export const metadata: Metadata = { title: "Meetings — LifeOS" };

export default async function AgencyMeetingsPage() {
  const [meetings, projectOptions] = await Promise.all([listAgencyMeetings(), listAgencyProjectOptions()]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Meetings" description="Store every meeting — agenda, notes, decisions, and action items." />
      <Suspense>
        <MeetingsView meetings={meetings} projectOptions={projectOptions} />
      </Suspense>
    </div>
  );
}
