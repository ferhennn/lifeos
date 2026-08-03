"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Compass, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { strategyStatusConfig } from "@/lib/status-config";
import { StrategyFormSheet } from "./strategy-form-sheet";
import { createLinkedinStrategy, updateLinkedinStrategy, deleteLinkedinStrategy, type StrategyWithPillars } from "../../actions/strategies.actions";
import type { LinkedinStrategyValues } from "../../schema/strategy.schema";
import type { PillarOption } from "../../actions/pillars.actions";

export function StrategiesView({ strategies, pillarOptions }: { strategies: StrategyWithPillars[]; pillarOptions: PillarOption[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyWithPillars | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingStrategy(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New strategy
        </Button>
      </div>

      {strategies.length === 0 ? (
        <EmptyState icon={Compass} title="No strategies yet" description="Define a goal, cadence, and audience for your content." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-sm font-medium">{strategy.name}</p>
                <StatusBadge config={strategyStatusConfig} status={strategy.status} />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => {
                    setEditingStrategy(strategy);
                    setSheetOpen(true);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </div>
              {strategy.goal && <p className="text-xs text-muted-foreground">{strategy.goal}</p>}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {strategy.postingFrequency && <p><span className="text-foreground/70">Frequency:</span> {strategy.postingFrequency}</p>}
                {strategy.targetAudience && <p><span className="text-foreground/70">Audience:</span> {strategy.targetAudience}</p>}
                {strategy.primaryCta && <p><span className="text-foreground/70">CTA:</span> {strategy.primaryCta}</p>}
                {strategy.successMetric && <p><span className="text-foreground/70">Metric:</span> {strategy.successMetric}</p>}
              </div>
              {strategy.pillars.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-border pt-2.5">
                  {strategy.pillars.map((p) => (
                    <Badge key={p.id} variant="outline" className="gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <StrategyFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingStrategy(null);
        }}
        strategy={editingStrategy}
        pillarOptions={pillarOptions}
        isPending={isPending}
        onSubmit={async (values: LinkedinStrategyValues) => {
          setIsPending(true);
          try {
            if (editingStrategy) {
              await updateLinkedinStrategy(editingStrategy.id, values);
              toast.success("Strategy updated");
            } else {
              await createLinkedinStrategy(values);
              toast.success("Strategy created");
            }
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
        onDelete={
          editingStrategy
            ? async () => {
                await deleteLinkedinStrategy(editingStrategy.id);
                toast.success("Strategy deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
