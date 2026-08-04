"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, subDays } from "date-fns";
import { Flame, TrendingUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatCard } from "../dashboard/stat-card";
import { setEngagementItem } from "../../actions/engagement.actions";
import { linkedinEngagementItems, linkedinEngagementLabels, completionRatio } from "../../schema/engagement.schema";
import type { LinkedinEngagementLog } from "@/db/schema";

function computeStreak(logs: LinkedinEngagementLog[]): number {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  let streak = 0;
  let cursor = new Date();
  const today = format(cursor, "yyyy-MM-dd");
  const isFull = (log: LinkedinEngagementLog | undefined) => log != null && linkedinEngagementItems.every((k) => log[k]);
  if (!isFull(byDate.get(today))) cursor = subDays(cursor, 1);
  while (isFull(byDate.get(format(cursor, "yyyy-MM-dd")))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function EngagementView({ todayLog, recentLogs }: { todayLog: LinkedinEngagementLog | null; recentLogs: LinkedinEngagementLog[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const streak = useMemo(() => computeStreak(recentLogs), [recentLogs]);
  const weeklyCompletion = useMemo(() => {
    const last7 = recentLogs.slice(0, 7);
    if (last7.length === 0) return 0;
    return Math.round((last7.reduce((sum, l) => sum + completionRatio(l), 0) / 7) * 100);
  }, [recentLogs]);

  const byDate = useMemo(() => new Map(recentLogs.map((l) => [l.date, l])), [recentLogs]);

  const toggle = (item: (typeof linkedinEngagementItems)[number], checked: boolean) => {
    startTransition(async () => {
      await setEngagementItem(item, checked);
      router.refresh();
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-5 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-sm font-medium">Today&apos;s checklist</p>
          <div className="space-y-3">
            {linkedinEngagementItems.map((item) => (
              <label key={item} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <Checkbox
                  checked={todayLog?.[item] ?? false}
                  disabled={isPending}
                  onCheckedChange={(checked) => toggle(item, checked === true)}
                />
                <span className="text-sm">{linkedinEngagementLabels[item]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Flame} label="Streak" value={`${streak}d`} />
            <StatCard icon={TrendingUp} label="Weekly Completion" value={`${weeklyCompletion}%`} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-medium">Last 14 days</p>
            <div className="flex gap-1.5">
              {Array.from({ length: 14 }).map((_, i) => {
                const date = subDays(new Date(), 13 - i);
                const dateStr = format(date, "yyyy-MM-dd");
                const log = byDate.get(dateStr);
                const ratio = completionRatio(log);
                return (
                  <div key={dateStr} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="h-8 w-full rounded-md"
                      style={{ backgroundColor: ratio === 0 ? "var(--muted)" : `color-mix(in oklch, var(--primary) ${Math.round(ratio * 100)}%, var(--muted))` }}
                      title={`${Math.round(ratio * 100)}%`}
                    />
                    <span className="text-[10px] text-muted-foreground">{format(date, "EEEEE")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
