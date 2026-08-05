import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyMeetingsLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Meetings" description="Store every meeting — agenda, notes, decisions, and action items." />
      <div className="space-y-2 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
