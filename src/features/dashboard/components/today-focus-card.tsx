"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Flame, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/shared/status-badge";
import { updateTaskStatus, updateTaskNotes, type TaskWithMeta } from "@/features/tasks/actions/tasks.actions";

export function TodayFocusCard({ task }: { task: TaskWithMeta | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSavingNotes, startSavingNotes] = useTransition();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(task?.description ?? "");

  if (!task) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-5">
        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nothing urgent on your plate. Great time to plan ahead.</p>
      </div>
    );
  }

  const saveNotes = () => {
    startSavingNotes(async () => {
      await updateTaskNotes(task.id, notesDraft.trim());
      setEditingNotes(false);
      router.refresh();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <Flame className="h-3.5 w-3.5" /> Today&apos;s Focus
      </div>
      <Link href={`/tasks?openTask=${task.id}`} className="block">
        <h3 className="text-lg font-semibold leading-snug hover:underline">{task.title}</h3>
      </Link>
      {(task.goalTitle || task.projectTitle) && (
        <p className="text-xs text-muted-foreground">{task.projectTitle ?? task.strategyTitle ?? task.goalTitle}</p>
      )}

      {editingNotes ? (
        <div className="space-y-2">
          <Textarea
            autoFocus
            rows={3}
            placeholder="Add a note for this task..."
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            className="text-sm"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={isSavingNotes} onClick={saveNotes}>
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isSavingNotes}
              onClick={() => {
                setNotesDraft(task.description ?? "");
                setEditingNotes(false);
              }}
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </div>
      ) : task.description ? (
        <button
          type="button"
          onClick={() => {
            setNotesDraft(task.description ?? "");
            setEditingNotes(true);
          }}
          className="group/notes mb-1 block w-full rounded-md border border-transparent p-2 -m-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/40"
        >
          <span className="whitespace-pre-wrap">{task.description}</span>
          <span className="ml-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground/60 opacity-0 transition-opacity group-hover/notes:opacity-100">
            <Pencil className="h-3 w-3" /> Edit
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setNotesDraft("");
            setEditingNotes(true);
          }}
          className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          <Pencil className="h-3 w-3" /> Add notes
        </button>
      )}

      <div className="flex items-center gap-2 pt-1">
        <PriorityBadge priority={task.priority} />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateTaskStatus(task.id, "done");
              router.refresh();
            })
          }
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Mark done
        </Button>
      </div>
    </motion.div>
  );
}
