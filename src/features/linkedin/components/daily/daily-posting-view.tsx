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
import {
  createLinkedinPost,
  updateLinkedinPost,
  deleteLinkedinPost,
  duplicateLinkedinPost,
  markLinkedinPostPosted,
  bulkCreateLinkedinPosts,
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

  const refresh = () => router.refresh();

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Today&apos;s queue, front and center.</p>
        <div className="flex items-center gap-2">
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
                onEdit={() => {
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
