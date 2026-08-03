"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X, Link as LinkIcon } from "lucide-react";
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
import { projectSchema, projectStatuses, type ProjectValues } from "../schema/project.schema";
import type { ProjectWithMeta } from "../actions/projects.actions";
import type { StrategyOption } from "@/features/strategies/actions/strategies.actions";

const emptyDefaults: ProjectValues = {
  strategyId: "",
  title: "",
  description: "",
  status: "planning",
  deadline: "",
  links: [],
};

export function ProjectFormSheet({
  open,
  onOpenChange,
  project,
  strategyOptions,
  defaultStrategyId,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectWithMeta | null;
  strategyOptions: StrategyOption[];
  defaultStrategyId?: string;
  onSubmit: (values: ProjectValues) => Promise<void> | void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyDefaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              strategyId: project.strategyId,
              title: project.title,
              description: project.description ?? "",
              status: project.status,
              deadline: project.deadline ?? "",
              links: project.links ?? [],
            }
          : { ...emptyDefaults, strategyId: defaultStrategyId ?? strategyOptions[0]?.id ?? "" },
      );
    }
  }, [open, project, defaultStrategyId, strategyOptions, reset]);

  const submit = async (values: ProjectValues) => {
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
          <SheetTitle>{project ? "Edit project" : "New project"}</SheetTitle>
          <SheetDescription>Projects organize a strategy&apos;s work into epics and tasks.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Controller
              control={control}
              name="strategyId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategyOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.goalCoverColor }} />
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.strategyId && <p className="text-xs text-destructive">{errors.strategyId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Landing Page" {...register("title")} />
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
                      {projectStatuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Controller
                control={control}
                name="deadline"
                render={({ field }) => (
                  <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Links</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => append({ label: "", url: "" })}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <Input placeholder="Label" className="w-24" {...register(`links.${index}.label`)} />
                  <Input placeholder="https://..." {...register(`links.${index}.url`)} />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.links && <p className="text-xs text-destructive">Check your link URLs</p>}
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {project ? "Save changes" : "Create project"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
