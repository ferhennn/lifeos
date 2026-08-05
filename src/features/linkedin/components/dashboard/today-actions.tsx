"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListChecks } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { linkedinEngagementItems, linkedinEngagementLabels } from "../../schema/engagement.schema";
import { setEngagementItem } from "../../actions/engagement.actions";
import { markLinkedinPostPosted } from "../../actions/posts.actions";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";
import type { LinkedinEngagementLog } from "@/db/schema";

const ENGAGEMENT_MINUTES: Record<(typeof linkedinEngagementItems)[number], number> = {
  repliedToComments: 5,
  commentedOnPosts: 10,
  connectedWithPeople: 5,
  repliedToDms: 5,
  acceptedRequests: 3,
  visitedProfiles: 5,
};
const PUBLISH_MINUTES = 10;

export function TodayActions({
  data,
  engagementLog,
}: {
  data: LinkedinDashboardData;
  engagementLog: LinkedinEngagementLog | null;
}) {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(linkedinEngagementItems.map((item) => [item, engagementLog?.[item] ?? false])),
  );

  const post = data.todaysQueuePost;
  const [postPublished, setPostPublished] = useState(post?.status === "published");

  const engagementMutation = useMutation({
    mutationFn: ({ item, checked }: { item: (typeof linkedinEngagementItems)[number]; checked: boolean }) =>
      setEngagementItem(item, checked),
    onError: (_err, vars) => {
      setCheckedItems((prev) => ({ ...prev, [vars.item]: !vars.checked }));
      toast.error("Couldn't update checklist");
    },
    onSuccess: () => router.refresh(),
  });

  const publishMutation = useMutation({
    mutationFn: () => markLinkedinPostPosted(post!.id),
    onError: () => {
      setPostPublished(false);
      toast.error("Couldn't mark post as posted");
    },
    onSuccess: () => {
      toast.success("Marked as posted");
      router.refresh();
    },
  });

  const totalTasks = linkedinEngagementItems.length + (post ? 1 : 0);
  const completedTasks = linkedinEngagementItems.filter((item) => checkedItems[item]).length + (postPublished ? 1 : 0);

  const remainingMinutes =
    (postPublished ? 0 : post ? PUBLISH_MINUTES : 0) +
    linkedinEngagementItems.filter((item) => !checkedItems[item]).reduce((sum, item) => sum + ENGAGEMENT_MINUTES[item], 0);

  const postLabel = post ? (post.dayNumber ? `Day ${post.dayNumber}` : post.topic || post.hook || "today's post") : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ListChecks className="h-3.5 w-3.5" /> Today&apos;s Actions
      </div>

      <div className="space-y-2">
        {post && (
          <label className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm">
            <Checkbox
              checked={postPublished}
              disabled={postPublished || publishMutation.isPending}
              onCheckedChange={(checked) => {
                if (checked !== true) return;
                setPostPublished(true);
                publishMutation.mutate();
              }}
            />
            <span className={postPublished ? "text-muted-foreground line-through" : ""}>Publish {postLabel}</span>
          </label>
        )}
        {linkedinEngagementItems.map((item) => (
          <label key={item} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm">
            <Checkbox
              checked={checkedItems[item]}
              disabled={engagementMutation.isPending}
              onCheckedChange={(checked) => {
                const next = checked === true;
                setCheckedItems((prev) => ({ ...prev, [item]: next }));
                engagementMutation.mutate({ item, checked: next });
              }}
            />
            <span className={checkedItems[item] ? "text-muted-foreground line-through" : ""}>{linkedinEngagementLabels[item]}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {completedTasks} / {totalTasks} completed
            </span>
          </div>
          <Progress value={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100}>
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Estimated Time</p>
          <p className="text-sm font-medium">{remainingMinutes > 0 ? `${remainingMinutes} mins` : "All done"}</p>
        </div>
      </div>
    </div>
  );
}
