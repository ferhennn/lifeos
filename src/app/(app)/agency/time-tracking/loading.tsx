import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyTimeTrackingLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Time Tracking" description="Start a timer or log time manually against any task." />
      <div className="space-y-3 p-6">
        <Skeleton className="h-24 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
