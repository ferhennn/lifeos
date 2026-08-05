import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Hero({ data }: { data: LinkedinDashboardData }) {
  const hour = new Date().getHours();
  const post = data.todaysQueuePost;

  const postLabel = post ? (post.dayNumber ? `Day ${post.dayNumber}` : post.topic || post.hook || "today's post") : null;

  const focusParts: string[] = [];
  if (post && post.status !== "published") focusParts.push(`Publish ${postLabel}`);
  if (!data.todaysEngagementDone) focusParts.push("complete your engagement checklist");
  const focusLine = focusParts.length > 0 ? focusParts.join(" and ") : "You're all caught up for today.";

  const cta =
    post && post.status !== "published"
      ? { label: post.scheduledDate ? "Publish Today's Post" : "Continue Draft", href: "/linkedin/daily" }
      : { label: "Create Post", href: "/linkedin/library" };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-xl font-semibold tracking-tight">{greeting(hour)} 👋</p>
      {data.streak > 0 && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-amber-500" /> You&apos;re on a {data.streak} day posting streak.
        </p>
      )}
      <p className="mt-3 text-sm">
        <span className="font-medium text-muted-foreground">Today&apos;s focus: </span>
        {focusLine}
      </p>
      <Button className="mt-4" render={<Link href={cta.href} />}>
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
