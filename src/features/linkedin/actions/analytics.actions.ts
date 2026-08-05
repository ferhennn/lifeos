"use server";

import { format, subDays, isSameDay } from "date-fns";
import { listLinkedinPosts, type LinkedinPostWithPillars } from "./posts.actions";
import { getLatestProfileSnapshot } from "./profile-snapshots.actions";

export type PillarDistributionItem = { name: string; color: string; count: number; percent: number };
export type HeatmapDay = { date: string; count: number };

export type LinkedinAnalyticsData = {
  followers: number | null;
  profileViews: number | null;
  engagementRate: number | null;
  totalImpressions: number;
  avgLikes: number | null;
  avgComments: number | null;
  avgShares: number | null;
  topPost: LinkedinPostWithPillars | null;
  pillarDistribution: PillarDistributionItem[];
  heatmap: HeatmapDay[];
};

export async function getLinkedinAnalyticsData(): Promise<LinkedinAnalyticsData> {
  const [posts, snapshot] = await Promise.all([listLinkedinPosts(), getLatestProfileSnapshot()]);

  const now = new Date();
  const published = posts.filter((p) => p.status === "published");

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
    followers: snapshot?.followers ?? null,
    profileViews: snapshot?.profileViews ?? null,
    engagementRate,
    totalImpressions,
    avgLikes: avg((p) => p.likes),
    avgComments: avg((p) => p.comments),
    avgShares: avg((p) => p.shares),
    topPost,
    pillarDistribution,
    heatmap,
  };
}
