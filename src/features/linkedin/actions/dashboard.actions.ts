"use server";

import { format, subDays, isSameMonth, isSameDay } from "date-fns";
import { listLinkedinPosts, type LinkedinPostWithPillars } from "./posts.actions";
import { listLinkedinGoals } from "./linkedin-goals.actions";
import { listRecentEngagementLogs } from "./engagement.actions";
import { isFullyChecked } from "../schema/engagement.schema";
import { getLatestProfileSnapshot } from "./profile-snapshots.actions";
import { linkedinGoalMetricLabels } from "@/lib/status-config";

export type PillarDistributionItem = { name: string; color: string; count: number; percent: number };
export type HeatmapDay = { date: string; count: number };
export type ActivityItem = { id: string; label: string; at: Date; href: string };

export type LinkedinDashboardData = {
  streak: number;
  postsThisMonth: number;
  followers: number | null;
  profileViews: number | null;
  engagementRate: number | null;
  totalImpressions: number;
  avgLikes: number | null;
  avgComments: number | null;
  avgShares: number | null;
  topPost: LinkedinPostWithPillars | null;
  weeklyEngagementCompletion: number;
  todaysQueuePost: LinkedinPostWithPillars | null;
  todaysEngagementDone: boolean;
  goalProgress: { id: string; title: string; metricLabel: string; current: number; target: number; progress: number }[];
  recentActivity: ActivityItem[];
  upcomingPosts: LinkedinPostWithPillars[];
  pillarDistribution: PillarDistributionItem[];
  heatmap: HeatmapDay[];
};

function computeStreak(posts: LinkedinPostWithPillars[]): number {
  const publishedDays = new Set(
    posts.filter((p) => p.status === "published" && p.postedAt).map((p) => format(new Date(p.postedAt!), "yyyy-MM-dd")),
  );
  let streak = 0;
  let cursor = new Date();
  // A streak "counts" through today even if today hasn't posted yet, as long as yesterday did.
  if (!publishedDays.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
  }
  while (publishedDays.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export async function getLinkedinDashboardData(): Promise<LinkedinDashboardData> {
  const [posts, goals, engagementLogs, snapshot] = await Promise.all([
    listLinkedinPosts(),
    listLinkedinGoals(),
    listRecentEngagementLogs(30),
    getLatestProfileSnapshot(),
  ]);

  const now = new Date();
  const published = posts.filter((p) => p.status === "published");

  const postsThisMonth = published.filter((p) => p.postedAt && isSameMonth(new Date(p.postedAt), now)).length;

  const withEngagement = published.filter((p) => p.likes != null || p.comments != null || p.shares != null);
  const avg = (fn: (p: LinkedinPostWithPillars) => number | null) => {
    const values = withEngagement.map(fn).filter((v): v is number => v != null);
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  };

  const totalImpressions = published.reduce((sum, p) => sum + (p.impressions ?? 0), 0);
  const withImpressions = published.filter((p) => p.impressions);
  const engagementRate =
    withImpressions.length > 0
      ? Math.round(
          (withImpressions.reduce((sum, p) => sum + ((p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0)) / p.impressions!, 0) /
            withImpressions.length) *
            1000,
        ) / 10
      : null;

  const topPost =
    withEngagement.length > 0
      ? [...withEngagement].sort(
          (a, b) => (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0) - ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)),
        )[0]
      : null;

  const last7 = engagementLogs.slice(0, 7);
  const weeklyEngagementCompletion =
    last7.length > 0 ? Math.round((last7.filter((l) => isFullyChecked(l)).length / 7) * 100) : 0;

  const today = format(now, "yyyy-MM-dd");
  const todaysEngagementDone = engagementLogs.some((l) => l.date === today && isFullyChecked(l));

  const todaysQueuePost =
    posts.find((p) => p.scheduledDate === today) ??
    posts
      .filter((p) => p.status !== "published" && p.scheduledDate && p.scheduledDate >= today)
      .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))[0] ??
    null;

  const goalProgress = goals
    .filter((g) => g.status === "active")
    .slice(0, 6)
    .map((g) => ({
      id: g.id,
      title: g.title,
      metricLabel: linkedinGoalMetricLabels[g.metric] ?? g.metric,
      current: g.currentValue,
      target: g.targetValue,
      progress: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
    }));

  const recentActivity: ActivityItem[] = [
    ...published.slice(0, 5).map(
      (p): ActivityItem => ({
        id: p.id,
        label: `Published "${(p.topic || p.hook || p.caption || "Untitled post").slice(0, 60)}"`,
        at: p.postedAt ? new Date(p.postedAt) : new Date(p.createdAt),
        href: `/linkedin/library/${p.id}`,
      }),
    ),
    ...posts
      .slice(0, 5)
      .map((p): ActivityItem => ({ id: `created-${p.id}`, label: `Added to pipeline: "${(p.topic || p.hook || "Untitled").slice(0, 60)}"`, at: new Date(p.createdAt), href: `/linkedin/library/${p.id}` })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const upcomingPosts = posts
    .filter((p) => p.status !== "published" && p.scheduledDate && p.scheduledDate >= today)
    .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))
    .slice(0, 5);

  const pillarCounts = new Map<string, PillarDistributionItem>();
  for (const post of posts) {
    for (const pillar of post.pillars) {
      const existing = pillarCounts.get(pillar.id);
      if (existing) existing.count += 1;
      else pillarCounts.set(pillar.id, { name: pillar.name, color: pillar.color, count: 1, percent: 0 });
    }
  }
  const totalPillarTags = [...pillarCounts.values()].reduce((sum, p) => sum + p.count, 0);
  const pillarDistribution = [...pillarCounts.values()]
    .map((p) => ({ ...p, percent: totalPillarTags > 0 ? Math.round((p.count / totalPillarTags) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  const heatmap: HeatmapDay[] = Array.from({ length: 84 }).map((_, i) => {
    const date = subDays(now, 83 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = published.filter((p) => p.postedAt && isSameDay(new Date(p.postedAt), date)).length;
    return { date: dateStr, count };
  });

  return {
    streak: computeStreak(posts),
    postsThisMonth,
    followers: snapshot?.followers ?? null,
    profileViews: snapshot?.profileViews ?? null,
    engagementRate,
    totalImpressions,
    avgLikes: avg((p) => p.likes),
    avgComments: avg((p) => p.comments),
    avgShares: avg((p) => p.shares),
    topPost,
    weeklyEngagementCompletion,
    todaysQueuePost,
    todaysEngagementDone,
    goalProgress,
    recentActivity,
    upcomingPosts,
    pillarDistribution,
    heatmap,
  };
}
