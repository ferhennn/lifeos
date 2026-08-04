import Link from "next/link";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgencyDeadlineItem } from "../../actions/agency-dashboard.actions";

export function AgencyUpcomingDeadlines({ items }: { items: AgencyDeadlineItem[] }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" /> Upcoming Deadlines
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing due in the next 7 days.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const days = differenceInCalendarDays(parseISO(item.date), new Date());
            return (
              <li key={`${item.type}-${item.id}`}>
                <Link href={item.href} className="flex items-center justify-between gap-2 text-sm hover:underline">
                  <span className="truncate">{item.title}</span>
                  <span className={cn("shrink-0 text-xs", days <= 1 ? "text-destructive" : "text-muted-foreground")}>
                    {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : format(parseISO(item.date), "MMM d")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
