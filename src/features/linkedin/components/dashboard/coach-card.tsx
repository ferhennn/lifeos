import { Sparkles, Check, TriangleAlert } from "lucide-react";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";

export function CoachCard({ data }: { data: LinkedinDashboardData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" /> Coach
      </div>
      <div className="space-y-2">
        {data.coach.insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            {insight.tone === "positive" ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
            <span>{insight.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">Recommendation</p>
        <p className="mt-1 text-sm">{data.coach.recommendation}</p>
      </div>
    </div>
  );
}
