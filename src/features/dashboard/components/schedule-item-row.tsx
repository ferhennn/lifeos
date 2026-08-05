"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/shared/status-badge";
import { updateTaskStatus } from "@/features/tasks/actions/tasks.actions";
import { updateAgencyTaskStatus } from "@/features/agency/actions/agency-tasks.actions";
import { cn } from "@/lib/utils";
import type { ScheduleItem } from "../actions/dashboard.actions";

export function ScheduleItemRow({ item, dense = false }: { item: ScheduleItem; dense?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle(checked: boolean) {
    startTransition(async () => {
      if (item.source === "agency") {
        await updateAgencyTaskStatus(item.id, checked ? "completed" : "todo");
      } else {
        await updateTaskStatus(item.id, checked ? "done" : "todo");
      }
      router.refresh();
    });
  }

  return (
    <div className={cn("flex items-center gap-2.5 rounded-md px-1 hover:bg-muted/50", dense ? "py-1" : "py-1.5")}>
      <Checkbox checked={item.done} disabled={isPending} onCheckedChange={(checked) => toggle(checked === true)} />
      <Link href={item.href} className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", item.done && "text-muted-foreground line-through")}>{item.title}</p>
      </Link>
      <PriorityBadge priority={item.priority} className="shrink-0" />
    </div>
  );
}
