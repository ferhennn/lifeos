import { ListChecks } from "lucide-react";
import { DashboardTaskRow } from "./dashboard-task-row";
import type { TaskWithMeta } from "@/features/tasks/actions/tasks.actions";

export function TodayPriorityList({ tasks }: { tasks: TaskWithMeta[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ListChecks className="h-3.5 w-3.5" /> Today&apos;s Priority
      </div>
      {tasks.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">No active tasks — you&apos;re clear.</p>
      ) : (
        <div>
          {tasks.map((task) => (
            <DashboardTaskRow key={task.id} task={task} dense />
          ))}
        </div>
      )}
    </div>
  );
}
