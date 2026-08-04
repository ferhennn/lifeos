import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AgencyTasksView } from "@/features/agency/components/agency-tasks-view";
import { listAgencyTasks } from "@/features/agency/actions/agency-tasks.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";
import { listAgencyProjectOptions, listAgencyEpicOptions } from "@/features/agency/actions/agency-projects.actions";

export const metadata: Metadata = { title: "My Tasks — Agency — LifeOS" };

export default async function AgencyTasksPage() {
  const [tasks, goalOptions, projectOptions, epicOptions] = await Promise.all([
    listAgencyTasks(),
    listGoalOptions(),
    listAgencyProjectOptions(),
    listAgencyEpicOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="My Tasks" description="Everything assigned to you, with full context — never dig through Slack again." />
      <Suspense>
        <AgencyTasksView initialTasks={tasks} goalOptions={goalOptions} projectOptions={projectOptions} epicOptions={epicOptions} />
      </Suspense>
    </div>
  );
}
