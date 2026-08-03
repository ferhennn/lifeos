import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { IdeasVaultView } from "@/features/linkedin/components/ideas/ideas-vault-view";
import { listLinkedinIdeas } from "@/features/linkedin/actions/ideas.actions";

export const metadata: Metadata = { title: "Ideas Vault — LifeOS" };

export default async function IdeasVaultPage() {
  const ideas = await listLinkedinIdeas();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Ideas Vault" description="Quick capture now, flesh out later." />
      <Suspense>
        <IdeasVaultView ideas={ideas} />
      </Suspense>
    </div>
  );
}
