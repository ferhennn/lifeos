import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Content Pipeline" description="Drag cards across stages as content moves from idea to published." />
      <div className="flex gap-4 overflow-x-auto p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-72 shrink-0" />
        ))}
      </div>
    </div>
  );
}
