import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StrategiesView } from "@/features/linkedin/components/strategies/strategies-view";
import { listLinkedinStrategies } from "@/features/linkedin/actions/strategies.actions";
import { listPillarOptions } from "@/features/linkedin/actions/pillars.actions";

export const metadata: Metadata = { title: "Content Strategies — LifeOS" };

export default async function LinkedinStrategiesPage() {
  const [strategies, pillarOptions] = await Promise.all([listLinkedinStrategies(), listPillarOptions()]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Content Strategies" description="Goal, cadence, audience, and CTA for how you show up." />
      <Suspense>
        <StrategiesView strategies={strategies} pillarOptions={pillarOptions} />
      </Suspense>
    </div>
  );
}
