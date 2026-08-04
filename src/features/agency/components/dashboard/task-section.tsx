import type { LucideIcon } from "lucide-react";
import { AgencyDashboardTaskRow } from "./task-row";
import type { AgencyTaskWithMeta } from "../../actions/agency-tasks.actions";

export function AgencyTaskSection({
  icon: Icon,
  title,
  tasks,
  emptyLabel,
}: {
  icon: LucideIcon;
  title: string;
  tasks: AgencyTaskWithMeta[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {title}
        </div>
        {tasks.length > 0 && <span className="text-xs text-muted-foreground">{tasks.length}</span>}
      </div>
      {tasks.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div>
          {tasks.map((task) => (
            <AgencyDashboardTaskRow key={task.id} task={task} dense />
          ))}
        </div>
      )}
    </div>
  );
}
