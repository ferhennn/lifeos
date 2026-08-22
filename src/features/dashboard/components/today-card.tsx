"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Flame, Pencil, Check, X, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/shared/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateTaskStatus, updateTaskNotes, type TaskWithMeta } from "@/features/tasks/actions/tasks.actions";
import { ScheduleItemRow } from "./schedule-item-row";
import { DashboardTaskRow } from "./dashboard-task-row";
import type { ScheduleItem } from "../actions/dashboard.actions";

const UNSCHEDULED_VISIBLE = 6;

export function TodayCard({
  focus,
  queue,
  unscheduled,
}: {
  focus: TaskWithMeta | null;
  queue: ScheduleItem[];
  unscheduled: TaskWithMeta[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSavingNotes, startSavingNotes] = useTransition();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(focus?.description ?? "");

  const visibleUnscheduled = unscheduled.slice(0, UNSCHEDULED_VISIBLE);
  const remainingUnscheduled = unscheduled.length - visibleUnscheduled.length;

  const saveNotes = () => {
    if (!focus) return;
    startSavingNotes(async () => {
      await updateTaskNotes(focus.id, notesDraft.trim());
      setEditingNotes(false);
      router.refresh();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      {focus ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Flame className="h-3.5 w-3.5" /> Today&apos;s Focus
          </div>
          <Link href={`/tasks?openTask=${focus.id}`} className="block">
            <h3 className="text-lg font-semibold leading-snug hover:underline">{focus.title}</h3>
          </Link>
          {(focus.goalTitle || focus.projectTitle) && (
            <p className="text-xs text-muted-foreground">{focus.projectTitle ?? focus.strategyTitle ?? focus.goalTitle}</p>
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
                    setNotesDraft(focus.description ?? "");
                    setEditingNotes(false);
                  }}
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
            </div>
          ) : focus.description ? (
            <button
              type="button"
              onClick={() => {
                setNotesDraft(focus.description ?? "");
                setEditingNotes(true);
              }}
              className="group/notes block w-full rounded-md border border-transparent p-2 -m-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/40"
            >
              <span className="whitespace-pre-wrap">{focus.description}</span>
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
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              <Pencil className="h-3 w-3" /> Add notes
            </button>
          )}

          <div className="flex items-center gap-2">
            <PriorityBadge priority={focus.priority} />
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await updateTaskStatus(focus.id, "done");
                  router.refresh();
                })
              }
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark done
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nothing urgent on your plate. Great time to plan ahead.</p>
        </div>
      )}

      <Tabs defaultValue="queue" className="border-t border-border pt-4">
        <TabsList>
          <TabsTrigger value="queue">Today ({queue.length})</TabsTrigger>
          <TabsTrigger value="unscheduled">
            <Inbox className="h-3.5 w-3.5" /> Unscheduled ({unscheduled.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="queue" className="pt-2">
          {queue.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">Nothing due today.</p>
          ) : (
            <div>
              {queue.map((item) => (
                <ScheduleItemRow key={`${item.source}-${item.id}`} item={item} dense />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="unscheduled" className="pt-2">
          {visibleUnscheduled.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">Every active task has a date — nothing sitting in the backlog.</p>
          ) : (
            <div>
              {visibleUnscheduled.map((task) => (
                <DashboardTaskRow key={task.id} task={task} dense />
              ))}
              {remainingUnscheduled > 0 && (
                <Link href="/tasks" className="mt-1 block px-1 py-1 text-xs text-primary hover:underline">
                  +{remainingUnscheduled} more
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
