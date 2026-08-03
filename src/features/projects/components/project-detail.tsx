"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, CalendarDays, Link as LinkIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { projectStatusConfig } from "@/lib/status-config";
import { ProjectFormSheet } from "./project-form-sheet";
import { updateProject, deleteProject, type ProjectWithMeta } from "../actions/projects.actions";
import type { ProjectValues } from "../schema/project.schema";
import type { StrategyOption } from "@/features/strategies/actions/strategies.actions";

export function ProjectDetail({
  project,
  strategyOptions,
}: {
  project: ProjectWithMeta;
  strategyOptions: StrategyOption[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (values: ProjectValues) => updateProject(project.id, values),
    onSuccess: () => {
      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.refresh();
    },
    onError: () => toast.error("Couldn't update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    },
    onError: () => toast.error("Couldn't delete project"),
  });

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.goalCoverColor }} />
            {project.goalTitle} / {project.strategyTitle}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
          {project.description && <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusBadge config={projectStatusConfig} status={project.status} />
            {project.deadline && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80">
                <CalendarDays className="h-3 w-3" />
                {format(parseISO(project.deadline), "MMM d, yyyy")}
              </span>
            )}
          </div>
          {project.links && project.links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <LinkIcon className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{project.progress}% of {project.totalTasks} tasks complete</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      <ProjectFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={project}
        strategyOptions={strategyOptions}
        isPending={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{project.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes its epics and detaches any linked tasks. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
