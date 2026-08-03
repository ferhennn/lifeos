"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export function ProjectsList({
  initialProjects,
  strategyOptions,
}: {
  initialProjects: ProjectWithMeta[];
  strategyOptions: StrategyOption[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingProject, setEditingProject] = useState<ProjectWithMeta | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithMeta | null>(null);
  const [defaultStrategyId, setDefaultStrategyId] = useState<string | undefined>(() => searchParams.get("strategyId") ?? undefined);

  const { data: projectsData = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    initialData: initialProjects,
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

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projectsData.length} project{projectsData.length === 1 ? "" : "s"}
        </p>
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

      {strategyOptions.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Create a strategy first"
          description="Projects belong to a strategy. Head to Strategies to create one, then come back here."
        />
      ) : projectsData.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Projects organize a strategy's work into epics, tasks, files, and deadlines."
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" /> Create your first project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projectsData.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => {
                  setEditingProject(project);
                  setSheetOpen(true);
                }}
                onDelete={() => setDeletingProject(project)}
              />
            ))}
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
