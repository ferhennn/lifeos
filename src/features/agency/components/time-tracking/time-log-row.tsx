"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agencyTimeLogSourceLabels } from "@/lib/status-config";
import type { AgencyTimeLogWithTask } from "../../actions/agency-time-logs.actions";

export function TimeLogRow({ log, onDelete, isPending }: { log: AgencyTimeLogWithTask; onDelete: () => void; isPending: boolean }) {
  const hours = Math.floor(log.durationMinutes / 60);
  const minutes = log.durationMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{format(new Date(log.startedAt), "MMM d, h:mma")}</span>
      <span className="min-w-0 flex-1 truncate">{log.taskTitle ?? "Untitled task"}</span>
      <Badge variant="outline" className="shrink-0">{agencyTimeLogSourceLabels[log.source] ?? log.source}</Badge>
      <span className="shrink-0 font-medium tabular-nums">{durationLabel}</span>
      <Button size="icon-sm" variant="ghost" disabled={isPending} onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
