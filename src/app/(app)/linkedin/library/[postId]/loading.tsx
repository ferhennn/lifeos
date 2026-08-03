import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Loading..." description="Content Library" />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-6 lg:grid-cols-3">
        <Skeleton className="h-96 w-full lg:col-span-2" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
