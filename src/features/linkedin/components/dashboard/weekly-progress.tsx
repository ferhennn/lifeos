import Link from "next/link";
import { Send, Users, Handshake } from "lucide-react";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";
import type { LinkedinDashboardData, GoalRatio } from "../../actions/dashboard.actions";

function ratioCard(icon: LucideIcon, label: string, ratio: GoalRatio) {
  if (!ratio) {
    return (
      <div key={label} className="rounded-xl border border-border bg-card p-4">
        <CardLabel icon={icon} label={label} />
        <p className="mt-3 text-sm text-muted-foreground">
          No goal set — <Link href="/linkedin/goals" className="text-primary hover:underline">Set one</Link>
        </p>
      </div>
    );
  }
  const progress = ratio.target > 0 ? Math.min(100, Math.round((ratio.current / ratio.target) * 100)) : 0;
  return (
    <div key={label} className="rounded-xl border border-border bg-card p-4">
      <CardLabel icon={icon} label={label} />
      <p className="mt-2 text-lg font-semibold tracking-tight">
        {ratio.current} / {ratio.target}
      </p>
      <Progress value={progress} className="mt-2.5">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}

function CardLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
  );
}

export function WeeklyProgress({ data }: { data: LinkedinDashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ratioCard(Send, "Posts", { current: data.weeklyPosts, target: data.weeklyPostsTarget })}
      {ratioCard(Users, "Followers", data.followersGoal)}
      {ratioCard(Handshake, "Leads", data.leadsGoal)}
    </div>
  );
}
