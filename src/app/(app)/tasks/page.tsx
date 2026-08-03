import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TasksView } from "@/features/tasks/components/tasks-view";
import { listTasks } from "@/features/tasks/actions/tasks.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";
import { listStrategyOptions } from "@/features/strategies/actions/strategies.actions";
import { listProjectOptions, listAllEpicOptions } from "@/features/projects/actions/projects.actions";

export const metadata: Metadata = { title: "Tasks — LifeOS" };

export default async function TasksPage() {
  const [tasks, goalOptions, strategyOptions, projectOptions, epicOptions] = await Promise.all([
    listTasks(),
    listGoalOptions(),
    listStrategyOptions(),
    listProjectOptions(),
    listAllEpicOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Tasks" description="Daily execution — every task traces back to a strategy." />
      <Suspense>
        <TasksView
          initialTasks={tasks}
          goalOptions={goalOptions}
          strategyOptions={strategyOptions}
          projectOptions={projectOptions}
          epicOptions={epicOptions}
        />
      </Suspense>
    </div>
  );
}
