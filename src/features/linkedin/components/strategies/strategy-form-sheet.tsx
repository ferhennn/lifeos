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
import { linkedinStrategySchema, linkedinStrategyStatuses, type LinkedinStrategyValues } from "../../schema/strategy.schema";
import { PillarMultiSelect } from "../shared/pillar-multi-select";
import type { StrategyWithPillars } from "../../actions/strategies.actions";
import type { PillarOption } from "../../actions/pillars.actions";

const emptyDefaults: LinkedinStrategyValues = {
  name: "",
  goal: "",
  postingFrequency: "",
  targetAudience: "",
  primaryCta: "",
  successMetric: "",
  status: "active",
  pillarIds: [],
};

export function StrategyFormSheet({
  open,
  onOpenChange,
  strategy,
  pillarOptions,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: StrategyWithPillars | null;
  pillarOptions: PillarOption[];
  isPending: boolean;
  onSubmit: (values: LinkedinStrategyValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LinkedinStrategyValues>({ resolver: zodResolver(linkedinStrategySchema), defaultValues: emptyDefaults });

  useEffect(() => {
    if (open) {
      reset(
        strategy
          ? {
              name: strategy.name,
              goal: strategy.goal ?? "",
              postingFrequency: strategy.postingFrequency ?? "",
              targetAudience: strategy.targetAudience ?? "",
              primaryCta: strategy.primaryCta ?? "",
              successMetric: strategy.successMetric ?? "",
              status: strategy.status,
              pillarIds: strategy.pillars.map((p) => p.id),
            }
          : emptyDefaults,
      );
    }
  }, [open, strategy, reset]);

  const submit = async (values: LinkedinStrategyValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{strategy ? "Edit strategy" : "New strategy"}</SheetTitle>
          <SheetDescription>A strategy defines a goal, cadence, and audience for a set of pillars.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Authority Building" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input id="goal" placeholder="What is this strategy trying to achieve?" {...register("goal")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="postingFrequency">Posting frequency</Label>
              <Input id="postingFrequency" placeholder="e.g. 3x / week" {...register("postingFrequency")} />
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
                      {linkedinStrategyStatuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target audience</Label>
            <Input id="targetAudience" {...register("targetAudience")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryCta">Primary CTA</Label>
            <Input id="primaryCta" {...register("primaryCta")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="successMetric">Success metric</Label>
            <Input id="successMetric" placeholder="e.g. Inbound DMs per month" {...register("successMetric")} />
          </div>

          <div className="space-y-2">
            <Label>Linked pillars</Label>
            <Controller control={control} name="pillarIds" render={({ field }) => <PillarMultiSelect value={field.value} onChange={field.onChange} options={pillarOptions} />} />
          </div>

          <SheetFooter className="mt-auto flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {strategy ? "Save changes" : "Create strategy"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{strategy?.name}&rdquo;?</AlertDialogTitle>
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
