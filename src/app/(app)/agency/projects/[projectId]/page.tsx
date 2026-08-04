import { notFound } from "next/navigation";
import { getAgencyProject, listAgencyEpics, listAgencyProjectOptions, listAgencyEpicOptions } from "@/features/agency/actions/agency-projects.actions";
import { listAgencyTasks } from "@/features/agency/actions/agency-tasks.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";
import { AgencyProjectDetail } from "@/features/agency/components/project-detail";
import { AgencyEpicsPanel } from "@/features/agency/components/epics-panel";
import { AgencyTasksView } from "@/features/agency/components/agency-tasks-view";

export default async function AgencyProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project, goalOptions, projectOptions, epicOptions, tasks] = await Promise.all([
    getAgencyProject(projectId),
    listGoalOptions(),
    listAgencyProjectOptions(),
    listAgencyEpicOptions(),
    listAgencyTasks(),
  ]);
  if (!project) notFound();

  const epics = await listAgencyEpics(projectId);

  return (
    <div className="flex h-full flex-col">
      <AgencyProjectDetail project={project} />

      <div className="space-y-4 border-t border-border px-6 py-6">
        <h2 className="text-sm font-semibold">Epics</h2>
        <AgencyEpicsPanel projectId={projectId} initialEpics={epics} />
      </div>

      <div className="flex-1 border-t border-border">
        <h2 className="px-6 pt-6 text-sm font-semibold">Tasks</h2>
        <AgencyTasksView
          initialTasks={tasks}
          goalOptions={goalOptions}
          projectOptions={projectOptions}
          epicOptions={epicOptions}
          filterProjectId={projectId}
        />
      </div>
    </div>
  );
}
