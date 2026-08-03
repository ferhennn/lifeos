"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, GripVertical, ArrowUp, ArrowDown, Pencil, Trash2, Check, X, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  listEpics,
  createEpic,
  renameEpic,
  reorderEpic,
  deleteEpic,
} from "../actions/projects.actions";
import type { Epic } from "@/db/schema";

function EpicRow({
  epic,
  projectId,
  isFirst,
  isLast,
}: {
  epic: Epic;
  projectId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(epic.title);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["epics", projectId] });

  const renameMutation = useMutation({
    mutationFn: () => renameEpic(epic.id, projectId, { title }),
    onSuccess: () => {
      invalidate();
      setEditing(false);
    },
    onError: () => toast.error("Couldn't rename epic"),
  });

  const reorderMutation = useMutation({
    mutationFn: (direction: "up" | "down") => reorderEpic(epic.id, projectId, direction),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEpic(epic.id, projectId),
    onSuccess: () => {
      toast.success("Epic deleted");
      invalidate();
    },
    onError: () => toast.error("Couldn't delete epic"),
  });

  return (
    <div className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
      {editing ? (
        <>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") renameMutation.mutate();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <Button size="icon-sm" variant="ghost" onClick={() => renameMutation.mutate()}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{epic.title}</span>
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="icon-sm" variant="ghost" disabled={isFirst} onClick={() => reorderMutation.mutate("up")}>
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon-sm" variant="ghost" disabled={isLast} onClick={() => reorderMutation.mutate("down")}>
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => deleteMutation.mutate()}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function EpicsPanel({ projectId, initialEpics }: { projectId: string; initialEpics: Epic[] }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");

  const { data: epicsData = [] } = useQuery({
    queryKey: ["epics", projectId],
    queryFn: () => listEpics(projectId),
    initialData: initialEpics,
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createEpic(projectId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] });
      setNewTitle("");
    },
    onError: () => toast.error("Couldn't create epic"),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add an epic — e.g. Landing Page, Case Studies, SEO"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTitle.trim()) createMutation.mutate(newTitle.trim());
          }}
        />
        <Button
          variant="outline"
          disabled={!newTitle.trim() || createMutation.isPending}
          onClick={() => newTitle.trim() && createMutation.mutate(newTitle.trim())}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {epicsData.length === 0 ? (
        <EmptyState icon={Layers} title="No epics yet" description="Break this project into epics to group related tasks." />
      ) : (
        <div className="space-y-1.5">
          {epicsData.map((epic, i) => (
            <EpicRow
              key={epic.id}
              epic={epic}
              projectId={projectId}
              isFirst={i === 0}
              isLast={i === epicsData.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
