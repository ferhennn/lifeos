import { notFound } from "next/navigation";
import { getProject, listEpics, listProjectOptions, listAllEpicOptions } from "@/features/projects/actions/projects.actions";
import { listStrategyOptions } from "@/features/strategies/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";
import { listTasks } from "@/features/tasks/actions/tasks.actions";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { EpicsPanel } from "@/features/projects/components/epics-panel";
import { TasksView } from "@/features/tasks/components/tasks-view";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project, strategyOptions, goalOptions, projectOptions, epicOptions, tasks] = await Promise.all([
    getProject(projectId),
    listStrategyOptions(),
    listGoalOptions(),
    listProjectOptions(),
    listAllEpicOptions(),
    listTasks(),
  ]);
  if (!project) notFound();

  const epics = await listEpics(projectId);

  return (
    <div className="flex h-full flex-col">
      <ProjectDetail project={project} strategyOptions={strategyOptions} />

      <div className="space-y-4 border-t border-border px-6 py-6">
        <h2 className="text-sm font-semibold">Epics</h2>
        <EpicsPanel projectId={projectId} initialEpics={epics} />
      </div>

      <div className="flex-1 border-t border-border">
        <h2 className="px-6 pt-6 text-sm font-semibold">Tasks</h2>
        <TasksView
          initialTasks={tasks}
          goalOptions={goalOptions}
          strategyOptions={strategyOptions}
          projectOptions={projectOptions}
          epicOptions={epicOptions}
          filterProjectId={projectId}
        />
      </div>
    </div>
  );
}
