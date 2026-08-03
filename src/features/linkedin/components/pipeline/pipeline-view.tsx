"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "./pipeline-board";
import { PostFormSheet } from "../shared/post-form-sheet";
import {
  listLinkedinPosts,
  createLinkedinPost,
  updateLinkedinPost,
  deleteLinkedinPost,
  setLinkedinPostStatus,
  type LinkedinPostWithPillars,
} from "../../actions/posts.actions";
import type { LinkedinPostValues } from "../../schema/post.schema";
import type { linkedinPostPipelineStatuses } from "@/lib/status-config";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function PipelineView({
  initialPosts,
  pillarOptions,
  strategyOptions,
  goalOptions,
}: {
  initialPosts: LinkedinPostWithPillars[];
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
}) {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedinPostWithPillars | null>(null);

  const { data: posts = [] } = useQuery({
    queryKey: ["linkedin-posts"],
    queryFn: listLinkedinPosts,
    initialData: initialPosts,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["linkedin-posts"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: (typeof linkedinPostPipelineStatuses)[number] }) =>
      setLinkedinPostStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["linkedin-posts"] });
      const previous = queryClient.getQueryData<LinkedinPostWithPillars[]>(["linkedin-posts"]);
      queryClient.setQueryData<LinkedinPostWithPillars[]>(["linkedin-posts"], (old) =>
        old?.map((p) => (p.id === id ? { ...p, status } : p)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["linkedin-posts"], context?.previous);
      toast.error("Couldn't update status");
    },
    onSettled: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: (values: LinkedinPostValues) => createLinkedinPost(values),
    onSuccess: () => {
      toast.success("Post created");
      invalidate();
    },
    onError: () => toast.error("Couldn't create post"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: LinkedinPostValues }) => updateLinkedinPost(id, values),
    onSuccess: () => {
      toast.success("Post updated");
      invalidate();
    },
    onError: () => toast.error("Couldn't update post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLinkedinPost(id),
    onSuccess: () => {
      toast.success("Post deleted");
      setSheetOpen(false);
      invalidate();
    },
    onError: () => toast.error("Couldn't delete post"),
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex justify-end">
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

      <PipelineBoard
        posts={posts}
        onCardClick={(post) => {
          setEditingPost(post);
          setSheetOpen(true);
        }}
        onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
      />

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
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editingPost) {
            await updateMutation.mutateAsync({ id: editingPost.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
        onDelete={editingPost ? () => deleteMutation.mutateAsync(editingPost.id) : undefined}
      />
    </div>
  );
}
