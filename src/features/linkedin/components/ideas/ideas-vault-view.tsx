"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { IdeaCard } from "./idea-card";
import { IdeaFormSheet } from "./idea-form-sheet";
import { createLinkedinIdea, updateLinkedinIdea, deleteLinkedinIdea, convertLinkedinIdeaToDraft } from "../../actions/ideas.actions";
import type { LinkedinIdea } from "@/db/schema";
import type { LinkedinIdeaValues, linkedinIdeaStatuses } from "../../schema/idea.schema";

export function IdeasVaultView({ ideas }: { ideas: LinkedinIdea[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | (typeof linkedinIdeaStatuses)[number]>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<LinkedinIdea | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const filtered = useMemo(() => (filter === "all" ? ideas : ideas.filter((i) => i.status === filter)), [ideas, filter]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({ideas.length})</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="expanded">Expanded</TabsTrigger>
            <TabsTrigger value="converted">Converted</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          size="sm"
          onClick={() => {
            setEditingIdea(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Capture idea
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No ideas here" description="Capture a quick idea now — you can flesh it out later." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isConverting={convertingId === idea.id}
              onEdit={() => {
                setEditingIdea(idea);
                setSheetOpen(true);
              }}
              onConvert={async () => {
                setConvertingId(idea.id);
                try {
                  const post = await convertLinkedinIdeaToDraft(idea.id);
                  if (post) {
                    toast.success("Converted to draft");
                    router.push(`/linkedin/library/${post.id}`);
                  }
                } finally {
                  setConvertingId(null);
                }
              }}
            />
          ))}
        </div>
      )}

      <IdeaFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingIdea(null);
        }}
        idea={editingIdea}
        isPending={isPending}
        onSubmit={async (values: LinkedinIdeaValues) => {
          setIsPending(true);
          try {
            if (editingIdea) {
              await updateLinkedinIdea(editingIdea.id, values);
              toast.success("Idea updated");
            } else {
              await createLinkedinIdea(values);
              toast.success("Idea captured");
            }
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
        onDelete={
          editingIdea
            ? async () => {
                await deleteLinkedinIdea(editingIdea.id);
                toast.success("Idea deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
