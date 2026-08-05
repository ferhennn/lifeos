"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { History, MoreHorizontal, ExternalLink, Copy as CopyIcon, Edit, BarChart3, Library as LibraryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { linkedinPostStatusConfig, dot } from "@/lib/status-config";
import { PostFormSheet } from "../shared/post-form-sheet";
import { duplicateLinkedinPost, updateLinkedinPost } from "../../actions/posts.actions";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { LinkedinPostValues } from "../../schema/post.schema";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

function metricCell(value: number | null | undefined) {
  return value != null ? value : <span className="text-muted-foreground">No data</span>;
}

export function RecentPosts({
  posts,
  pillarOptions,
  strategyOptions,
  goalOptions,
}: {
  posts: LinkedinPostWithPillars[];
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<LinkedinPostWithPillars | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDuplicate(id: string) {
    await duplicateLinkedinPost(id);
    toast.success("Post duplicated");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Recent Posts
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={LibraryIcon}
          title="No posts yet"
          description="Import your first content plan or create your first post."
          action={
            <div className="flex gap-2">
              <Button size="sm" render={<Link href="/linkedin/daily" />}>Import JSON</Button>
              <Button size="sm" variant="outline" render={<Link href="/linkedin/library" />}>Create Post</Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-1">
          {posts.map((post) => {
            const config = linkedinPostStatusConfig[post.status];
            const title = post.hook || post.topic || post.caption || "Untitled post";
            const dateStr = post.postedAt
              ? format(new Date(post.postedAt), "MMM d")
              : post.scheduledDate
                ? format(parseISO(post.scheduledDate), "MMM d")
                : "Unscheduled";
            return (
              <div key={post.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[config.color]}`} />
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{config.label}</span>
                <Link href={`/linkedin/library/${post.id}`} className="min-w-0 flex-1 truncate hover:underline">
                  {title}
                </Link>
                <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">{dateStr}</span>
                <span className="hidden w-12 shrink-0 text-right text-xs text-muted-foreground lg:inline">{metricCell(post.views)}</span>
                <span className="hidden w-12 shrink-0 text-right text-xs text-muted-foreground lg:inline">{metricCell(post.likes)}</span>
                <span className="hidden w-12 shrink-0 text-right text-xs text-muted-foreground lg:inline">{metricCell(post.comments)}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/linkedin/library/${post.id}`)}>
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditing(post)}>
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                      <CopyIcon className="h-3.5 w-3.5" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/linkedin/analytics")}>
                      <BarChart3 className="h-3.5 w-3.5" /> View Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <PostFormSheet
        open={editing != null}
        onOpenChange={(open) => !open && setEditing(null)}
        post={editing}
        pillarOptions={pillarOptions}
        strategyOptions={strategyOptions}
        goalOptions={goalOptions}
        isPending={isPending}
        onSubmit={async (values: LinkedinPostValues) => {
          if (!editing) return;
          setIsPending(true);
          try {
            await updateLinkedinPost(editing.id, values);
            toast.success("Post updated");
            setEditing(null);
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
      />
    </div>
  );
}
