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
import { AgencyProjectCard } from "./project-card";
import { AgencyProjectFormSheet } from "./project-form-sheet";
import { listAgencyProjects, createAgencyProject, updateAgencyProject, deleteAgencyProject, type AgencyProjectWithMeta } from "../actions/agency-projects.actions";
import type { AgencyProjectValues } from "../schema/agency-project.schema";

export function AgencyProjectsList({ initialProjects }: { initialProjects: AgencyProjectWithMeta[] }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingProject, setEditingProject] = useState<AgencyProjectWithMeta | null>(null);
  const [deletingProject, setDeletingProject] = useState<AgencyProjectWithMeta | null>(null);

  const { data: projectsData = [] } = useQuery({
    queryKey: ["agency-projects"],
    queryFn: listAgencyProjects,
    initialData: initialProjects,
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") router.replace("/agency/projects");
  }, [searchParams, router]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["agency-projects"] });
    queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: AgencyProjectValues) => createAgencyProject(values),
    onSuccess: () => {
      toast.success("Project created");
      invalidate();
    },
    onError: () => toast.error("Couldn't create project"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AgencyProjectValues }) => updateAgencyProject(id, values),
    onSuccess: () => {
      toast.success("Project updated");
      invalidate();
    },
    onError: () => toast.error("Couldn't update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgencyProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["agency-projects"] });
      const previous = queryClient.getQueryData<AgencyProjectWithMeta[]>(["agency-projects"]);
      queryClient.setQueryData<AgencyProjectWithMeta[]>(["agency-projects"], (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["agency-projects"], context?.previous);
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
          onClick={() => {
            setEditingProject(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {projectsData.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Projects organize your work into epics, tasks, and deadlines."
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
              <AgencyProjectCard
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

      <AgencyProjectFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editingProject}
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
            <AlertDialogDescription>This also removes its epics and detaches any linked tasks. This can&apos;t be undone.</AlertDialogDescription>
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
