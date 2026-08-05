"use client";

import Link from "next/link";
import { ThumbsUp, MessageCircle, BarChart3, Eye, TrendingUp, Trophy, Share2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "../dashboard/stat-card";
import { PillarDistributionChart } from "../dashboard/pillar-distribution-chart";
import { PostingHeatmap } from "../dashboard/posting-heatmap";
import type { LinkedinAnalyticsData } from "../../actions/analytics.actions";

export function AnalyticsView({ data }: { data: LinkedinAnalyticsData }) {
  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={ThumbsUp} label="Avg Likes" value={data.avgLikes ?? "No data yet"} />
        <StatCard icon={MessageCircle} label="Avg Comments" value={data.avgComments ?? "No data yet"} />
        <StatCard icon={BarChart3} label="Total Impressions" value={data.totalImpressions.toLocaleString()} />
        <StatCard icon={Eye} label="Profile Views" value={data.profileViews ?? "No data yet"} />
        <StatCard icon={TrendingUp} label="Engagement Rate" value={data.engagementRate != null ? `${data.engagementRate}%` : "No data yet"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PillarDistributionChart data={data.pillarDistribution} />
        <PostingHeatmap data={data.heatmap} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
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
    </div>
  );
}
