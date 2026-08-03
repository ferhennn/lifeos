import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PostDetail } from "@/features/linkedin/components/library/post-detail";
import { getLinkedinPost, listPostRevisions, listRelatedPosts } from "@/features/linkedin/actions/posts.actions";
import { listPillarOptions } from "@/features/linkedin/actions/pillars.actions";
import { listLinkedinStrategyOptions } from "@/features/linkedin/actions/strategies.actions";
import { listGoalOptions } from "@/features/goals/actions/goals.actions";

export const metadata: Metadata = { title: "Post — LifeOS" };

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await getLinkedinPost(postId);
  if (!post) notFound();

  const [revisions, relatedPosts, pillarOptions, strategyOptions, goalOptions] = await Promise.all([
    listPostRevisions(postId),
    listRelatedPosts(postId, post.pillars.map((p) => p.id)),
    listPillarOptions(),
    listLinkedinStrategyOptions(),
    listGoalOptions(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={post.topic || post.hook || "Untitled post"} description="Content Library" />
      <PostDetail
        post={post}
        revisions={revisions}
        relatedPosts={relatedPosts}
        pillarOptions={pillarOptions}
        strategyOptions={strategyOptions}
        goalOptions={goalOptions}
      />
    </div>
  );
}
