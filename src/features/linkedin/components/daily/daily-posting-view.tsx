"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarCheck2, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { QueueCard } from "./queue-card";
import { PostRow } from "../shared/post-row";
import { PostFormSheet } from "../shared/post-form-sheet";
import { BulkAddSheet } from "./bulk-add-sheet";
import { BulkActionBar } from "./bulk-action-bar";
import {
  createLinkedinPost,
  updateLinkedinPost,
  deleteLinkedinPost,
  duplicateLinkedinPost,
  markLinkedinPostPosted,
  bulkCreateLinkedinPosts,
  bulkDeleteLinkedinPosts,
  bulkSetLinkedinPostsStatus,
  bulkRescheduleLinkedinPosts,
  bulkAssignLinkedinPostsPillar,
  bulkSetLinkedinPostsGoal,
} from "../../actions/posts.actions";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { LinkedinPostValues } from "../../schema/post.schema";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function DailyPostingView({
  queuePost,
  upcomingPosts,
  pillarOptions,
  strategyOptions,
  goalOptions,
}: {
  queuePost: LinkedinPostWithPillars | null;
  upcomingPosts: LinkedinPostWithPillars[];
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedinPostWithPillars | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const refresh = () => router.refresh();

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Today&apos;s queue, front and center.</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={selectMode ? "secondary" : "outline"}
            onClick={() => {
              if (selectMode) clearSelection();
              else setSelectMode(true);
            }}
          >
            {selectMode ? "Cancel select" : "Select"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
            <Upload className="h-4 w-4" /> Bulk add
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingPost(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="lg:sticky lg:top-6">
          {queuePost ? (
            <QueueCard
              post={queuePost}
              isPending={isPending}
              onMarkPosted={() =>
                startTransition(async () => {
                  await markLinkedinPostPosted(queuePost.id);
                  toast.success("Marked posted — queue advances to the next post");
                  refresh();
                })
              }
              onEdit={() => {
                setEditingPost(queuePost);
                setSheetOpen(true);
              }}
              onDuplicate={() =>
                startTransition(async () => {
                  await duplicateLinkedinPost(queuePost.id);
                  toast.success("Post duplicated as a draft");
                  refresh();
                })
              }
            />
          ) : (
            <EmptyState
              icon={CalendarCheck2}
              title="Nothing queued for today"
              description="Schedule a post from the Pipeline, or create one directly here."
              action={
                <Button size="sm" onClick={() => setSheetOpen(true)}>
                  <Plus className="h-4 w-4" /> Create a post
                </Button>
              }
            />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Upcoming</h2>
          {upcomingPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing else scheduled yet.</p>
          ) : (
            <div className="space-y-1.5">
              {upcomingPosts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  selectable={selectMode}
                  selected={selectedIds.has(post.id)}
                  onToggleSelect={(checked) => toggleSelected(post.id, checked)}
                  onEdit={() => {
                    if (selectMode) {
                      toggleSelected(post.id, !selectedIds.has(post.id));
                      return;
                    }
                    setEditingPost(post);
                    setSheetOpen(true);
                  }}
                  onDuplicate={() =>
                    startTransition(async () => {
                      await duplicateLinkedinPost(post.id);
                      toast.success("Post duplicated");
                      refresh();
                    })
                  }
                  onDelete={() =>
                    startTransition(async () => {
                      await deleteLinkedinPost(post.id);
                      toast.success("Post deleted");
                      refresh();
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PostFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingPost(null);
        }}
        post={editingPost}
        pillarOptions={pillarOptions}
        strategyOptions={strategyOptions}
        goalOptions={goalOptions}
        isPending={isPending}
        onSubmit={async (values: LinkedinPostValues) => {
          await new Promise<void>((resolve, reject) => {
            startTransition(async () => {
              try {
                if (editingPost) {
                  await updateLinkedinPost(editingPost.id, values);
                  toast.success("Post updated");
                } else {
                  await createLinkedinPost(values);
                  toast.success("Post created");
                }
                refresh();
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          });
        }}
        onDelete={
          editingPost
            ? async () => {
                await deleteLinkedinPost(editingPost.id);
                toast.success("Post deleted");
                setSheetOpen(false);
                refresh();
              }
            : undefined
        }
      />

      <BulkActionBar
        count={selectedIds.size}
        pillarOptions={pillarOptions}
        goalOptions={goalOptions}
        isPending={isPending}
        onClear={clearSelection}
        onSetStatus={(status) =>
          startTransition(async () => {
            const ids = Array.from(selectedIds);
            await bulkSetLinkedinPostsStatus(ids, status);
            toast.success(`${ids.length} post${ids.length === 1 ? "" : "s"} updated`);
            refresh();
          })
        }
        onSetDate={(date) =>
          startTransition(async () => {
            const ids = Array.from(selectedIds);
            await bulkRescheduleLinkedinPosts(ids, date);
            toast.success(`${ids.length} post${ids.length === 1 ? "" : "s"} rescheduled`);
            refresh();
          })
        }
        onAssignPillar={(pillarId) =>
          startTransition(async () => {
            const ids = Array.from(selectedIds);
            await bulkAssignLinkedinPostsPillar(ids, pillarId);
            toast.success(`Pillar assigned to ${ids.length} post${ids.length === 1 ? "" : "s"}`);
            refresh();
          })
        }
        onSetGoal={(goalId) =>
          startTransition(async () => {
            const ids = Array.from(selectedIds);
            await bulkSetLinkedinPostsGoal(ids, goalId);
            toast.success(`Goal set on ${ids.length} post${ids.length === 1 ? "" : "s"}`);
            refresh();
          })
        }
        onDelete={() =>
          startTransition(async () => {
            const ids = Array.from(selectedIds);
            await bulkDeleteLinkedinPosts(ids);
            toast.success(`${ids.length} post${ids.length === 1 ? "" : "s"} deleted`);
            clearSelection();
            refresh();
          })
        }
      />

      <BulkAddSheet
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        pillarOptions={pillarOptions}
        isPending={isPending}
        onImport={async (values) => {
          await new Promise<void>((resolve, reject) => {
            startTransition(async () => {
              try {
                const rows = await bulkCreateLinkedinPosts(values);
                toast.success(`${rows.length} post${rows.length === 1 ? "" : "s"} imported`);
                setBulkOpen(false);
                refresh();
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          });
        }}
      />
    </div>
  );
}
