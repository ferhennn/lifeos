"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, RefreshCw, Target, Gauge } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { strategyStatusConfig, recurrenceLabels } from "@/lib/status-config";
import { StrategyFormSheet } from "./strategy-form-sheet";
import {
  updateStrategy,
  deleteStrategy,
  generateUpcomingTasks,
  type StrategyWithMeta,
} from "../actions/strategies.actions";
import type { StrategyValues } from "../schema/strategy.schema";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function StrategyDetail({ strategy, goalOptions }: { strategy: StrategyWithMeta; goalOptions: GoalOption[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const updateMutation = useMutation({
    mutationFn: (values: StrategyValues) => updateStrategy(strategy.id, values),
    onSuccess: () => {
      toast.success("Strategy updated");
      invalidate();
      router.refresh();
    },
    onError: () => toast.error("Couldn't update strategy"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStrategy(strategy.id),
    onSuccess: () => {
      toast.success("Strategy deleted");
      invalidate();
      router.push("/strategies");
    },
    onError: () => toast.error("Couldn't delete strategy"),
  });

  const syncMutation = useMutation({
    mutationFn: () => generateUpcomingTasks(strategy.id),
    onSuccess: (result) => {
      toast.success(result.created > 0 ? `${result.created} task${result.created === 1 ? "" : "s"} synced` : "Already up to date");
      invalidate();
      router.refresh();
    },
    onError: () => toast.error("Couldn't sync tasks"),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: strategy.goalCoverColor }} />
            {strategy.goalTitle}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{strategy.title}</h1>
          {strategy.description && <p className="max-w-2xl text-sm text-muted-foreground">{strategy.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusBadge config={strategyStatusConfig} status={strategy.status} />
            <PriorityBadge priority={strategy.priority} />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80">
              {recurrenceLabels[strategy.recurrenceType]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {strategy.recurrenceType !== "none" && (
            <Button variant="outline" size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
              <RefreshCw className={syncMutation.isPending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Sync
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {strategy.expectedOutcome && (
          <div className="rounded-lg border border-border p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Target className="h-3.5 w-3.5" /> Expected outcome
            </p>
            <p className="mt-1 text-sm">{strategy.expectedOutcome}</p>
          </div>
        )}
        {strategy.successMetrics && (
          <div className="rounded-lg border border-border p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Success metric
            </p>
            <p className="mt-1 text-sm">{strategy.successMetrics}</p>
          </div>
        )}
        {strategy.estimatedEffort && (
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Estimated effort</p>
            <p className="mt-1 text-sm">{strategy.estimatedEffort}</p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{strategy.progress}% of {strategy.totalTasks} generated tasks complete</span>
        </div>
        <Progress value={strategy.progress} className="h-1.5" />
      </div>

      <StrategyFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        strategy={strategy}
        goalOptions={goalOptions}
        isPending={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{strategy.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This also detaches any projects and tasks linked to this strategy. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
