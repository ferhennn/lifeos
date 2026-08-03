"use client";

import { useState } from "react";
import { format } from "date-fns";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import type { LinkedinPostRevision } from "@/db/schema";

export function RevisionHistory({ revisions }: { revisions: LinkedinPostRevision[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Version History
      </div>
      {revisions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No edits recorded yet — every save from here on creates a snapshot.</p>
      ) : (
        <div className="space-y-1.5">
          {revisions.map((rev) => {
            const snapshot = rev.snapshot as Record<string, unknown>;
            const isOpen = expanded === rev.id;
            return (
              <div key={rev.id} className="rounded-lg border border-border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-xs"
                  onClick={() => setExpanded(isOpen ? null : rev.id)}
                >
                  <span className="text-muted-foreground">{format(new Date(rev.editedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {isOpen && (
                  <div className="space-y-1 border-t border-border px-3 py-2 text-xs">
                    <p><span className="text-muted-foreground">Caption: </span>{String(snapshot.caption ?? "—")}</p>
                    <p><span className="text-muted-foreground">Hook: </span>{String(snapshot.hook ?? "—")}</p>
                    <p><span className="text-muted-foreground">Status: </span>{String(snapshot.status ?? "—")}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
