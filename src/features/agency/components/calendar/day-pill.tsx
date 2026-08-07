"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ListTodo, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { dot, agencyTaskStatusConfig } from "@/lib/status-config";
import type { CalendarItem } from "../../actions/agency-calendar.actions";

export const DayPill = memo(function DayPill({ item, onClick }: { item: CalendarItem; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `${item.type}:${item.id}` });
  const color = item.type === "task" ? (agencyTaskStatusConfig[item.status]?.color ?? "neutral") : "blue";
  const Icon = item.type === "task" ? ListTodo : Users;

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "flex w-full items-center gap-1.5 truncate rounded-md border border-border bg-card px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm hover:bg-muted/50",
        isDragging && "opacity-50",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot[color])} />
      <Icon className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{item.title}</span>
    </button>
  );
});
