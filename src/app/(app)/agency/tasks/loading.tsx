import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyTasksLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="My Tasks" description="Everything assigned to you, with full context — never dig through Slack again." />
      <div className="space-y-3 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
