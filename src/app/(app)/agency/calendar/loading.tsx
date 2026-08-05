import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgencyCalendarLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Calendar" description="Meetings and task due dates, drag to reschedule." />
      <div className="p-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}
