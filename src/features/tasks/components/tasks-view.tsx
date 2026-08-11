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
import { TaskBoard } from "./task-board";
import { TaskList } from "./task-list";
import { TaskFormSheet } from "./task-form-sheet";
import {
  listTasks,
  getTaskDetail,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  deleteTasks,
  listTaskOptions,
  type TaskWithMeta,
  type TaskDetail,
} from "../actions/tasks.actions";
import type { TaskValues } from "../schema/task.schema";
import type { GoalOption } from "@/features/goals/actions/goals.actions";
import type { StrategyOption } from "@/features/strategies/actions/strategies.actions";
import type { ProjectOption, EpicOption } from "@/features/projects/actions/projects.actions";

export function TasksView({
  initialTasks,
  goalOptions,
  strategyOptions,
  projectOptions,
  epicOptions,
  filterProjectId,
}: {
  initialTasks: TaskWithMeta[];
  goalOptions: GoalOption[];
  strategyOptions: StrategyOption[];
  projectOptions: ProjectOption[];
  epicOptions: EpicOption[];
  filterProjectId?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("new") === "1");
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: tasksData = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: listTasks,
    initialData: initialTasks,
  });

  const { data: taskOptions = [] } = useQuery({
    queryKey: ["task-options"],
    queryFn: () => listTaskOptions(),
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace(filterProjectId ? `/projects/${filterProjectId}` : "/tasks");
    }
  }, [searchParams, router, filterProjectId]);

  const filtered = useMemo(() => {
    return tasksData.filter((t) => {
      if (filterProjectId && t.projectId !== filterProjectId) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasksData, filterProjectId, priorityFilter, search]);

  const filterKey = `${filterProjectId ?? ""}|${priorityFilter}|${search}|${view}`;
  if (useValueChanged(filterKey)) setSelectedIds(new Set());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task-options"] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["strategies"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: TaskValues) => createTask(values),
    onSuccess: () => {
      toast.success("Task created");
      invalidate();
    },
    onError: () => toast.error("Couldn't create task"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskValues }) => updateTask(id, values),
    onSuccess: () => {
      toast.success("Task updated");
      invalidate();
    },
    onError: () => toast.error("Couldn't update task"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskWithMeta["status"] }) => updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TaskWithMeta[]>(["tasks"]);
      queryClient.setQueryData<TaskWithMeta[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["tasks"], context?.previous);
      toast.error("Couldn't update status");
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success("Task deleted");
      invalidate();
    },
    onError: () => toast.error("Couldn't delete task"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteTasks(ids),
    onSuccess: (_data, ids) => {
      toast.success(`${ids.length} task${ids.length === 1 ? "" : "s"} deleted`);
      setSelectedIds(new Set());
      invalidate();
    },
    onError: () => toast.error("Couldn't delete tasks"),
  });

  const openTask = async (task: TaskWithMeta) => {
    const detail = await getTaskDetail(task.id);
    setEditingTask(detail);
    setSheetOpen(true);
  };

  useEffect(() => {
    const openTaskId = searchParams.get("openTask");
    if (!openTaskId) return;
    const match = tasksData.find((t) => t.id === openTaskId);
    if (match) {
      // Deliberate: async fetch-then-open, one-shot, guarded by clearing the
      // query param immediately after so it can't cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openTask(match);
      router.replace(filterProjectId ? `/projects/${filterProjectId}` : "/tasks");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tasksData]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 pl-8"
            />
          </div>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {view === "list" && selectedIds.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
            <Button
              size="sm"
              variant="destructive"
              disabled={bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
            >
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
          description="Create a task directly, or generate one from a recurring strategy."
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" /> Create a task
            </Button>
          }
        />
      ) : view === "board" ? (
        <TaskBoard
          tasks={filtered}
          onTaskClick={openTask}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
      ) : (
        <TaskList
          tasks={filtered}
          onTaskClick={openTask}
          onToggleDone={(task) =>
            statusMutation.mutate({ id: task.id, status: task.status === "done" ? "todo" : "done" })
          }
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

      <TaskFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        goalOptions={goalOptions}
        strategyOptions={strategyOptions}
        projectOptions={projectOptions}
        epicOptions={epicOptions}
        taskOptions={taskOptions.filter((o) => o.id !== editingTask?.id)}
        defaults={filterProjectId ? { projectId: filterProjectId } : undefined}
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
