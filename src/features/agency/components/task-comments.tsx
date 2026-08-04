"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getAgencyTaskDetail, addAgencyTaskComment, deleteAgencyTaskComment } from "../actions/agency-tasks.actions";
import type { AgencyTaskComment } from "@/db/schema";

export function AgencyTaskComments({ taskId, initialComments }: { taskId: string; initialComments: AgencyTaskComment[] }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["agency-task-comments", taskId],
    queryFn: async () => (await getAgencyTaskDetail(taskId))?.comments ?? [],
    initialData: initialComments,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["agency-task-comments", taskId] });
    queryClient.invalidateQueries({ queryKey: ["agency-tasks"] });
  };

  const addMutation = useMutation({
    mutationFn: (body: string) => addAgencyTaskComment(taskId, body),
    onSuccess: () => {
      invalidate();
      setDraft("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgencyTaskComment(id),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Comments {comments.length > 0 && `(${comments.length})`}</p>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="group rounded-md border border-border p-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              <button type="button" className="shrink-0 opacity-0 group-hover:opacity-100" onClick={() => deleteMutation.mutate(c.id)}>
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </div>

      <div className="flex items-start gap-2">
        <Textarea
          placeholder="Leave a note for yourself — manager feedback, context, next steps..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button type="button" size="icon-sm" variant="outline" disabled={!draft.trim()} onClick={() => draft.trim() && addMutation.mutate(draft.trim())}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
