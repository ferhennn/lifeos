import Link from "next/link";
import { Link2 } from "lucide-react";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";

export function RelatedPosts({ posts }: { posts: LinkedinPostWithPillars[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" /> Related Posts
      </div>
      {posts.length === 0 ? (
        <p className="text-xs text-muted-foreground">No related posts sharing a pillar yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/linkedin/library/${p.id}`} className="block truncate text-xs hover:text-foreground hover:underline text-foreground/80">
              {p.hook || p.topic || p.caption || "Untitled post"}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
