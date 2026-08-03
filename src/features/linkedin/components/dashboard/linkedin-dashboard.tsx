"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Flame,
  Send,
  Users,
  Eye,
  TrendingUp,
  BarChart3,
  ThumbsUp,
  MessageCircle,
  Share2,
  Trophy,
  Target,
  Activity,
  CalendarClock,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { linkedinPostStatusConfig, dot } from "@/lib/status-config";
import { StatCard } from "./stat-card";
import { PillarDistributionChart } from "./pillar-distribution-chart";
import { PostingHeatmap } from "./posting-heatmap";
import { RecordStatsDialog } from "./record-stats-dialog";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";
import type { LinkedinProfileSnapshot } from "@/db/schema";

export function LinkedinDashboard({ data, latestSnapshot }: { data: LinkedinDashboardData; latestSnapshot: LinkedinProfileSnapshot | null }) {
  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Your LinkedIn growth at a glance.</p>
        <RecordStatsDialog latest={latestSnapshot} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={Flame} label="Posting Streak" value={`${data.streak}d`} />
        <StatCard icon={Send} label="Posts This Month" value={data.postsThisMonth} />
        <StatCard icon={Users} label="Followers" value={data.followers ?? "—"} />
        <StatCard icon={Eye} label="Profile Views" value={data.profileViews ?? "—"} />
        <StatCard icon={TrendingUp} label="Engagement Rate" value={data.engagementRate != null ? `${data.engagementRate}%` : "—"} />
        <StatCard icon={BarChart3} label="Total Impressions" value={data.totalImpressions.toLocaleString()} />
        <StatCard icon={ThumbsUp} label="Avg Likes" value={data.avgLikes ?? "—"} />
        <StatCard icon={MessageCircle} label="Avg Comments" value={data.avgComments ?? "—"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Top Performing Post
          </div>
          {data.topPost ? (
            <Link href={`/linkedin/library/${data.topPost.id}`} className="block space-y-2 rounded-lg border border-transparent p-2 -m-2 hover:border-border">
              <p className="line-clamp-2 text-sm leading-snug">{data.topPost.hook || data.topPost.caption || data.topPost.topic}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {data.topPost.likes ?? 0}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {data.topPost.comments ?? 0}</span>
                <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {data.topPost.shares ?? 0}</span>
              </div>
            </Link>
          ) : (
            <EmptyState icon={Trophy} title="No performance data yet" description="Log likes, comments, and shares on published posts to surface your best work." />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" /> Today
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Queue post</span>
              {data.todaysQueuePost ? (
                <Link href="/linkedin/daily" className="text-primary hover:underline">Ready</Link>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Engagement checklist</span>
              {data.todaysEngagementDone ? (
                <span className="text-emerald-500">Done</span>
              ) : (
                <Link href="/linkedin/engagement" className="text-primary hover:underline">Pending</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PillarDistributionChart data={data.pillarDistribution} />
        <PostingHeatmap data={data.heatmap} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Goal Progress
          </div>
          {data.goalProgress.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active goals. <Link href="/linkedin/goals" className="text-primary hover:underline">Set one</Link>.</p>
          ) : (
            <div className="space-y-3">
              {data.goalProgress.map((g) => (
                <div key={g.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{g.title}</span>
                    <span className="text-muted-foreground">{g.current}/{g.target}</span>
                  </div>
                  <Progress value={g.progress}>
                    <ProgressTrack>
                      <ProgressIndicator />
                    </ProgressTrack>
                  </Progress>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Recent Activity
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nothing yet.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentActivity.map((a) => (
                <Link key={a.id} href={a.href} className="block text-xs hover:text-foreground">
                  <p className="line-clamp-1 text-foreground/90">{a.label}</p>
                  <p className="text-muted-foreground">{format(a.at, "MMM d, h:mm a")}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" /> Upcoming Scheduled Posts
          </div>
          {data.upcomingPosts.length === 0 ? (
            <EmptyState icon={Sparkles} title="Nothing scheduled" description="Queue up posts in the Pipeline or Daily Posting page." />
          ) : (
            <div className="space-y-2">
              {data.upcomingPosts.map((p) => {
                const config = linkedinPostStatusConfig[p.status];
                return (
                  <Link key={p.id} href={`/linkedin/library/${p.id}`} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted/40">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[config.color]}`} />
                    <span className="line-clamp-1 flex-1">{p.hook || p.topic || p.caption || "Untitled"}</span>
                    <span className="shrink-0 text-muted-foreground">{p.scheduledDate ? format(parseISO(p.scheduledDate), "MMM d") : ""}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {data.pillarDistribution.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.pillarDistribution.slice(0, 8).map((p) => (
            <Badge key={p.name} variant="outline" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
