"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus, Compass } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { StrategyCard } from "./strategy-card";
import { StrategyFormSheet } from "./strategy-form-sheet";
import {
  listStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  generateUpcomingTasks,
  type StrategyWithMeta,
} from "../actions/strategies.actions";
import type { StrategyValues } from "../schema/strategy.schema";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function StrategiesList({
  initialStrategies,
  goalOptions,
}: {
  initialStrategies: StrategyWithMeta[];
  goalOptions: GoalOption[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingStrategy, setEditingStrategy] = useState<StrategyWithMeta | null>(null);
  const [deletingStrategy, setDeletingStrategy] = useState<StrategyWithMeta | null>(null);
  const [defaultGoalId, setDefaultGoalId] = useState<string | undefined>(() => searchParams.get("goalId") ?? undefined);

  const { data: strategiesData = [] } = useQuery({
    queryKey: ["strategies"],
    queryFn: listStrategies,
    initialData: initialStrategies,
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/strategies");
    }
  }, [searchParams, router]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: StrategyValues) => createStrategy(values),
    onSuccess: () => {
      toast.success("Strategy created");
      invalidate();
    },
    onError: () => toast.error("Couldn't create strategy"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: StrategyValues }) => updateStrategy(id, values),
    onSuccess: () => {
      toast.success("Strategy updated");
      invalidate();
    },
    onError: () => toast.error("Couldn't update strategy"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStrategy(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["strategies"] });
      const previous = queryClient.getQueryData<StrategyWithMeta[]>(["strategies"]);
      queryClient.setQueryData<StrategyWithMeta[]>(["strategies"], (old) => old?.filter((s) => s.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["strategies"], context?.previous);
      toast.error("Couldn't delete strategy");
    },
    onSuccess: () => toast.success("Strategy deleted"),
    onSettled: () => invalidate(),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => generateUpcomingTasks(id),
    onSuccess: (result) => {
      toast.success(result.created > 0 ? `${result.created} task${result.created === 1 ? "" : "s"} synced` : "Already up to date");
      invalidate();
    },
    onError: () => toast.error("Couldn't sync tasks"),
  });

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {strategiesData.length} strateg{strategiesData.length === 1 ? "y" : "ies"}
        </p>
        <Button
          size="sm"
          disabled={goalOptions.length === 0}
          onClick={() => {
            setEditingStrategy(null);
            setDefaultGoalId(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Strategy
        </Button>
      </div>

      {goalOptions.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Create a goal first"
          description="Strategies belong to a goal. Head to Goals to create one, then come back here."
        />
      ) : strategiesData.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No strategies yet"
          description="Strategies turn goals into recurring, concrete work — set a cadence and tasks generate themselves."
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" /> Create your first strategy
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {strategiesData.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onEdit={() => {
                  setEditingStrategy(strategy);
                  setSheetOpen(true);
                }}
                onDelete={() => setDeletingStrategy(strategy)}
                onSync={() => syncMutation.mutate(strategy.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <StrategyFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        strategy={editingStrategy}
        goalOptions={goalOptions}
        defaultGoalId={defaultGoalId}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editingStrategy) {
            await updateMutation.mutateAsync({ id: editingStrategy.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <AlertDialog open={!!deletingStrategy} onOpenChange={(open) => !open && setDeletingStrategy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deletingStrategy?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This also detaches any projects and tasks linked to this strategy. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deletingStrategy) deleteMutation.mutate(deletingStrategy.id);
                setDeletingStrategy(null);
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
