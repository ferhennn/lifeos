import { CalendarClock } from "lucide-react";
import { ScheduleItemRow } from "./schedule-item-row";
import type { ScheduleItem } from "../actions/dashboard.actions";

export function TodaySchedule({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" /> Today&apos;s Schedule
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing due today.</p>
      ) : (
        <div>
          {items.map((item) => (
            <ScheduleItemRow key={`${item.source}-${item.id}`} item={item} dense />
          ))}
        </div>
      )}
    </div>
  );
}
