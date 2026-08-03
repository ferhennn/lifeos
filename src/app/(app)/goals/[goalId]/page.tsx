import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { Compass, Plus, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { strategies } from "@/db/schema";
import { getGoal } from "@/features/goals/actions/goals.actions";
import { GoalDetail } from "@/features/goals/components/goal-detail";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { strategyStatusConfig } from "@/lib/status-config";

export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const goal = await getGoal(goalId);
  if (!goal) notFound();

  const goalStrategies = await db
    .select()
    .from(strategies)
    .where(eq(strategies.goalId, goalId))
    .orderBy(desc(strategies.createdAt));

  return (
    <div className="flex h-full flex-col">
      <GoalDetail goal={goal} />

      <div className="flex-1 space-y-4 border-t border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Strategies</h2>
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/strategies?new=1&goalId=${goal.id}`} />}
          >
            <Plus className="h-3.5 w-3.5" /> New Strategy
          </Button>
        </div>

        {goalStrategies.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No strategies yet"
            description="Strategies turn this goal into recurring, concrete work."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {goalStrategies.map((s) => (
              <Link
                key={s.id}
                href={`/strategies/${s.id}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <StatusBadge config={strategyStatusConfig} status={s.status} />
                    <PriorityBadge priority={s.priority} />
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
