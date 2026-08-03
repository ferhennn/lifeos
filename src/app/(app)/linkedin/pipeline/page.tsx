import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineView } from "@/features/linkedin/components/pipeline/pipeline-view";
import { listLinkedinPosts } from "@/features/linkedin/actions/posts.actions";
import { listPillarOptions } from "@/features/linkedin/actions/pillars.actions";
import { listLinkedinStrategyOptions } from "@/features/linkedin/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Content Pipeline — LifeOS" };

export default async function PipelinePage() {
  const [posts, pillarOptions, strategyOptions, goalOptions] = await Promise.all([
    listLinkedinPosts(),
    listPillarOptions(),
    listLinkedinStrategyOptions(),
    listGoalOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Content Pipeline" description="Drag cards across stages as content moves from idea to published." />
      <Suspense>
        <PipelineView initialPosts={posts} pillarOptions={pillarOptions} strategyOptions={strategyOptions} goalOptions={goalOptions} />
      </Suspense>
    </div>
  );
}
