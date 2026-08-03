"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLinkedinPostPosted } from "@/features/linkedin/actions/posts.actions";
import type { LinkedinPost } from "@/db/schema";

export function TodayLinkedinCard({ post }: { post: LinkedinPost | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!post) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-5">
        <Share2 className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No LinkedIn post scheduled for today.</p>
        <Link href="/linkedin" className="ml-auto text-xs font-medium text-primary hover:underline">
          Plan lineup
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <Share2 className="h-3.5 w-3.5" /> Today&apos;s LinkedIn Post
      </div>
      <Link href="/linkedin" className="block">
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-snug hover:underline">{post.caption || post.hook || post.topic}</p>
      </Link>
      <div className="flex items-center gap-2 pt-1">
        {post.status === "published" ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" /> Posted
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await markLinkedinPostPosted(post.id);
                router.refresh();
              })
            }
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as posted
          </Button>
        )}
      </div>
    </motion.div>
  );
}
