"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAgencyTaskDetail, addAgencyChecklistItem, toggleAgencyChecklistItem, deleteAgencyChecklistItem } from "../actions/agency-tasks.actions";
import type { AgencyTaskChecklistItem } from "@/db/schema";

export function AgencyTaskChecklist({ taskId, initialItems }: { taskId: string; initialItems: AgencyTaskChecklistItem[] }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["agency-task-checklist", taskId],
    queryFn: async () => (await getAgencyTaskDetail(taskId))?.checklist ?? [],
    initialData: initialItems,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["agency-task-checklist", taskId] });
    queryClient.invalidateQueries({ queryKey: ["agency-tasks"] });
  };

  const addMutation = useMutation({
    mutationFn: (title: string) => addAgencyChecklistItem(taskId, title),
    onSuccess: () => {
      invalidate();
      setDraft("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) => toggleAgencyChecklistItem(id, isDone),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgencyChecklistItem(id),
    onSuccess: invalidate,
  });

  const done = items.filter((i) => i.isDone).length;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Checklist {items.length > 0 && `(${done}/${items.length})`}
      </p>

      <div className="space-y-1">
        {items.map((i) => (
          <div key={i.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50">
            <Checkbox checked={i.isDone} onCheckedChange={(checked) => toggleMutation.mutate({ id: i.id, isDone: !!checked })} />
            <span className={i.isDone ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>{i.title}</span>
            <button type="button" className="opacity-0 group-hover:opacity-100" onClick={() => deleteMutation.mutate(i.id)}>
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
        <Button type="button" size="icon-sm" variant="outline" disabled={!draft.trim()} onClick={() => draft.trim() && addMutation.mutate(draft.trim())}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
