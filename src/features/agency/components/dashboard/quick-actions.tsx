import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgencyTaskWithMeta } from "../../actions/agency-tasks.actions";

// Focus Session (Phase 2) and Generate Standup / Generate End of Day Report
// (Phase 3) are hidden until those features ship.
export function AgencyQuickActions({ lastActiveTask }: { lastActiveTask: AgencyTaskWithMeta | null }) {
  if (!lastActiveTask) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
      <Button size="sm" variant="outline" render={<Link href={`/agency/tasks?openTask=${lastActiveTask.id}`} />}>
        <PlayCircle className="h-3.5 w-3.5" /> Continue Last Task
      </Button>
    </div>
  );
}
