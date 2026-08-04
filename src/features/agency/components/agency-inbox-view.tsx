"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Plus, ArrowRight, Users, NotebookText, FolderKanban, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { agencyInboxSourceLabels } from "@/lib/status-config";
import { listInboxTasks, convertInboxToMeeting, convertInboxToNote, convertInboxToProject, type InboxItem } from "../actions/agency-inbox.actions";
import { quickCaptureAgencyTask, updateAgencyTaskStatus, deleteAgencyTask } from "../actions/agency-tasks.actions";
import type { AgencyTask } from "@/db/schema";

const sourceTypes = Object.keys(agencyInboxSourceLabels) as (keyof typeof agencyInboxSourceLabels)[];

export function AgencyInboxView({ initialItems }: { initialItems: InboxItem[] }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<string>("other");

  const { data: items = [] } = useQuery({
    queryKey: ["agency-inbox"],
    queryFn: listInboxTasks,
    initialData: initialItems,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["agency-inbox"] });
    queryClient.invalidateQueries({ queryKey: ["agency-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
  };

  const captureMutation = useMutation({
    mutationFn: () => quickCaptureAgencyTask({ title: title.trim() }, sourceType as AgencyTask["sourceType"]),
    onSuccess: () => {
      setTitle("");
      invalidate();
    },
    onError: () => toast.error("Couldn't capture that"),
  });

  const toTaskMutation = useMutation({
    mutationFn: (id: string) => updateAgencyTaskStatus(id, "todo"),
    onSuccess: () => {
      toast.success("Moved to My Tasks");
      invalidate();
    },
  });

  const toMeetingMutation = useMutation({
    mutationFn: (id: string) => convertInboxToMeeting(id),
    onSuccess: () => {
      toast.success("Converted to a meeting");
      invalidate();
    },
  });

  const toNoteMutation = useMutation({
    mutationFn: (id: string) => convertInboxToNote(id),
    onSuccess: () => {
      toast.success("Converted to a note");
      invalidate();
    },
  });

  const toProjectMutation = useMutation({
    mutationFn: (id: string) => convertInboxToProject(id),
    onSuccess: () => {
      toast.success("Converted to a project");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgencyTask(id),
    onSuccess: () => {
      toast.success("Discarded");
      invalidate();
    },
  });

  const anyPending =
    toTaskMutation.isPending || toMeetingMutation.isPending || toNoteMutation.isPending || toProjectMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <form
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) captureMutation.mutate();
        }}
      >
        <Input
          placeholder="Capture anything — a Slack message, a manager ask, an idea, a bug..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Select value={sourceType} onValueChange={(v) => setSourceType(v ?? "other")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {sourceTypes.map((s) => (
              <SelectItem key={s} value={s}>{agencyInboxSourceLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={!title.trim() || captureMutation.isPending}>
          {captureMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Capture
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={Inbox} title="Inbox zero" description="Capture stray thoughts here before deciding what they are." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {agencyInboxSourceLabels[item.sourceType ?? "other"] ?? "Other"} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <Button size="sm" variant="outline" disabled={anyPending} onClick={() => toTaskMutation.mutate(item.id)}>
                  <ArrowRight className="h-3.5 w-3.5" /> Task
                </Button>
                <Button size="sm" variant="outline" disabled={anyPending} onClick={() => toMeetingMutation.mutate(item.id)}>
                  <Users className="h-3.5 w-3.5" /> Meeting
                </Button>
                <Button size="sm" variant="outline" disabled={anyPending} onClick={() => toNoteMutation.mutate(item.id)}>
                  <NotebookText className="h-3.5 w-3.5" /> Note
                </Button>
                <Button size="sm" variant="outline" disabled={anyPending} onClick={() => toProjectMutation.mutate(item.id)}>
                  <FolderKanban className="h-3.5 w-3.5" /> Project
                </Button>
                <Button size="icon-sm" variant="ghost" disabled={anyPending} onClick={() => deleteMutation.mutate(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
