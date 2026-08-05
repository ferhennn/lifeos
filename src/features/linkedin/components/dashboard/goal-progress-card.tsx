import Link from "next/link";
import { Target } from "lucide-react";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";

export function GoalProgressCard({ data }: { data: LinkedinDashboardData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Target className="h-3.5 w-3.5" /> Goals
      </div>
      {data.goalProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No active goals. <Link href="/linkedin/goals" className="text-primary hover:underline">Set one</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.goalProgress.map((g) => (
            <div key={g.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{g.title}</span>
                <span className="shrink-0 text-muted-foreground">{g.current}/{g.target}</span>
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
  );
}
