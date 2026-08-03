import Link from "next/link";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type GoalProgress = { id: string; title: string; coverColor: string; progress: number };

export function MonthlyGoalProgress({ goals }: { goals: GoalProgress[] }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Target className="h-3.5 w-3.5" /> Monthly Goal Progress
      </div>
      {goals.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">No active goals yet.</p>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <Link key={g.id} href={`/goals/${g.id}`} className="block space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: g.coverColor }} />
                  {g.title}
                </span>
                <span className="text-muted-foreground">{g.progress}%</span>
              </div>
              <Progress value={g.progress} className="h-1.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
