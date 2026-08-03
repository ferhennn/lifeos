import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LinkedinDashboard } from "@/features/linkedin/components/dashboard/linkedin-dashboard";
import { getLinkedinDashboardData } from "@/features/linkedin/actions/dashboard.actions";
import { getLatestProfileSnapshot } from "@/features/linkedin/actions/profile-snapshots.actions";
import { ensureDefaultPillars } from "@/features/linkedin/actions/pillars.actions";

export const metadata: Metadata = { title: "LinkedIn Dashboard — LifeOS" };

export default async function LinkedinDashboardPage() {
  await ensureDefaultPillars();
  const [data, latestSnapshot] = await Promise.all([getLinkedinDashboardData(), getLatestProfileSnapshot()]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Dashboard" description="Your LinkedIn growth operating system." />
      <Suspense>
        <LinkedinDashboard data={data} latestSnapshot={latestSnapshot} />
      </Suspense>
    </div>
  );
}
