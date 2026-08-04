import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyKanbanLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Kanban" description="Drag work across the board as it moves." />
      <div className="flex gap-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-72 shrink-0" />
        ))}
      </div>
    </div>
  );
}
