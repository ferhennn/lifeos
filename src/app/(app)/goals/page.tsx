import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { GoalsGrid } from "@/features/goals/components/goals-grid";
import { listGoals } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Goals — LifeOS" };

export default async function GoalsPage() {
  const goals = await listGoals();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Goals" description="Every strategy, project, and task traces back to one of these." />
      <Suspense>
        <GoalsGrid initialGoals={goals} />
      </Suspense>
    </div>
  );
}
