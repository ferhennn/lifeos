import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AgencyTasksView } from "@/features/agency/components/agency-tasks-view";
import { listAgencyTasks } from "@/features/agency/actions/agency-tasks.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";
import { listAgencyProjectOptions, listAgencyEpicOptions } from "@/features/agency/actions/agency-projects.actions";

export const metadata: Metadata = { title: "Kanban — Agency — LifeOS" };

export default async function AgencyKanbanPage() {
  const [tasks, goalOptions, projectOptions, epicOptions] = await Promise.all([
    listAgencyTasks(),
    listGoalOptions(),
    listAgencyProjectOptions(),
    listAgencyEpicOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Kanban" description="Drag work across the board as it moves." />
      <Suspense>
        <AgencyTasksView
          initialTasks={tasks}
          goalOptions={goalOptions}
          projectOptions={projectOptions}
          epicOptions={epicOptions}
          allowViewToggle={false}
          defaultView="board"
        />
      </Suspense>
    </div>
  );
}
