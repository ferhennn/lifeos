"use client";

import { format, parseISO, isPast } from "date-fns";
import { CalendarDays, ListChecks } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { taskStatusConfig } from "@/lib/status-config";
import type { TaskWithMeta } from "../actions/tasks.actions";

export function TaskList({
  tasks,
  onTaskClick,
  onToggleDone,
  selectedIds,
  onSelectionChange,
}: {
  tasks: TaskWithMeta[];
  onTaskClick: (task: TaskWithMeta) => void;
  onToggleDone: (task: TaskWithMeta) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}) {
  const allSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));
  const someSelected = tasks.some((t) => selectedIds.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(tasks.map((t) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onCheckedChange={toggleAll}
              aria-label="Select all tasks"
            />
          </TableHead>
          <TableHead className="w-8" />
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Traces to</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const overdue = task.dueDate && task.status !== "done" && isPast(parseISO(task.dueDate));
          return (
            <TableRow key={task.id} className="cursor-pointer" onClick={() => onTaskClick(task)}>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(task.id)}
                  onCheckedChange={() => toggleOne(task.id)}
                  aria-label={`Select ${task.title}`}
                />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={task.status === "done"} onCheckedChange={() => onToggleDone(task)} />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", task.status === "done" && "text-muted-foreground line-through")}>
                    {task.title}
                  </p>
                  {task.subtaskTotal > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <ListChecks className="h-3 w-3" />
                      {task.subtaskDone}/{task.subtaskTotal}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge config={taskStatusConfig} status={task.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell>
                {task.dueDate && (
                  <span className={cn("inline-flex items-center gap-1 text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
                    <CalendarDays className="h-3 w-3" />
                    {format(parseISO(task.dueDate), "MMM d, yyyy")}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {(task.goalTitle || task.projectTitle) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {task.goalCoverColor && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: task.goalCoverColor }} />
                    )}
                    <span className="truncate">{task.projectTitle ?? task.strategyTitle ?? task.goalTitle}</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
