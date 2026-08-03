import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function EngagementLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Engagement" description="Show up in other people's feeds, not just your own." />
      <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
