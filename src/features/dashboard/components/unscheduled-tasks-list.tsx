import Link from "next/link";
import { Inbox } from "lucide-react";
import { DashboardTaskRow } from "./dashboard-task-row";
import type { TaskWithMeta } from "@/features/tasks/actions/tasks.actions";

const VISIBLE_LIMIT = 6;

export function UnscheduledTasksList({ tasks }: { tasks: TaskWithMeta[] }) {
  const visible = tasks.slice(0, VISIBLE_LIMIT);
  const remaining = tasks.length - visible.length;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Inbox className="h-3.5 w-3.5" /> No Due Date
      </div>
      {visible.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Every active task has a date — nothing sitting in the backlog.</p>
      ) : (
        <div>
          {visible.map((task) => (
            <DashboardTaskRow key={task.id} task={task} dense />
          ))}
          {remaining > 0 && (
            <Link href="/tasks" className="mt-1 block px-1 py-1 text-xs text-primary hover:underline">
              +{remaining} more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
