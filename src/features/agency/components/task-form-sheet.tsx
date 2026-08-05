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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { cn } from "@/lib/utils";
import {
  agencyTaskSchema,
  agencyTaskStatuses,
  agencyTaskPriorities,
  agencyTaskTypes,
  type AgencyTaskValues,
} from "../schema/agency-task.schema";
import type { AgencyTaskDetail, AgencyTaskOption } from "../actions/agency-tasks.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";
import type { AgencyProjectOption, AgencyEpicOption } from "../actions/agency-projects.actions";
import { agencyTaskStatusConfig, agencyTaskPriorityConfig, agencyTaskTypeLabels } from "@/lib/status-config";
import { AgencyTaskChecklist } from "./task-checklist";
import { AgencyTaskComments } from "./task-comments";

const emptyDefaults: AgencyTaskValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  taskType: "feature",
  dueDate: "",
  startDate: "",
  completedDate: "",
  estimatedTime: undefined,
  actualTime: undefined,
  labels: [],
  clientName: "",
  manager: "",
  assignee: "",
  githubUrl: "",
  prUrl: "",
  slackThreadUrl: "",
  figmaUrl: "",
  vercelPreviewUrl: "",
  productionUrl: "",
  goalId: "",
  agencyProjectId: "",
  agencyEpicId: "",
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
  options: AgencyTaskOption[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => value.includes(o.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal" />}>
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
                    <CommandItem key={option.id} onSelect={() => onChange(active ? value.filter((v) => v !== option.id) : [...value, option.id])}>
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

export function AgencyTaskFormSheet({
  open,
  onOpenChange,
  task,
  goalOptions,
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
  task?: AgencyTaskDetail | null;
  goalOptions: GoalOption[];
  projectOptions: AgencyProjectOption[];
  epicOptions: AgencyEpicOption[];
  taskOptions: AgencyTaskOption[];
  defaults?: Partial<AgencyTaskValues>;
  onSubmit: (values: AgencyTaskValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isPending: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("details");
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgencyTaskValues>({
    resolver: zodResolver(agencyTaskSchema),
    defaultValues: emptyDefaults,
  });

  const projectId = watch("agencyProjectId");
  const filteredEpics = useMemo(() => (projectId ? epicOptions.filter((e) => e.projectId === projectId) : epicOptions), [epicOptions, projectId]);

  useEffect(() => {
    if (open) {
      setTab("details");
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? "",
              status: task.status,
              priority: task.priority,
              taskType: task.taskType,
              dueDate: task.dueDate ?? "",
              startDate: task.startDate ?? "",
              completedDate: task.completedDate ?? "",
              estimatedTime: task.estimatedTime ?? undefined,
              actualTime: task.actualTime ?? undefined,
              labels: task.labels ?? [],
              clientName: task.clientName ?? "",
              manager: task.manager ?? "",
              assignee: task.assignee ?? "",
              githubUrl: task.githubUrl ?? "",
              prUrl: task.prUrl ?? "",
              slackThreadUrl: task.slackThreadUrl ?? "",
              figmaUrl: task.figmaUrl ?? "",
              vercelPreviewUrl: task.vercelPreviewUrl ?? "",
              productionUrl: task.productionUrl ?? "",
              goalId: task.goalId ?? "",
              agencyProjectId: task.agencyProjectId ?? "",
              agencyEpicId: task.agencyEpicId ?? "",
              dependsOn: task.dependsOn.map((d) => d.id),
            }
          : { ...emptyDefaults, dueDate: format(new Date(), "yyyy-MM-dd"), ...defaults },
      );
    }
  }, [open, task, defaults, reset]);

  const submit = async (values: AgencyTaskValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save task. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{task ? "Edit task" : "New task"}</SheetTitle>
          <SheetDescription>Everything you need to know about this piece of work, in one place.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col overflow-hidden px-4">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="links">Links &amp; Context</TabsTrigger>
              <TabsTrigger value="checklist" disabled={!task}>Checklist</TabsTrigger>
              <TabsTrigger value="comments" disabled={!task}>Comments</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="What needs to happen?" {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={3} {...register("description")} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {agencyTaskStatuses.map((s) => (
                              <SelectItem key={s} value={s}>{agencyTaskStatusConfig[s]?.label ?? s}</SelectItem>
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
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {agencyTaskPriorities.map((p) => (
                              <SelectItem key={p} value={p}>{agencyTaskPriorityConfig[p]?.label ?? p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Controller
                      control={control}
                      name="taskType"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {agencyTaskTypes.map((t) => (
                              <SelectItem key={t} value={t}>{agencyTaskTypeLabels[t] ?? t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <Controller control={control} name="startDate" render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />} />
                  </div>
                  <div className="space-y-2">
                    <Label>Due date</Label>
                    <Controller control={control} name="dueDate" render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />} />
                  </div>
                  <div className="space-y-2">
                    <Label>Completed date</Label>
                    <Controller control={control} name="completedDate" render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated (min)</Label>
                    <Input id="estimatedTime" type="number" min={0} {...register("estimatedTime", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actualTime">Actual (min)</Label>
                    <Input id="actualTime" type="number" min={0} {...register("actualTime", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Labels</Label>
                  <Controller control={control} name="labels" render={({ field }) => <LabelsInput value={field.value} onChange={field.onChange} />} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client</Label>
                    <Input id="clientName" {...register("clientName")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Input id="manager" {...register("manager")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input id="assignee" {...register("assignee")} />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Why this task exists</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Goal</Label>
                      <Controller
                        control={control}
                        name="goalId"
                        render={({ field }) => (
                          <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
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
                      <Label className="text-xs">Project</Label>
                      <Controller
                        control={control}
                        name="agencyProjectId"
                        render={({ field }) => (
                          <Select
                            value={field.value || "__none"}
                            onValueChange={(v) => {
                              field.onChange(v === "__none" ? "" : v);
                              setValue("agencyEpicId", "");
                            }}
                          >
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">None</SelectItem>
                              {projectOptions.map((p) => (
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
                        name="agencyEpicId"
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
                  <Label>Depends on</Label>
                  <Controller control={control} name="dependsOn" render={({ field }) => <DependsOnPicker value={field.value} onChange={field.onChange} options={taskOptions.filter((o) => o.id !== task?.id)} />} />
                </div>
              </TabsContent>

              <TabsContent value="links" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub Link</Label>
                  <Input id="githubUrl" placeholder="https://github.com/..." {...register("githubUrl")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prUrl">Pull Request Link</Label>
                  <Input id="prUrl" placeholder="https://github.com/.../pull/..." {...register("prUrl")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slackThreadUrl">Slack Thread Link</Label>
                  <Input id="slackThreadUrl" placeholder="https://slack.com/..." {...register("slackThreadUrl")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="figmaUrl">Figma Link</Label>
                  <Input id="figmaUrl" placeholder="https://figma.com/..." {...register("figmaUrl")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vercelPreviewUrl">Vercel Preview Link</Label>
                  <Input id="vercelPreviewUrl" placeholder="https://....vercel.app" {...register("vercelPreviewUrl")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productionUrl">Production Link</Label>
                  <Input id="productionUrl" placeholder="https://..." {...register("productionUrl")} />
                </div>
              </TabsContent>

              <TabsContent value="checklist">
                {task && <AgencyTaskChecklist taskId={task.id} initialItems={task.checklist} />}
              </TabsContent>

              <TabsContent value="comments">
                {task && <AgencyTaskComments taskId={task.id} initialComments={task.comments} />}
              </TabsContent>
            </div>
          </Tabs>

          <SheetFooter className="flex-row px-0">
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
