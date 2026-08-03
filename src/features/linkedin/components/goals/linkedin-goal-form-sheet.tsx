"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { linkedinGoalSchema, linkedinGoalMetrics, linkedinGoalStatuses, type LinkedinGoalValues } from "../../schema/goal.schema";
import { linkedinGoalMetricLabels, goalStatusConfig } from "@/lib/status-config";
import type { LinkedinGoal } from "@/db/schema";

const emptyDefaults: LinkedinGoalValues = {
  title: "",
  metric: "followers",
  targetValue: 100,
  currentValue: 0,
  targetDate: "",
  status: "active",
};

export function LinkedinGoalFormSheet({
  open,
  onOpenChange,
  goal,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: LinkedinGoal | null;
  isPending: boolean;
  onSubmit: (values: LinkedinGoalValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LinkedinGoalValues>({ resolver: zodResolver(linkedinGoalSchema), defaultValues: emptyDefaults });

  useEffect(() => {
    if (open) {
      reset(
        goal
          ? {
              title: goal.title,
              metric: goal.metric,
              targetValue: goal.targetValue,
              currentValue: goal.currentValue,
              targetDate: goal.targetDate ?? "",
              status: goal.status,
            }
          : emptyDefaults,
      );
    }
  }, [open, goal, reset]);

  const submit = async (values: LinkedinGoalValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{goal ? "Edit goal" : "New goal"}</SheetTitle>
          <SheetDescription>Track a specific, measurable outcome.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Hit 5k followers" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Metric</Label>
            <Controller
              control={control}
              name="metric"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {linkedinGoalMetrics.map((m) => (
                      <SelectItem key={m} value={m}>{linkedinGoalMetricLabels[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current value</Label>
              <Input id="currentValue" type="number" min={0} {...register("currentValue", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target value</Label>
              <Input id="targetValue" type="number" min={1} {...register("targetValue", { valueAsNumber: true })} />
              {errors.targetValue && <p className="text-xs text-destructive">{errors.targetValue.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Target date</Label>
              <Controller
                control={control}
                name="targetDate"
                render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {linkedinGoalStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{goalStatusConfig[s]?.label ?? s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <SheetFooter className="mt-auto flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {goal ? "Save changes" : "Create goal"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{goal?.title}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={async () => {
                    await onDelete();
                    setConfirmDelete(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SheetContent>
    </Sheet>
  );
}
