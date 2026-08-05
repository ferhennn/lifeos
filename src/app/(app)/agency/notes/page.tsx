import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { NotesView } from "@/features/agency/components/notes/notes-view";
import { listAgencyNotes } from "@/features/agency/actions/agency-notes.actions";
import { listAgencyProjectOptions } from "@/features/agency/actions/agency-projects.actions";
import { listAgencyTaskOptions } from "@/features/agency/actions/agency-tasks.actions";
import { listAgencyMeetingOptions } from "@/features/agency/actions/agency-meetings.actions";

export const metadata: Metadata = { title: "Notes — LifeOS" };

export default async function AgencyNotesPage() {
  const [notes, projectOptions, taskOptions, meetingOptions] = await Promise.all([
    listAgencyNotes(),
    listAgencyProjectOptions(),
    listAgencyTaskOptions(),
    listAgencyMeetingOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Notes" description="Markdown notes linked to projects, tasks, and meetings." />
      <Suspense>
        <NotesView notes={notes} projectOptions={projectOptions} taskOptions={taskOptions} meetingOptions={meetingOptions} />
      </Suspense>
    </div>
  );
}
