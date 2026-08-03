"use client";

import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { linkedinPostStatusConfig, linkedinPostPipelineStatuses } from "@/lib/status-config";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinPost } from "@/db/schema";

export function BulkActionBar({
  count,
  pillarOptions,
  isPending,
  onClear,
  onSetStatus,
  onSetDate,
  onAssignPillar,
  onDelete,
}: {
  count: number;
  pillarOptions: PillarOption[];
  isPending: boolean;
  onClear: () => void;
  onSetStatus: (status: LinkedinPost["status"]) => void;
  onSetDate: (date: string) => void;
  onAssignPillar: (pillarId: string) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-lg">
      <span className="mr-1 shrink-0 font-medium">{count} selected</span>

      <Select onValueChange={(v) => onSetStatus(v as LinkedinPost["status"])}>
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          {linkedinPostPipelineStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {linkedinPostStatusConfig[s]?.label ?? s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="h-8 w-[150px]"
        onChange={(e) => {
          if (e.target.value) onSetDate(e.target.value);
        }}
      />

      <Select onValueChange={(v) => onAssignPillar(v as string)}>
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Assign pillar" />
        </SelectTrigger>
        <SelectContent>
          {pillarOptions.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" variant="outline" className="h-8 text-destructive" onClick={() => setConfirmDelete(true)}>
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Delete
      </Button>

      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} post{count === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false);
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
