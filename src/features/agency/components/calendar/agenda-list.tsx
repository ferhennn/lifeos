"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ListTodo, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { dot, agencyTaskStatusConfig } from "@/lib/status-config";
import type { CalendarItem } from "../../actions/agency-calendar.actions";

export function AgendaList({ items, onItemClick }: { items: CalendarItem[]; onItemClick: (item: CalendarItem) => void }) {
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = format(parseISO(item.date), "EEEE, MMM d");
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries());
  }, [items]);

  if (grouped.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">Nothing scheduled in this range.</p>;
  }

  return (
    <div className="space-y-5 p-4">
      {grouped.map(([label, dayItems]) => (
        <div key={label} className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h3>
          <div className="space-y-1.5">
            {dayItems.map((item) => {
              const color = item.type === "task" ? (agencyTaskStatusConfig[item.status]?.color ?? "neutral") : "blue";
              const Icon = item.type === "task" ? ListTodo : Users;
              return (
                <button
                  key={`${item.type}:${item.id}`}
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted/40"
                >
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot[color])} />
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.type === "meeting" && item.durationMinutes != null && (
                    <span className="shrink-0 text-xs text-muted-foreground">{item.durationMinutes}m</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
