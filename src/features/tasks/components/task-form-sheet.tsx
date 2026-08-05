"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, X, ChevronsUpDown, Check, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { cn } from "@/lib/utils";
import { taskSchema, taskStatuses, taskPriorities, taskRepeatTypes, type TaskValues } from "../schema/task.schema";
import type { TaskDetail } from "../actions/tasks.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";
import type { StrategyOption } from "@/features/strategies/actions/strategies.actions";
import type { ProjectOption, EpicOption } from "@/features/projects/actions/projects.actions";
import type { TaskOption } from "../actions/tasks.actions";
import { taskStatusConfig } from "@/lib/status-config";
import { SubtasksChecklist } from "./subtasks-checklist";

const emptyDefaults: TaskValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  estimatedTime: undefined,
  actualTime: undefined,
  labels: [],
  goalId: "",
  strategyId: "",
  projectId: "",
  epicId: "",
  repeatType: "none",
  reminderAt: "",
  dependsOn: [],
};

function LabelsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((label) => (
          <span key={label} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
            {label}
            <button type="button" onClick={() => onChange(value.filter((l) => l !== label))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Type a label and press Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            if (!value.includes(draft.trim())) onChange([...value, draft.trim()]);
            setDraft("");
          }
        }}
      />
    </div>
  );
}

function DependsOnPicker({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: TaskOption[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => value.includes(o.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button type="button" variant="outline" className="w-full justify-between font-normal" />}
        >
          {value.length > 0 ? `${value.length} task${value.length === 1 ? "" : "s"} selected` : "Select dependencies"}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Search tasks..." />
            <CommandList>
              <CommandEmpty>No tasks found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const active = value.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => onChange(active ? value.filter((v) => v !== option.id) : [...value, option.id])}
                    >
                      <Check className={cn("h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                      {option.title}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
              {s.title}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== s.id))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
  goalOptions,
  strategyOptions,
  projectOptions,
  epicOptions,
  taskOptions,
  defaults,
  onSubmit,
  onDelete,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskDetail | null;
  goalOptions: GoalOption[];
  strategyOptions: StrategyOption[];
  projectOptions: ProjectOption[];
  epicOptions: EpicOption[];
  taskOptions: TaskOption[];
  defaults?: Partial<TaskValues>;
  onSubmit: (values: TaskValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isPending: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyDefaults,
  });

  const goalId = watch("goalId");
  const strategyId = watch("strategyId");
  const projectId = watch("projectId");

  const filteredStrategies = useMemo(
    () => (goalId ? strategyOptions.filter((s) => s.goalId === goalId) : strategyOptions),
    [strategyOptions, goalId],
  );
  const filteredProjects = useMemo(
    () => (strategyId ? projectOptions.filter((p) => p.strategyId === strategyId) : projectOptions),
    [projectOptions, strategyId],
  );
  const filteredEpics = useMemo(
    () => (projectId ? epicOptions.filter((e) => e.projectId === projectId) : epicOptions),
    [epicOptions, projectId],
  );

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? "",
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate ?? "",
              estimatedTime: task.estimatedTime ?? undefined,
              actualTime: task.actualTime ?? undefined,
              labels: task.labels ?? [],
              goalId: task.goalId ?? "",
              strategyId: task.strategyId ?? "",
              projectId: task.projectId ?? "",
              epicId: task.epicId ?? "",
              repeatType: task.repeatRule?.type === "custom" ? "none" : (task.repeatRule?.type ?? "none"),
              reminderAt: task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : "",
              dependsOn: task.dependsOn.map((d) => d.id),
            }
          : { ...emptyDefaults, dueDate: format(new Date(), "yyyy-MM-dd"), ...defaults },
      );
    }
  }, [open, task, defaults, reset]);

  const submit = async (values: TaskValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save task. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{task ? "Edit task" : "New task"}</SheetTitle>
          <SheetDescription>Every task should know why it exists — link it to a goal, strategy, or project.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What needs to happen?" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                      {taskStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {taskStatusConfig[s]?.label ?? s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
                      {taskPriorities.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Due date</Label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderAt">Reminder</Label>
              <Input id="reminderAt" type="datetime-local" {...register("reminderAt")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated (min)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min={0}
                {...register("estimatedTime", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualTime">Actual (min)</Label>
              <Input
                id="actualTime"
                type="number"
                min={0}
                {...register("actualTime", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Labels</Label>
            <Controller control={control} name="labels" render={({ field }) => <LabelsInput value={field.value} onChange={field.onChange} />} />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Why this task exists</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Goal</Label>
                <Controller
                  control={control}
                  name="goalId"
                  render={({ field }) => (
                    <Select
                      value={field.value || "__none"}
                      onValueChange={(v) => {
                        field.onChange(v === "__none" ? "" : v);
                        setValue("strategyId", "");
                        setValue("projectId", "");
                        setValue("epicId", "");
                      }}
                    >
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {goalOptions.map((g) => (
                          <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Strategy</Label>
                <Controller
                  control={control}
                  name="strategyId"
                  render={({ field }) => (
                    <Select
                      value={field.value || "__none"}
                      onValueChange={(v) => {
                        field.onChange(v === "__none" ? "" : v);
                        setValue("projectId", "");
                        setValue("epicId", "");
                      }}
                    >
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {filteredStrategies.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Project</Label>
                <Controller
                  control={control}
                  name="projectId"
                  render={({ field }) => (
                    <Select
                      value={field.value || "__none"}
                      onValueChange={(v) => {
                        field.onChange(v === "__none" ? "" : v);
                        setValue("epicId", "");
                      }}
                    >
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {filteredProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Epic</Label>
                <Controller
                  control={control}
                  name="epicId"
                  render={({ field }) => (
                    <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {filteredEpics.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Controller
              control={control}
              name="repeatType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {taskRepeatTypes.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {task && (
            <div className="rounded-lg border border-border p-3">
              <SubtasksChecklist taskId={task.id} initialSubtasks={task.subtasks} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Depends on</Label>
            <Controller
              control={control}
              name="dependsOn"
              render={({ field }) => <DependsOnPicker value={field.value} onChange={field.onChange} options={taskOptions} />}
            />
          </div>

          <SheetFooter className="mt-auto flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{task?.title}&rdquo;?</AlertDialogTitle>
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
