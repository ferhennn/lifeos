import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DailyPostingView } from "@/features/linkedin/components/daily/daily-posting-view";
import { getQueuePost, listLinkedinPosts } from "@/features/linkedin/actions/posts.actions";
import { listPillarOptions } from "@/features/linkedin/actions/pillars.actions";
import { listLinkedinStrategyOptions } from "@/features/linkedin/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Daily Posting — LifeOS" };

export default async function DailyPostingPage() {
  const [queuePost, posts, pillarOptions, strategyOptions, goalOptions] = await Promise.all([
    getQueuePost(),
    listLinkedinPosts(),
    listPillarOptions(),
    listLinkedinStrategyOptions(),
    listGoalOptions(),
  ]);

  // Dated posts first (soonest first), then undated backlog posts (newest first) —
  // bulk-imported posts often have no date yet and would otherwise vanish from this page.
  const upcomingPosts = posts
    .filter((p) => p.id !== queuePost?.id && p.status !== "published")
    .sort((a, b) => {
      if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
      if (a.scheduledDate) return -1;
      if (b.scheduledDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 30);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Daily Posting" />
      <Suspense>
        <DailyPostingView
          queuePost={queuePost}
          upcomingPosts={upcomingPosts}
          pillarOptions={pillarOptions}
          strategyOptions={strategyOptions}
          goalOptions={goalOptions}
        />
      </Suspense>
    </div>
  );
}
