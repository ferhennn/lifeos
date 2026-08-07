"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DayCell } from "./day-cell";
import { AgendaList } from "./agenda-list";
import { rescheduleAgencyTask } from "../../actions/agency-tasks.actions";
import { rescheduleAgencyMeeting } from "../../actions/agency-meetings.actions";
import type { CalendarItem } from "../../actions/agency-calendar.actions";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ items }: { items: CalendarItem[] }) {
  const router = useRouter();
  const [view, setView] = useState<"month" | "agenda">("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [isPending, setIsPending] = useState(false);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const bucket = map.get(item.date);
      if (bucket) bucket.push(item);
      else map.set(item.date, [item]);
    }
    return map;
  }, [items]);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(anchor)), end: endOfWeek(endOfMonth(anchor)) }),
    [anchor],
  );

  const weeks = useMemo(() => {
    const chunks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [days]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleItemClick = useCallback(
    (item: CalendarItem) => {
      router.push(item.type === "task" ? `/agency/tasks?openTask=${item.id}` : `/agency/meetings?openMeeting=${item.id}`);
    },
    [router],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const [type, id] = (active.id as string).split(":");
      const newDate = over.id as string;
      const item = items.find((i) => i.type === type && i.id === id);
      if (!item || item.date === newDate) return;

      setIsPending(true);
      (type === "task" ? rescheduleAgencyTask(id, newDate) : rescheduleAgencyMeeting(id, newDate))
        .then(() => {
          toast.success(`Rescheduled to ${format(new Date(newDate), "MMM d")}`);
          router.refresh();
        })
        .finally(() => setIsPending(false));
    },
    [items, router],
  );

  const agendaItems = useMemo(() => {
    const monthStart = format(startOfMonth(anchor), "yyyy-MM-dd");
    return items.filter((i) => i.date >= monthStart).sort((a, b) => a.date.localeCompare(b.date));
  }, [items, anchor]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={isPending} onClick={() => setAnchor((prev) => subMonths(prev, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={isPending} onClick={() => setAnchor((prev) => addMonths(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-sm font-medium">{format(anchor, "MMMM yyyy")}</span>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())}>Today</Button>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "agenda" ? (
        <div className="rounded-xl border border-border bg-card">
          <AgendaList items={agendaItems} onItemClick={handleItemClick} />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="divide-y divide-border">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 divide-x divide-border">
                  {week.map((day) => (
                    <DayCell
                      key={day.toISOString()}
                      date={day}
                      inCurrentMonth={isSameMonth(day, anchor)}
                      items={itemsByDate.get(format(day, "yyyy-MM-dd")) ?? []}
                      onItemClick={handleItemClick}
                      compact
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DndContext>
      )}
    </div>
  );
}
