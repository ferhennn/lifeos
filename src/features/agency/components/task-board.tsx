"use client";

import { DndContext, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { agencyTaskStatusConfig, dot } from "@/lib/status-config";
import { AgencyTaskCard } from "./task-card";
import type { AgencyTaskWithMeta } from "../actions/agency-tasks.actions";

// The board shows the 7 working-state columns from the spec. "Waiting for
// Client" and "Archived" are still valid statuses (set from the task form,
// visible in List view) but aren't drag targets on the board.
const kanbanColumns = ["inbox", "todo", "today", "in_progress", "blocked", "waiting_review", "completed"] as const;

function priorityWeight(p: string) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

function Column({
  status,
  tasks,
  onTaskClick,
}: {
  status: (typeof kanbanColumns)[number];
  tasks: AgencyTaskWithMeta[];
  onTaskClick: (task: AgencyTaskWithMeta) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = agencyTaskStatusConfig[status];
  const sorted = [...tasks].sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot[config.color])} />
        <span className="text-xs font-medium">{config.label}</span>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg border border-dashed border-transparent p-1 transition-colors",
          isOver && "border-primary/40 bg-primary/5",
        )}
      >
        {sorted.map((task) => (
          <AgencyTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  );
}

export function AgencyTaskBoard({
  tasks,
  onTaskClick,
  onStatusChange,
}: {
  tasks: AgencyTaskWithMeta[];
  onTaskClick: (task: AgencyTaskWithMeta) => void;
  onStatusChange: (taskId: string, status: (typeof kanbanColumns)[number]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as (typeof kanbanColumns)[number];
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {kanbanColumns.map((status) => (
          <Column key={status} status={status} tasks={tasks.filter((t) => t.status === status)} onTaskClick={onTaskClick} />
        ))}
      </div>
    </DndContext>
  );
}
