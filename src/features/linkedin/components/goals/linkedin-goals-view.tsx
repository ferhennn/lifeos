"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Target, Plus, Edit, Minus, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { goalStatusConfig, linkedinGoalMetricLabels } from "@/lib/status-config";
import { LinkedinGoalFormSheet } from "./linkedin-goal-form-sheet";
import { createLinkedinGoal, updateLinkedinGoal, deleteLinkedinGoal, logLinkedinGoalProgress } from "../../actions/linkedin-goals.actions";
import type { LinkedinGoal } from "@/db/schema";
import type { LinkedinGoalValues } from "../../schema/goal.schema";

export function LinkedinGoalsView({ goals }: { goals: LinkedinGoal[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LinkedinGoal | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Set a measurable target to track your LinkedIn growth." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
            return (
              <div key={goal.id} className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">{linkedinGoalMetricLabels[goal.metric]}</p>
                  </div>
                  <StatusBadge config={goalStatusConfig} status={goal.status} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setEditingGoal(goal);
                      setSheetOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress}>
                    <ProgressTrack>
                      <ProgressIndicator />
                    </ProgressTrack>
                  </Progress>
                </div>

                {goal.targetDate && <p className="text-xs text-muted-foreground">Target: {format(parseISO(goal.targetDate), "MMM d, yyyy")}</p>}

                <div className="mt-auto flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={async () => {
                      await logLinkedinGoalProgress(goal.id, -1);
                      router.refresh();
                    }}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={async () => {
                      await logLinkedinGoalProgress(goal.id, 1);
                      router.refresh();
                    }}
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Log progress</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LinkedinGoalFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingGoal(null);
        }}
        goal={editingGoal}
        isPending={isPending}
        onSubmit={async (values: LinkedinGoalValues) => {
          setIsPending(true);
          try {
            if (editingGoal) {
              await updateLinkedinGoal(editingGoal.id, values);
              toast.success("Goal updated");
            } else {
              await createLinkedinGoal(values);
              toast.success("Goal created");
            }
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
        onDelete={
          editingGoal
            ? async () => {
                await deleteLinkedinGoal(editingGoal.id);
                toast.success("Goal deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
