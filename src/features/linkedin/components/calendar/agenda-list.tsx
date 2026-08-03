"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { PostRow } from "../shared/post-row";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";

export function AgendaList({ posts, onPostClick }: { posts: LinkedinPostWithPillars[]; onPostClick: (post: LinkedinPostWithPillars) => void }) {
  const grouped = useMemo(() => {
    const map = new Map<string, LinkedinPostWithPillars[]>();
    for (const post of posts) {
      if (!post.scheduledDate) continue;
      const key = format(parseISO(post.scheduledDate), "EEEE, MMM d");
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    return Array.from(map.entries());
  }, [posts]);

  if (grouped.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">Nothing scheduled in this range.</p>;
  }

  return (
    <div className="space-y-5 p-4">
      {grouped.map(([label, dayPosts]) => (
        <div key={label} className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h3>
          <div className="space-y-1.5">
            {dayPosts.map((post) => (
              <PostRow key={post.id} post={post} onEdit={() => onPostClick(post)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
