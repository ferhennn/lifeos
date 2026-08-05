"use server";

import { format, subDays, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { listLinkedinPosts, type LinkedinPostWithPillars } from "./posts.actions";
import { listLinkedinGoals } from "./linkedin-goals.actions";
import { listRecentEngagementLogs } from "./engagement.actions";
import { isFullyChecked } from "../schema/engagement.schema";
import { getLatestProfileSnapshot } from "./profile-snapshots.actions";
import { linkedinGoalMetricLabels } from "@/lib/status-config";

const WEEKLY_POSTS_TARGET = 7;

export type GoalRatio = { current: number; target: number } | null;

export type CoachInsight = { tone: "positive" | "warning"; text: string };

export type LinkedinDashboardData = {
  streak: number;
  postsThisMonth: number;
  followers: number | null;
  todaysQueuePost: LinkedinPostWithPillars | null;
  todaysEngagementDone: boolean;
  weeklyPosts: number;
  weeklyPostsTarget: number;
  followersGoal: GoalRatio;
  leadsGoal: GoalRatio;
  goalProgress: { id: string; title: string; metricLabel: string; current: number; target: number; progress: number }[];
  recentPosts: LinkedinPostWithPillars[];
  coach: { insights: CoachInsight[]; recommendation: string };
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

function buildCoach(
  posts: LinkedinPostWithPillars[],
  streak: number,
  todaysEngagementDone: boolean,
): { insights: CoachInsight[]; recommendation: string } {
  const insights: CoachInsight[] = [];

  insights.push(
    streak >= 1
      ? { tone: "positive", text: "You haven't missed a posting day." }
      : { tone: "warning", text: "You haven't posted in the last day — keep the streak alive." },
  );

  const published = posts.filter((p) => p.status === "published" && (p.likes != null || p.comments != null || p.shares != null));
  const pillarScores = new Map<string, { total: number; count: number }>();
  for (const post of published) {
    const score = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0);
    for (const pillar of post.pillars) {
      const entry = pillarScores.get(pillar.name) ?? { total: 0, count: 0 };
      entry.total += score;
      entry.count += 1;
      pillarScores.set(pillar.name, entry);
    }
  }
  const ranked = [...pillarScores.entries()]
    .map(([name, { total, count }]) => ({ name, avg: total / count }))
    .sort((a, b) => b.avg - a.avg);
  if (ranked.length >= 2 && ranked[0].avg > ranked[ranked.length - 1].avg) {
    const bottom = ranked[ranked.length - 1];
    insights.push({ tone: "positive", text: `"${ranked[0].name}" posts are outperforming "${bottom.name}" posts.` });
  }

  insights.push(
    todaysEngagementDone
      ? { tone: "positive", text: "Engagement checklist done for today." }
      : { tone: "warning", text: "You haven't engaged with your audience today." },
  );

  const withHour = published.filter((p) => p.postedAt);
  let recommendation = "Publish before 10 AM tomorrow for better reach.";
  if (withHour.length >= 3) {
    const hourScores = new Map<number, { total: number; count: number }>();
    for (const post of withHour) {
      const hour = new Date(post.postedAt!).getHours();
      const score = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0);
      const entry = hourScores.get(hour) ?? { total: 0, count: 0 };
      entry.total += score;
      entry.count += 1;
      hourScores.set(hour, entry);
    }
    const bestHour = [...hourScores.entries()].sort((a, b) => b[1].total / b[1].count - a[1].total / a[1].count)[0];
    if (bestHour) {
      const [hour] = bestHour;
      const label = format(new Date(2000, 0, 1, hour), "h a");
      recommendation = `Publish around ${label} for better reach based on your past posts.`;
    }
  }

  return { insights, recommendation };
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

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weeklyPosts = published.filter((p) => p.postedAt && new Date(p.postedAt) >= weekStart && new Date(p.postedAt) <= weekEnd).length;

  const today = format(now, "yyyy-MM-dd");
  const todaysEngagementDone = engagementLogs.some((l) => l.date === today && isFullyChecked(l));

  const todaysQueuePost =
    posts.find((p) => p.scheduledDate === today) ??
    posts
      .filter((p) => p.status !== "published" && p.scheduledDate && p.scheduledDate >= today)
      .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))[0] ??
    null;

  const activeGoals = goals.filter((g) => g.status === "active");
  const followersGoalRow = activeGoals.find((g) => g.metric === "followers");
  const leadsGoalRow = activeGoals.find((g) => g.metric === "inbound_leads" || g.metric === "freelance_leads");

  const goalProgress = activeGoals.slice(0, 6).map((g) => ({
    id: g.id,
    title: g.title,
    metricLabel: linkedinGoalMetricLabels[g.metric] ?? g.metric,
    current: g.currentValue,
    target: g.targetValue,
    progress: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
  }));

  const recentPosts = [...posts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const streak = computeStreak(posts);

  return {
    streak,
    postsThisMonth,
    followers: snapshot?.followers ?? null,
    todaysQueuePost,
    todaysEngagementDone,
    weeklyPosts,
    weeklyPostsTarget: WEEKLY_POSTS_TARGET,
    followersGoal: followersGoalRow ? { current: followersGoalRow.currentValue, target: followersGoalRow.targetValue } : null,
    leadsGoal: leadsGoalRow ? { current: leadsGoalRow.currentValue, target: leadsGoalRow.targetValue } : null,
    goalProgress,
    recentPosts,
    coach: buildCoach(posts, streak, todaysEngagementDone),
  };
}
