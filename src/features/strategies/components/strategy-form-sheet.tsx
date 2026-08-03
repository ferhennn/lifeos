"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
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
import {
  strategySchema,
  strategyPriorities,
  strategyStatuses,
  recurrenceTypes,
  taskPriorities,
  type StrategyValues,
} from "../schema/strategy.schema";
import { weekdayLabels } from "../lib/recurrence";
import type { StrategyWithMeta } from "../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";
import { recurrenceLabels } from "@/lib/status-config";

const emptyDefaults: StrategyValues = {
  goalId: "",
  title: "",
  description: "",
  expectedOutcome: "",
  successMetrics: "",
  estimatedEffort: "",
  priority: "medium",
  status: "active",
  recurrenceType: "none",
  weeklyDays: [],
  monthlyDay: undefined,
  customDates: [],
  taskTitle: "",
  taskPriority: "medium",
  taskEstimatedTime: undefined,
};

function strategyToValues(strategy: StrategyWithMeta): StrategyValues {
  const config = strategy.recurrenceConfig;
  return {
    goalId: strategy.goalId,
    title: strategy.title,
    description: strategy.description ?? "",
    expectedOutcome: strategy.expectedOutcome ?? "",
    successMetrics: strategy.successMetrics ?? "",
    estimatedEffort: strategy.estimatedEffort ?? "",
    priority: strategy.priority,
    status: strategy.status,
    recurrenceType: strategy.recurrenceType,
    weeklyDays: config?.type === "weekly" ? config.daysOfWeek : [],
    monthlyDay: config?.type === "monthly" ? config.dayOfMonth : undefined,
    customDates: config?.type === "custom" ? config.dates : [],
    taskTitle: strategy.taskTemplate?.title ?? "",
    taskPriority: strategy.taskTemplate?.priority ?? "medium",
    taskEstimatedTime: strategy.taskTemplate?.estimatedTime ?? undefined,
  };
}

export function StrategyFormSheet({
  open,
  onOpenChange,
  strategy,
  goalOptions,
  defaultGoalId,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: StrategyWithMeta | null;
  goalOptions: GoalOption[];
  defaultGoalId?: string;
  onSubmit: (values: StrategyValues) => Promise<void> | void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<StrategyValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: emptyDefaults,
  });

  const recurrenceType = watch("recurrenceType");

  useEffect(() => {
    if (open) {
      reset(
        strategy
          ? strategyToValues(strategy)
          : { ...emptyDefaults, goalId: defaultGoalId ?? goalOptions[0]?.id ?? "" },
      );
    }
  }, [open, strategy, defaultGoalId, goalOptions, reset]);

  const submit = async (values: StrategyValues) => {
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
          <SheetDescription>
            Strategies generate recurring work. Set a cadence and every occurrence becomes a task automatically.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label>Goal</Label>
            <Controller
              control={control}
              name="goalId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalOptions.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.coverColor }} />
                        {g.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.goalId && <p className="text-xs text-destructive">{errors.goalId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Cold Outreach" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expectedOutcome">Expected outcome</Label>
              <Input id="expectedOutcome" placeholder="3 replies / week" {...register("expectedOutcome")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="successMetrics">Success metric</Label>
              <Input id="successMetrics" placeholder="Reply rate > 10%" {...register("successMetrics")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estimatedEffort">Effort</Label>
              <Input id="estimatedEffort" placeholder="30 min/day" {...register("estimatedEffort")} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {strategyPriorities.map((p) => (
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {strategyStatuses.map((s) => (
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

          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Controller
                control={control}
                name="recurrenceType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceTypes.map((r) => (
                        <SelectItem key={r} value={r}>
                          {recurrenceLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {recurrenceType === "weekly" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Repeats on</Label>
                <Controller
                  control={control}
                  name="weeklyDays"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {weekdayLabels.map((label, idx) => {
                        const active = field.value.includes(idx);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                active ? field.value.filter((d) => d !== idx) : [...field.value, idx].sort(),
                              )
                            }
                            className={cn(
                              "h-8 w-9 rounded-md border text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.weeklyDays && <p className="text-xs text-destructive">{errors.weeklyDays.message}</p>}
              </div>
            )}

            {recurrenceType === "monthly" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Day of month</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  {...register("monthlyDay", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                  className="w-24"
                />
                {errors.monthlyDay && <p className="text-xs text-destructive">{errors.monthlyDay.message}</p>}
              </div>
            )}

            {recurrenceType === "custom" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Specific dates</Label>
                <Controller
                  control={control}
                  name="customDates"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {field.value.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs"
                          >
                            {d}
                            <button
                              type="button"
                              onClick={() => field.onChange(field.value.filter((x) => x !== d))}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <DatePickerField
                        value={undefined}
                        onChange={(v) => {
                          if (v && !field.value.includes(v)) field.onChange([...field.value, v].sort());
                        }}
                        placeholder="Add a date"
                        className="w-48"
                      />
                    </div>
                  )}
                />
                {errors.customDates && <p className="text-xs text-destructive">{errors.customDates.message}</p>}
              </div>
            )}

            {recurrenceType !== "none" && (
              <div className="space-y-3 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">Generated task template</p>
                <div className="space-y-2">
                  <Input placeholder={`Defaults to "${watch("title") || "strategy title"}"`} {...register("taskTitle")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    control={control}
                    name="taskPriority"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {taskPriorities.map((p) => (
                            <SelectItem key={p} value={p} className="capitalize">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Est. minutes"
                    {...register("taskEstimatedTime", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                  />
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {strategy ? "Save changes" : "Create strategy"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
