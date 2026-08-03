import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LibraryView } from "@/features/linkedin/components/library/library-view";
import { listLinkedinPosts } from "@/features/linkedin/actions/posts.actions";
import { listPillarOptions } from "@/features/linkedin/actions/pillars.actions";
import { listLinkedinStrategyOptions } from "@/features/linkedin/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Content Library — LifeOS" };

export default async function LibraryPage() {
  const [posts, pillarOptions, strategyOptions, goalOptions] = await Promise.all([
    listLinkedinPosts(),
    listPillarOptions(),
    listLinkedinStrategyOptions(),
    listGoalOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Content Library" description="Every post you've ever created, searchable." />
      <Suspense>
        <LibraryView posts={posts} pillarOptions={pillarOptions} strategyOptions={strategyOptions} goalOptions={goalOptions} />
      </Suspense>
    </div>
  );
}
