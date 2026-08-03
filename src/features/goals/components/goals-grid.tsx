"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
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
import { EmptyState } from "@/components/shared/empty-state";
import { GoalCard } from "./goal-card";
import { GoalFormSheet } from "./goal-form-sheet";
import { listGoals, createGoal, updateGoal, deleteGoal, type GoalWithProgress } from "../actions/goals.actions";
import type { GoalValues } from "../schema/goal.schema";

export function GoalsGrid({ initialGoals }: { initialGoals: GoalWithProgress[] }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalWithProgress | null>(null);

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: listGoals,
    initialData: initialGoals,
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/goals");
    }
  }, [searchParams, router]);

  const createMutation = useMutation({
    mutationFn: (values: GoalValues) => createGoal(values),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData<GoalWithProgress[]>(["goals"]);
      const optimistic: GoalWithProgress = {
        id: `optimistic-${nanoid()}`,
        userId: "",
        title: values.title,
        description: values.description || null,
        targetDate: values.targetDate || null,
        priority: values.priority,
        status: values.status,
        coverColor: values.coverColor,
        coverImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: 0,
        totalTasks: 0,
        totalLinkedinPosts: 0,
        strategyCount: 0,
      };
      queryClient.setQueryData<GoalWithProgress[]>(["goals"], (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _values, context) => {
      queryClient.setQueryData(["goals"], context?.previous);
      toast.error("Couldn't create goal");
    },
    onSuccess: () => toast.success("Goal created"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: GoalValues }) => updateGoal(id, values),
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData<GoalWithProgress[]>(["goals"]);
      queryClient.setQueryData<GoalWithProgress[]>(["goals"], (old) =>
        old?.map((g) =>
          g.id === id
            ? { ...g, ...values, description: values.description || null, targetDate: values.targetDate || null }
            : g,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["goals"], context?.previous);
      toast.error("Couldn't update goal");
    },
    onSuccess: () => toast.success("Goal updated"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData<GoalWithProgress[]>(["goals"]);
      queryClient.setQueryData<GoalWithProgress[]>(["goals"], (old) => old?.filter((g) => g.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["goals"], context?.previous);
      toast.error("Couldn't delete goal");
    },
    onSuccess: () => toast.success("Goal deleted"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {goals.length} goal{goals.length === 1 ? "" : "s"}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Goals are where everything starts. Create one to begin translating strategy into daily execution."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditingGoal(null);
                setSheetOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Create your first goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => {
                  setEditingGoal(goal);
                  setSheetOpen(true);
                }}
                onDelete={() => setDeletingGoal(goal)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <GoalFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        goal={editingGoal}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editingGoal) {
            await updateMutation.mutateAsync({ id: editingGoal.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <AlertDialog open={!!deletingGoal} onOpenChange={(open) => !open && setDeletingGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deletingGoal?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This also detaches any strategies, projects, and tasks linked to this goal. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deletingGoal) deleteMutation.mutate(deletingGoal.id);
                setDeletingGoal(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
