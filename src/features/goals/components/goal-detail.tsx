"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { goalStatusConfig } from "@/lib/status-config";
import { GoalFormSheet } from "./goal-form-sheet";
import { updateGoal, deleteGoal, type GoalWithProgress } from "../actions/goals.actions";
import type { GoalValues } from "../schema/goal.schema";

export function GoalDetail({ goal }: { goal: GoalWithProgress }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (values: GoalValues) => updateGoal(goal.id, values),
    onSuccess: () => {
      toast.success("Goal updated");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      router.refresh();
    },
    onError: () => toast.error("Couldn't update goal"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGoal(goal.id),
    onSuccess: () => {
      toast.success("Goal deleted");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      router.push("/goals");
    },
    onError: () => toast.error("Couldn't delete goal"),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: goal.coverColor }} />

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{goal.title}</h1>
          {goal.description && <p className="max-w-2xl text-sm text-muted-foreground">{goal.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusBadge config={goalStatusConfig} status={goal.status} />
            <PriorityBadge priority={goal.priority} />
            {goal.targetDate && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80">
                <CalendarDays className="h-3 w-3" />
                {format(parseISO(goal.targetDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProgressRing value={goal.progress} size={64} strokeWidth={5} />
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <GoalFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        goal={goal}
        isPending={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{goal.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This also detaches any strategies, projects, and tasks linked to this goal. This can&apos;t be undone.
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
