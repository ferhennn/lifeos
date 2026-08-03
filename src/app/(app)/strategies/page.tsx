import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StrategiesList } from "@/features/strategies/components/strategies-list";
import { listStrategies } from "@/features/strategies/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Strategies — LifeOS" };

export default async function StrategiesPage() {
  const [strategies, goalOptions] = await Promise.all([listStrategies(), listGoalOptions()]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Strategies" description="Recurring work that turns goals into daily execution." />
      <Suspense>
        <StrategiesList initialStrategies={strategies} goalOptions={goalOptions} />
      </Suspense>
    </div>
  );
}
