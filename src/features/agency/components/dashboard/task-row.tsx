"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/shared/status-badge";
import { updateAgencyTaskStatus, type AgencyTaskWithMeta } from "../../actions/agency-tasks.actions";
import { cn } from "@/lib/utils";

export function AgencyDashboardTaskRow({ task, dense = false }: { task: AgencyTaskWithMeta; dense?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-center gap-2.5 rounded-md px-1 hover:bg-muted/50", dense ? "py-1" : "py-1.5")}>
      <Checkbox
        checked={task.status === "completed"}
        disabled={isPending}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            await updateAgencyTaskStatus(task.id, checked ? "completed" : "todo");
            router.refresh();
          })
        }
      />
      <Link href={`/agency/tasks?openTask=${task.id}`} className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", task.status === "completed" && "text-muted-foreground line-through")}>{task.title}</p>
      </Link>
      <PriorityBadge priority={task.priority} className="shrink-0" />
    </div>
  );
}
