import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Calendar" description="Drag a post to a new day to reschedule it." />
      <div className="p-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}
