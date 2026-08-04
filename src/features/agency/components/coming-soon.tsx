import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export function AgencyComingSoon({
  title,
  description,
  icon,
  phase,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title={title} description={description} />
      <div className="p-6">
        <EmptyState icon={icon} title={`${title} is coming in ${phase}`} description="This section of the Agency Workspace hasn't shipped yet." />
      </div>
    </div>
  );
}
