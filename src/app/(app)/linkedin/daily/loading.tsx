import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DailyPostingLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Daily Posting" />
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
