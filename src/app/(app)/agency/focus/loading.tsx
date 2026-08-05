import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyFocusLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Focus Mode" description="A distraction-free timer for a single task." />
      <div className="space-y-3 p-6">
        <Skeleton className="h-64 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
