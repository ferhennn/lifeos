import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function LinkedinStrategiesLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Content Strategies" description="Goal, cadence, audience, and CTA for how you show up." />
      <div className="grid grid-cols-1 gap-3 p-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
