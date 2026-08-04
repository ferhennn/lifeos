import { History, CheckCircle2, Plus, FolderKanban, ListTodo } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AgencyActivityItem } from "../../actions/agency-dashboard.actions";

const typeIcon = { task: ListTodo, project: FolderKanban, meeting: ListTodo };

export function AgencyRecentActivityFeed({ items }: { items: AgencyActivityItem[] }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Recent Activity
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing yet — start creating.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const Icon = typeIcon[item.type];
            const ActionIcon = item.action === "completed" ? CheckCircle2 : Plus;
            return (
              <li key={`${item.type}-${item.id}-${item.action}`} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <ActionIcon className="mr-1 inline h-3 w-3 text-muted-foreground" />
                    {item.action === "completed" ? "Completed" : "Created"} <span className="font-medium">{item.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(item.at, { addSuffix: true })}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
