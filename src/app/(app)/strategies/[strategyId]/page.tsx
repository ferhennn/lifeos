import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getStrategy } from "@/features/strategies/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";
import { StrategyDetail } from "@/features/strategies/components/strategy-detail";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { projectStatusConfig } from "@/lib/status-config";

export default async function StrategyDetailPage({ params }: { params: Promise<{ strategyId: string }> }) {
  const { strategyId } = await params;
  const [strategy, goalOptions] = await Promise.all([getStrategy(strategyId), listGoalOptions()]);
  if (!strategy) notFound();

  const strategyProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.strategyId, strategyId))
    .orderBy(desc(projects.createdAt));

  return (
    <div className="flex h-full flex-col">
      <StrategyDetail strategy={strategy} goalOptions={goalOptions} />

      <div className="flex-1 space-y-4 border-t border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Projects</h2>
          <Button size="sm" variant="outline" render={<Link href={`/projects?new=1&strategyId=${strategy.id}`} />}>
            <Plus className="h-3.5 w-3.5" /> New Project
          </Button>
        </div>

        {strategyProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Projects organize this strategy's work into epics and tasks."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {strategyProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <div className="mt-1.5">
                    <StatusBadge config={projectStatusConfig} status={p.status} />
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
