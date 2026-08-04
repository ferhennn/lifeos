"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, CalendarDays, Link as LinkIcon, ListChecks, ListTodo, Clock, Bug, Ban } from "lucide-react";
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
import { projectStatusConfig, agencyProjectHealthConfig } from "@/lib/status-config";
import { AgencyProjectFormSheet } from "./project-form-sheet";
import { updateAgencyProject, deleteAgencyProject, type AgencyProjectWithMeta } from "../actions/agency-projects.actions";
import type { AgencyProjectValues } from "../schema/agency-project.schema";

function StatTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function AgencyProjectDetail({ project }: { project: AgencyProjectWithMeta }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (values: AgencyProjectValues) => updateAgencyProject(project.id, values),
    onSuccess: () => {
      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["agency-projects"] });
      router.refresh();
    },
    onError: () => toast.error("Couldn't update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAgencyProject(project.id),
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["agency-projects"] });
      router.push("/agency/projects");
    },
    onError: () => toast.error("Couldn't delete project"),
  });

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          {project.client && <p className="text-xs text-muted-foreground">{project.client}</p>}
          <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
          {project.description && <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusBadge config={projectStatusConfig} status={project.status} />
            <StatusBadge config={agencyProjectHealthConfig} status={project.health} />
            {project.deadline && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80">
                <CalendarDays className="h-3 w-3" />
                {format(parseISO(project.deadline), "MMM d, yyyy")}
              </span>
            )}
          </div>
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.techStack.map((t) => (
                <span key={t} className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs">{t}</span>
              ))}
            </div>
          )}
          {((project.links && project.links.length > 0) || project.githubRepo) && (
            <div className="flex flex-wrap gap-3 pt-1">
              {project.githubRepo && (
                <a href={project.githubRepo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <LinkIcon className="h-3 w-3" /> GitHub
                </a>
              )}
              {project.links?.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile icon={ListChecks} label="Completed" value={project.completedTasks} />
        <StatTile icon={ListTodo} label="Remaining" value={project.remainingTasks} />
        <StatTile icon={Clock} label="Hours worked" value={project.hoursWorked} />
        <StatTile icon={Bug} label="Open bugs" value={project.openBugs} />
        <StatTile icon={Ban} label="Blocked" value={project.blockedTasks} />
      </div>

      <AgencyProjectFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={project}
        isPending={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{project.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This also removes its epics and detaches any linked tasks. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => deleteMutation.mutate()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
