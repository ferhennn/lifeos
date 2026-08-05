"use client";

import { useDroppable } from "@dnd-kit/core";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { DayPill } from "./day-pill";
import type { CalendarItem } from "../../actions/agency-calendar.actions";

export function DayCell({
  date,
  inCurrentMonth = true,
  items,
  onItemClick,
  compact = false,
}: {
  date: Date;
  inCurrentMonth?: boolean;
  items: CalendarItem[];
  onItemClick: (item: CalendarItem) => void;
  compact?: boolean;
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-1 border border-transparent p-1.5",
        compact ? "min-h-24" : "min-h-28",
        !inCurrentMonth && "opacity-40",
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="px-0.5">
        <span className={cn("text-xs", isToday(date) ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}>
          {format(date, "d")}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <DayPill key={`${item.type}:${item.id}`} item={item} onClick={() => onItemClick(item)} />
        ))}
      </div>
    </div>
  );
}
