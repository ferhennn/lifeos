"use client";

import { format } from "date-fns";
import { Check, X } from "lucide-react";
import type { AgencyFocusSessionWithTask } from "../../actions/agency-focus-sessions.actions";

export function FocusSessionRow({ session }: { session: AgencyFocusSessionWithTask }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{format(new Date(session.startedAt), "MMM d, h:mma")}</span>
      <span className="min-w-0 flex-1 truncate">{session.taskTitle ?? "No task"}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {session.actualMinutes != null ? `${session.actualMinutes} / ${session.plannedMinutes}m` : "Running…"}
      </span>
      {session.completed ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
      ) : (
        <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
    </div>
  );
}
