"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Edit, Trash2, Star, Clock, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { linkedinPostStatusConfig, dot } from "@/lib/status-config";
import { PostFormSheet } from "../shared/post-form-sheet";
import { MetricsForm } from "./metrics-form";
import { RevisionHistory } from "./revision-history";
import { RelatedPosts } from "./related-posts";
import { updateLinkedinPost, deleteLinkedinPost, toggleLinkedinPostFavorite } from "../../actions/posts.actions";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { LinkedinPostRevision } from "@/db/schema";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function PostDetail({
  post,
  revisions,
  relatedPosts,
  pillarOptions,
  strategyOptions,
  goalOptions,
}: {
  post: LinkedinPostWithPillars;
  revisions: LinkedinPostRevision[];
  relatedPosts: LinkedinPostWithPillars[];
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
}) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const config = linkedinPostStatusConfig[post.status];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", dot[config.color])} />
            <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
            {post.scheduledDate && <span className="text-xs text-muted-foreground">· {format(parseISO(post.scheduledDate), "MMM d, yyyy")}</span>}
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={async () => {
                  await toggleLinkedinPostFavorite(post.id, !post.isFavorite);
                  router.refresh();
                }}
              >
                <Star className={cn("h-4 w-4", post.isFavorite && "fill-amber-500 text-amber-500")} />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {post.topic && <p className="text-xs text-muted-foreground">{post.topic}</p>}
          {post.hook && <p className="text-lg font-medium leading-snug">{post.hook}</p>}
          {post.caption && <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.caption}</p>}
          {post.cta && <p className="text-sm font-medium text-primary">{post.cta}</p>}
          {post.hashtags.length > 0 && <p className="text-sm text-muted-foreground">{post.hashtags.join(" ")}</p>}

          {post.carouselSlides && post.carouselSlides.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Carousel ({post.carouselSlides.length} slides)</p>
              {post.carouselSlides.map((s, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-2.5 text-xs">
                  <p className="font-medium">{i + 1}. {s.title}</p>
                  <p className="text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          )}

          {post.imagePrompt && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Image prompt</p>
              <p className="text-sm">{post.imagePrompt}</p>
            </div>
          )}

          {(post.estimatedReadingTime || post.targetAudience) && (
            <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
              {post.estimatedReadingTime != null && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.estimatedReadingTime} min read</span>
              )}
              {post.targetAudience && <span className="flex items-center gap-1"><Users2 className="h-3 w-3" /> {post.targetAudience}</span>}
            </div>
          )}

          {post.notes && (
            <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">Notes: </span>{post.notes}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {post.pillars.map((p) => (
              <Badge key={p.id} variant="outline" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </Badge>
            ))}
          </div>
        </div>

        <MetricsForm post={post} />
      </div>

      <div className="space-y-4">
        <RevisionHistory revisions={revisions} />
        <RelatedPosts posts={relatedPosts} />
      </div>

      <PostFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        post={post}
        pillarOptions={pillarOptions}
        strategyOptions={strategyOptions}
        goalOptions={goalOptions}
        isPending={isPending}
        onSubmit={async (values) => {
          setIsPending(true);
          try {
            await updateLinkedinPost(post.id, values);
            toast.success("Post updated");
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                await deleteLinkedinPost(post.id);
                toast.success("Post deleted");
                router.push("/linkedin/library");
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
