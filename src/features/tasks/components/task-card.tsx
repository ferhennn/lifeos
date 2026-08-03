"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, ListChecks, Link2 } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/shared/status-badge";
import type { TaskWithMeta } from "../actions/tasks.actions";

export function TaskCard({ task, onClick }: { task: TaskWithMeta; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const overdue = task.dueDate && task.status !== "done" && isPast(parseISO(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "cursor-pointer space-y-2 rounded-lg border border-border bg-card p-3 text-left transition-shadow hover:shadow-sm",
        isDragging && "opacity-50",
      )}
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {(task.goalTitle || task.projectTitle) && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {task.goalCoverColor && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: task.goalCoverColor }} />}
          <span className="truncate">{task.projectTitle ?? task.strategyTitle ?? task.goalTitle}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={cn("inline-flex items-center gap-1 text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
            <CalendarDays className="h-3 w-3" />
            {format(parseISO(task.dueDate), "MMM d")}
          </span>
        )}
        {task.subtaskTotal > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ListChecks className="h-3 w-3" />
            {task.subtaskDone}/{task.subtaskTotal}
          </span>
        )}
        {task.dependsOnCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" />
            {task.dependsOnCount}
          </span>
        )}
      </div>
    </div>
  );
}
