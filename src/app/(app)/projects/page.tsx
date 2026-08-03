import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectsList } from "@/features/projects/components/projects-list";
import { listProjects } from "@/features/projects/actions/projects.actions";
import { listStrategyOptions } from "@/features/strategies/actions/strategies.actions";

export const metadata: Metadata = { title: "Projects — LifeOS" };

export default async function ProjectsPage() {
  const [projects, strategyOptions] = await Promise.all([listProjects(), listStrategyOptions()]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Projects" description="Where a strategy's work gets organized into epics and tasks." />
      <Suspense>
        <ProjectsList initialProjects={projects} strategyOptions={strategyOptions} />
      </Suspense>
    </div>
  );
}
