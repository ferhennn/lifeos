"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Clock, FolderKanban, UserCog, ListChecks, Link2 } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/shared/status-badge";
import type { AgencyTaskWithMeta } from "../actions/agency-tasks.actions";

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${rest}m`;
}

export function AgencyTaskCard({ task, onClick }: { task: AgencyTaskWithMeta; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const overdue = task.dueDate && task.status !== "completed" && task.status !== "archived" && isPast(parseISO(task.dueDate));

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

      {task.agencyProjectTitle && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FolderKanban className="h-3 w-3 shrink-0" />
          <span className="truncate">{task.agencyProjectTitle}</span>
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
        {task.estimatedTime != null && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatMinutes(task.estimatedTime)}
          </span>
        )}
        {task.manager && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <UserCog className="h-3 w-3" />
            {task.manager}
          </span>
        )}
        {task.checklistTotal > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ListChecks className="h-3 w-3" />
            {task.checklistDone}/{task.checklistTotal}
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
