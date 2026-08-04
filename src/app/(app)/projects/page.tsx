import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectsList } from "@/features/projects/components/projects-list";
import { listProjects } from "@/features/projects/actions/projects.actions";
import { listStrategyOptions } from "@/features/strategies/actions/strategies.actions";
import { listAgencyProjects } from "@/features/agency/actions/agency-projects.actions";

export const metadata: Metadata = { title: "Projects — LifeOS" };

export default async function ProjectsPage() {
  const [projects, strategyOptions, agencyProjects] = await Promise.all([
    listProjects(),
    listStrategyOptions(),
    listAgencyProjects(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Projects" description="Every project across LifeOS — strategy-driven and agency work alike." />
      <Suspense>
        <ProjectsList initialProjects={projects} strategyOptions={strategyOptions} initialAgencyProjects={agencyProjects} />
      </Suspense>
    </div>
  );
}
