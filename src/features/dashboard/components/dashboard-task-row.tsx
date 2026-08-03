"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/shared/status-badge";
import { updateTaskStatus, type TaskWithMeta } from "@/features/tasks/actions/tasks.actions";
import { cn } from "@/lib/utils";

export function DashboardTaskRow({ task, dense = false }: { task: TaskWithMeta; dense?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-center gap-2.5 rounded-md px-1 hover:bg-muted/50", dense ? "py-1" : "py-1.5")}>
      <Checkbox
        checked={task.status === "done"}
        disabled={isPending}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            await updateTaskStatus(task.id, checked ? "done" : "todo");
            router.refresh();
          })
        }
      />
      <Link href={`/tasks?openTask=${task.id}`} className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</p>
      </Link>
      <PriorityBadge priority={task.priority} className="shrink-0" />
    </div>
  );
}
