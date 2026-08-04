import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AgencyInboxView } from "@/features/agency/components/agency-inbox-view";
import { listInboxTasks } from "@/features/agency/actions/agency-inbox.actions";

export const metadata: Metadata = { title: "Inbox — Agency — LifeOS" };

export default async function AgencyInboxPage() {
  const items = await listInboxTasks();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Inbox" description="Capture first, organize later — nothing gets lost." />
      <Suspense>
        <AgencyInboxView initialItems={items} />
      </Suspense>
    </div>
  );
}
