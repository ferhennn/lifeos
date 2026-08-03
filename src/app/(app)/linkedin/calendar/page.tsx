import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/features/linkedin/components/calendar/calendar-view";
import { listLinkedinPosts } from "@/features/linkedin/actions/posts.actions";
import { listPillarOptions } from "@/features/linkedin/actions/pillars.actions";
import { listLinkedinStrategyOptions } from "@/features/linkedin/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Calendar — LifeOS" };

export default async function CalendarPage() {
  const [posts, pillarOptions, strategyOptions, goalOptions] = await Promise.all([
    listLinkedinPosts(),
    listPillarOptions(),
    listLinkedinStrategyOptions(),
    listGoalOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Calendar" description="Drag a post to a new day to reschedule it." />
      <Suspense>
        <CalendarView posts={posts} pillarOptions={pillarOptions} strategyOptions={strategyOptions} goalOptions={goalOptions} />
      </Suspense>
    </div>
  );
}
