"use client";

import { useEffect, useState } from "react";
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
import { agencyProjectSchema, agencyProjectStatuses, agencyProjectHealths, type AgencyProjectValues } from "../schema/agency-project.schema";
import type { AgencyProjectWithMeta } from "../actions/agency-projects.actions";
import { projectStatusConfig, agencyProjectHealthConfig } from "@/lib/status-config";

const emptyDefaults: AgencyProjectValues = {
  title: "",
  description: "",
  client: "",
  status: "planning",
  health: "on_track",
  deadline: "",
  githubRepo: "",
  techStack: [],
  links: [],
};

function TechStackInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tech) => (
          <span key={tech} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
            {tech}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tech))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Type a technology and press Enter"
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

export function AgencyProjectFormSheet({
  open,
  onOpenChange,
  project,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: AgencyProjectWithMeta | null;
  onSubmit: (values: AgencyProjectValues) => Promise<void> | void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AgencyProjectValues>({
    resolver: zodResolver(agencyProjectSchema),
    defaultValues: emptyDefaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              title: project.title,
              description: project.description ?? "",
              client: project.client ?? "",
              status: project.status,
              health: project.health,
              deadline: project.deadline ?? "",
              githubRepo: project.githubRepo ?? "",
              techStack: project.techStack ?? [],
              links: project.links ?? [],
            }
          : emptyDefaults,
      );
    }
  }, [open, project, reset]);

  const submit = async (values: AgencyProjectValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save project. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{project ? "Edit project" : "New project"}</SheetTitle>
          <SheetDescription>Everything about this client engagement, in one place.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Acme Corp Redesign" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input id="client" placeholder="e.g. Acme Corp" {...register("client")} />
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
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agencyProjectStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{projectStatusConfig[s]?.label ?? s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Health</Label>
              <Controller
                control={control}
                name="health"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agencyProjectHealths.map((h) => (
                        <SelectItem key={h} value={h}>{agencyProjectHealthConfig[h]?.label ?? h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deadline</Label>
            <Controller control={control} name="deadline" render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubRepo">GitHub Repository</Label>
            <Input id="githubRepo" placeholder="https://github.com/..." {...register("githubRepo")} />
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <Controller control={control} name="techStack" render={({ field }) => <TechStackInput value={field.value} onChange={field.onChange} />} />
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
