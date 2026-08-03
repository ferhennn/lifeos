import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LinkedinGoalsView } from "@/features/linkedin/components/goals/linkedin-goals-view";
import { listLinkedinGoals } from "@/features/linkedin/actions/linkedin-goals.actions";

export const metadata: Metadata = { title: "LinkedIn Goals — LifeOS" };

export default async function LinkedinGoalsPage() {
  const goals = await listLinkedinGoals();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Goals" description="Posts, followers, connections, leads — track what matters." />
      <Suspense>
        <LinkedinGoalsView goals={goals} />
      </Suspense>
    </div>
  );
}
