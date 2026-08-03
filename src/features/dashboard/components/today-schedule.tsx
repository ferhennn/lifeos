import { CalendarClock } from "lucide-react";
import { DashboardTaskRow } from "./dashboard-task-row";
import type { TaskWithMeta } from "@/features/tasks/actions/tasks.actions";

export function TodaySchedule({ tasks }: { tasks: TaskWithMeta[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" /> Today&apos;s Schedule
      </div>
      {tasks.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing due today.</p>
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
