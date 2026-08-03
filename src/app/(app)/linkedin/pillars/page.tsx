import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PillarsView } from "@/features/linkedin/components/pillars/pillars-view";
import { listLinkedinPillars, ensureDefaultPillars } from "@/features/linkedin/actions/pillars.actions";

export const metadata: Metadata = { title: "Content Pillars — LifeOS" };

export default async function PillarsPage() {
  await ensureDefaultPillars();
  const pillars = await listLinkedinPillars();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Content Pillars" description="Every post belongs to one or more pillars." />
      <Suspense>
        <PillarsView pillars={pillars} />
      </Suspense>
    </div>
  );
}
