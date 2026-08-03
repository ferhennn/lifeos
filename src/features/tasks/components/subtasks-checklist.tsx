"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTaskDetail, addSubtask, toggleSubtask, deleteSubtask } from "../actions/tasks.actions";
import type { Subtask } from "@/db/schema";

export function SubtasksChecklist({ taskId, initialSubtasks }: { taskId: string; initialSubtasks: Subtask[] }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: async () => (await getTaskDetail(taskId))?.subtasks ?? [],
    initialData: initialSubtasks,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const addMutation = useMutation({
    mutationFn: (title: string) => addSubtask(taskId, title),
    onSuccess: () => {
      invalidate();
      setDraft("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) => toggleSubtask(id, isDone),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubtask(id),
    onSuccess: invalidate,
  });

  const done = subtasks.filter((s) => s.isDone).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Checklist {subtasks.length > 0 && `(${done}/${subtasks.length})`}
        </p>
      </div>

      <div className="space-y-1">
        {subtasks.map((s) => (
          <div key={s.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50">
            <Checkbox
              checked={s.isDone}
              onCheckedChange={(checked) => toggleMutation.mutate({ id: s.id, isDone: !!checked })}
            />
            <span className={s.isDone ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>
              {s.title}
            </span>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => deleteMutation.mutate(s.id)}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a checklist item"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-8"
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              addMutation.mutate(draft.trim());
            }
          }}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          disabled={!draft.trim()}
          onClick={() => draft.trim() && addMutation.mutate(draft.trim())}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
