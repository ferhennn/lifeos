import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyInboxLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Inbox" description="Capture first, organize later — nothing gets lost." />
      <div className="space-y-3 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
