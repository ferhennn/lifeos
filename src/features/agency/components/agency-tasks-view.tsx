"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List as ListIcon, Plus, Search, ListTodo, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { useValueChanged } from "@/lib/use-value-changed";
import { AgencyTaskBoard } from "./task-board";
import { AgencyTaskList } from "./task-list";
import { AgencyTaskFormSheet } from "./task-form-sheet";
import {
  listAgencyTasks,
  getAgencyTaskDetail,
  createAgencyTask,
  updateAgencyTask,
  updateAgencyTaskStatus,
  deleteAgencyTask,
  deleteAgencyTasks,
  listAgencyTaskOptions,
  type AgencyTaskWithMeta,
  type AgencyTaskDetail,
} from "../actions/agency-tasks.actions";
import type { AgencyTaskValues } from "../schema/agency-task.schema";
import { agencyTaskPriorityConfig, agencyTaskStatusConfig } from "@/lib/status-config";
import type { GoalOption } from "@/features/goals/actions/goals.actions";
import type { AgencyProjectOption, AgencyEpicOption } from "../actions/agency-projects.actions";

export function AgencyTasksView({
  initialTasks,
  goalOptions,
  projectOptions,
  epicOptions,
  filterProjectId,
}: {
  initialTasks: AgencyTaskWithMeta[];
  goalOptions: GoalOption[];
  projectOptions: AgencyProjectOption[];
  epicOptions: AgencyEpicOption[];
  filterProjectId?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingTask, setEditingTask] = useState<AgencyTaskDetail | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const basePath = filterProjectId ? `/agency/projects/${filterProjectId}` : "/agency/tasks";

  const { data: tasksData = [] } = useQuery({
    queryKey: ["agency-tasks"],
    queryFn: listAgencyTasks,
    initialData: initialTasks,
  });

  const { data: taskOptions = [] } = useQuery({
    queryKey: ["agency-task-options"],
    queryFn: () => listAgencyTaskOptions(),
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") router.replace(basePath);
  }, [searchParams, router, basePath]);

  const filtered = useMemo(() => {
    return tasksData.filter((t) => {
      if (filterProjectId && t.agencyProjectId !== filterProjectId) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasksData, filterProjectId, priorityFilter, statusFilter, search]);

  const filterKey = `${filterProjectId ?? ""}|${priorityFilter}|${statusFilter}|${search}|${view}`;
  if (useValueChanged(filterKey)) setSelectedIds(new Set());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["agency-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["agency-task-options"] });
    queryClient.invalidateQueries({ queryKey: ["agency-projects"] });
    queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: AgencyTaskValues) => createAgencyTask(values),
    onSuccess: () => {
      toast.success("Task created");
      invalidate();
    },
    onError: () => toast.error("Couldn't create task"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AgencyTaskValues }) => updateAgencyTask(id, values),
    onSuccess: () => {
      toast.success("Task updated");
      invalidate();
    },
    onError: () => toast.error("Couldn't update task"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AgencyTaskWithMeta["status"] }) => updateAgencyTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["agency-tasks"] });
      const previous = queryClient.getQueryData<AgencyTaskWithMeta[]>(["agency-tasks"]);
      queryClient.setQueryData<AgencyTaskWithMeta[]>(["agency-tasks"], (old) => old?.map((t) => (t.id === id ? { ...t, status } : t)));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["agency-tasks"], context?.previous);
      toast.error("Couldn't update status");
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgencyTask(id),
    onSuccess: () => {
      toast.success("Task deleted");
      invalidate();
    },
    onError: () => toast.error("Couldn't delete task"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteAgencyTasks(ids),
    onSuccess: (_data, ids) => {
      toast.success(`${ids.length} task${ids.length === 1 ? "" : "s"} deleted`);
      setSelectedIds(new Set());
      invalidate();
    },
    onError: () => toast.error("Couldn't delete tasks"),
  });

  const openTask = async (task: AgencyTaskWithMeta) => {
    const detail = await getAgencyTaskDetail(task.id);
    setEditingTask(detail);
    setSheetOpen(true);
  };

  useEffect(() => {
    const openTaskId = searchParams.get("openTask");
    if (!openTaskId) return;
    const match = tasksData.find((t) => t.id === openTaskId);
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openTask(match);
      router.replace(basePath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tasksData]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "board" | "list")}>
            <TabsList>
              <TabsTrigger value="board">
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </TabsTrigger>
              <TabsTrigger value="list">
                <ListIcon className="h-3.5 w-3.5" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-48 pl-8" />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(agencyTaskStatusConfig).map(([value, cfg]) => (
                <SelectItem key={value} value={value}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              {Object.entries(agencyTaskPriorityConfig).map(([value, cfg]) => (
                <SelectItem key={value} value={value}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {view === "list" && selectedIds.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
            <Button size="sm" variant="destructive" disabled={bulkDeleteMutation.isPending} onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks here"
          description="Create a task directly, or capture it in the Inbox first."
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" /> Create a task
            </Button>
          }
        />
      ) : view === "board" ? (
        <AgencyTaskBoard tasks={filtered} onTaskClick={openTask} onStatusChange={(id, status) => statusMutation.mutate({ id, status })} />
      ) : (
        <AgencyTaskList
          tasks={filtered}
          onTaskClick={openTask}
          onToggleDone={(task) => statusMutation.mutate({ id: task.id, status: task.status === "completed" ? "todo" : "completed" })}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

      <AgencyTaskFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        goalOptions={goalOptions}
        projectOptions={projectOptions}
        epicOptions={epicOptions}
        taskOptions={taskOptions}
        defaults={filterProjectId ? { agencyProjectId: filterProjectId } : undefined}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editingTask) {
            await updateMutation.mutateAsync({ id: editingTask.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
        onDelete={
          editingTask
            ? async () => {
                await deleteMutation.mutateAsync(editingTask.id);
                setSheetOpen(false);
                setEditingTask(null);
              }
            : undefined
        }
      />
    </div>
  );
}
