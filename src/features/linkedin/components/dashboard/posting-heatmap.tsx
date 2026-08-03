"use client";

import { format, parseISO } from "date-fns";
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HeatmapDay } from "../../actions/dashboard.actions";

function levelClass(count: number) {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-primary/35";
  if (count === 2) return "bg-primary/65";
  return "bg-primary";
}

export function PostingHeatmap({ data }: { data: HeatmapDay[] }) {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Flame className="h-3.5 w-3.5" /> Posting Heatmap
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger
                  render={<span className={`block h-3 w-3 rounded-sm ${levelClass(day.count)}`} />}
                />
                <TooltipContent side="top">
                  {day.count} post{day.count === 1 ? "" : "s"} · {format(parseISO(day.date), "MMM d")}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
