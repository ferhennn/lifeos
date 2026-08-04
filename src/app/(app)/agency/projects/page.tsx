import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AgencyProjectsList } from "@/features/agency/components/agency-projects-list";
import { listAgencyProjects } from "@/features/agency/actions/agency-projects.actions";

export const metadata: Metadata = { title: "Projects — Agency — LifeOS" };

export default async function AgencyProjectsPage() {
  const projects = await listAgencyProjects();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Projects" description="Client engagements — health, progress, and everything tied to them." />
      <Suspense>
        <AgencyProjectsList initialProjects={projects} />
      </Suspense>
    </div>
  );
}
