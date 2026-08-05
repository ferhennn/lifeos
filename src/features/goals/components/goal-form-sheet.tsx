"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { cn } from "@/lib/utils";
import { goalSchema, goalCoverColors, goalPriorities, goalStatuses, type GoalValues } from "../schema/goal.schema";
import type { GoalWithProgress } from "../actions/goals.actions";

export function GoalFormSheet({
  open,
  onOpenChange,
  goal,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: GoalWithProgress | null;
  onSubmit: (values: GoalValues) => Promise<void> | void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      targetDate: "",
      priority: "medium",
      status: "active",
      coverColor: goalCoverColors[0],
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        goal
          ? {
              title: goal.title,
              description: goal.description ?? "",
              targetDate: goal.targetDate ?? "",
              priority: goal.priority,
              status: goal.status,
              coverColor: goal.coverColor,
            }
          : {
              title: "",
              description: "",
              targetDate: "",
              priority: "medium",
              status: "active",
              coverColor: goalCoverColors[0],
            },
      );
    }
  }, [open, goal, reset]);

  const submit = async (values: GoalValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save goal. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{goal ? "Edit goal" : "New goal"}</SheetTitle>
          <SheetDescription>
            {goal ? "Update the details of this goal." : "Every strategy and task will trace back to this goal."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Get 3 Freelance Clients" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} placeholder="What does success look like?" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalPriorities.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalStatuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target date</Label>
            <Controller
              control={control}
              name="targetDate"
              render={({ field }) => (
                <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover color</Label>
            <Controller
              control={control}
              name="coverColor"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {goalCoverColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={cn(
                        "h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
                        field.value === color && "ring-2 ring-foreground",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {goal ? "Save changes" : "Create goal"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
