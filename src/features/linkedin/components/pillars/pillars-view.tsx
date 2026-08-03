"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Columns3, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PillarFormSheet } from "./pillar-form-sheet";
import { createPillar, updatePillar, deletePillar, type PillarWithCount } from "../../actions/pillars.actions";
import type { LinkedinPillarValues } from "../../schema/pillar.schema";

export function PillarsView({ pillars }: { pillars: PillarWithCount[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<PillarWithCount | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingPillar(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New pillar
        </Button>
      </div>

      {pillars.length === 0 ? (
        <EmptyState icon={Columns3} title="No pillars yet" description="Pillars group your posts around consistent themes." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: pillar.color }} />
                <p className="flex-1 truncate text-sm font-medium">{pillar.name}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => {
                    setEditingPillar(pillar);
                    setSheetOpen(true);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </div>
              {pillar.description && <p className="line-clamp-2 text-xs text-muted-foreground">{pillar.description}</p>}
              <p className="text-xs text-muted-foreground">{pillar.postCount} post{pillar.postCount === 1 ? "" : "s"}</p>
            </div>
          ))}
        </div>
      )}

      <PillarFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingPillar(null);
        }}
        pillar={editingPillar}
        isPending={isPending}
        onSubmit={async (values: LinkedinPillarValues) => {
          setIsPending(true);
          try {
            if (editingPillar) {
              await updatePillar(editingPillar.id, values);
              toast.success("Pillar updated");
            } else {
              await createPillar(values);
              toast.success("Pillar created");
            }
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
        onDelete={
          editingPillar
            ? async () => {
                await deletePillar(editingPillar.id);
                toast.success("Pillar deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
