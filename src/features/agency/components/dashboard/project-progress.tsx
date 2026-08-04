import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { AgencyProjectWithMeta } from "../../actions/agency-projects.actions";

export function AgencyProjectProgress({ projects }: { projects: AgencyProjectWithMeta[] }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <FolderKanban className="h-3.5 w-3.5" /> Current Project Progress
      </div>
      {projects.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">No active projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/agency/projects/${p.id}`} className="block space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-foreground">{p.title}</span>
                <span className="text-muted-foreground">{p.progress}%</span>
              </div>
              <Progress value={p.progress} className="h-1.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
