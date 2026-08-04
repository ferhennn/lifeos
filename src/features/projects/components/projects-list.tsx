"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "./project-card";
import { ProjectFormSheet } from "./project-form-sheet";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  type ProjectWithMeta,
} from "../actions/projects.actions";
import type { ProjectValues } from "../schema/project.schema";
import type { StrategyOption } from "@/features/strategies/actions/strategies.actions";
import { AgencyProjectCard } from "@/features/agency/components/project-card";
import { listAgencyProjects, type AgencyProjectWithMeta } from "@/features/agency/actions/agency-projects.actions";
import { projectStatusConfig } from "@/lib/status-config";

type WorkspaceFilter = "all" | "lifeos" | "agency";

export function ProjectsList({
  initialProjects,
  strategyOptions,
  initialAgencyProjects,
}: {
  initialProjects: ProjectWithMeta[];
  strategyOptions: StrategyOption[];
  initialAgencyProjects: AgencyProjectWithMeta[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingProject, setEditingProject] = useState<ProjectWithMeta | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithMeta | null>(null);
  const [defaultStrategyId, setDefaultStrategyId] = useState<string | undefined>(() => searchParams.get("strategyId") ?? undefined);
  const [workspaceFilter, setWorkspaceFilter] = useState<WorkspaceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: projectsData = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    initialData: initialProjects,
  });

  const { data: agencyProjectsData = [] } = useQuery({
    queryKey: ["agency-projects"],
    queryFn: listAgencyProjects,
    initialData: initialAgencyProjects,
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/projects");
    }
  }, [searchParams, router]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: ProjectValues) => createProject(values),
    onSuccess: () => {
      toast.success("Project created");
      invalidate();
    },
    onError: () => toast.error("Couldn't create project"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProjectValues }) => updateProject(id, values),
    onSuccess: () => {
      toast.success("Project updated");
      invalidate();
    },
    onError: () => toast.error("Couldn't update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<ProjectWithMeta[]>(["projects"]);
      queryClient.setQueryData<ProjectWithMeta[]>(["projects"], (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["projects"], context?.previous);
      toast.error("Couldn't delete project");
    },
    onSuccess: () => toast.success("Project deleted"),
    onSettled: () => invalidate(),
  });

  type MergedProject =
    | { workspace: "lifeos"; id: string; status: string; createdAt: string | Date; data: ProjectWithMeta }
    | { workspace: "agency"; id: string; status: string; createdAt: string | Date; data: AgencyProjectWithMeta };

  const merged = useMemo<MergedProject[]>(() => {
    const lifeos: MergedProject[] = projectsData.map((p) => ({ workspace: "lifeos", id: p.id, status: p.status, createdAt: p.createdAt, data: p }));
    const agency: MergedProject[] = agencyProjectsData.map((p) => ({ workspace: "agency", id: p.id, status: p.status, createdAt: p.createdAt, data: p }));
    return [...lifeos, ...agency]
      .filter((p) => workspaceFilter === "all" || p.workspace === workspaceFilter)
      .filter((p) => statusFilter === "all" || p.status === statusFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projectsData, agencyProjectsData, workspaceFilter, statusFilter]);

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {merged.length} project{merged.length === 1 ? "" : "s"}
          </p>
          <Select value={workspaceFilter} onValueChange={(v) => setWorkspaceFilter((v as WorkspaceFilter) ?? "all")}>
            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All workspaces</SelectItem>
              <SelectItem value="lifeos">LifeOS</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(projectStatusConfig).map(([value, cfg]) => (
                <SelectItem key={value} value={value}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          disabled={strategyOptions.length === 0}
          onClick={() => {
            setEditingProject(null);
            setDefaultStrategyId(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {merged.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            strategyOptions.length === 0
              ? "Projects belong to a strategy. Head to Strategies to create one, or start one in the Agency workspace."
              : "Projects organize a strategy's work into epics, tasks, files, and deadlines."
          }
          action={
            strategyOptions.length > 0 ? (
              <Button size="sm" onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4" /> Create your first project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {merged.map((p) =>
              p.workspace === "lifeos" ? (
                <ProjectCard
                  key={`lifeos-${p.id}`}
                  project={p.data}
                  onEdit={() => {
                    setEditingProject(p.data);
                    setSheetOpen(true);
                  }}
                  onDelete={() => setDeletingProject(p.data)}
                />
              ) : (
                <AgencyProjectCard key={`agency-${p.id}`} project={p.data} readOnly />
              ),
            )}
          </AnimatePresence>
        </div>
      )}

      <ProjectFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editingProject}
        strategyOptions={strategyOptions}
        defaultStrategyId={defaultStrategyId}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editingProject) {
            await updateMutation.mutateAsync({ id: editingProject.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deletingProject?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes its epics and detaches any linked tasks. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deletingProject) deleteMutation.mutate(deletingProject.id);
                setDeletingProject(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
