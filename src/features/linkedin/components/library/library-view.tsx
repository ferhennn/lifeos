"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Search, Star, Library as LibraryIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { linkedinPostStatusConfig, dot, linkedinPostPipelineStatuses } from "@/lib/status-config";
import { PostFormSheet } from "../shared/post-form-sheet";
import { toggleLinkedinPostFavorite, createLinkedinPost } from "../../actions/posts.actions";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { LinkedinPostValues } from "../../schema/post.schema";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

export function LibraryView({
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all");
  const [pillarFilter, setPillarFilter] = useState("__all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => (q ? [p.topic, p.hook, p.caption].some((f) => f?.toLowerCase().includes(q)) : true))
      .filter((p) => (statusFilter === "__all" ? true : p.status === statusFilter))
      .filter((p) => (pillarFilter === "__all" ? true : p.pillars.some((pl) => pl.id === pillarFilter)))
      .filter((p) => (favoritesOnly ? p.isFavorite : true))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [posts, query, statusFilter, pillarFilter, favoritesOnly]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "__all")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All statuses</SelectItem>
            {linkedinPostPipelineStatuses.map((s) => (
              <SelectItem key={s} value={s}>{linkedinPostStatusConfig[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={pillarFilter} onValueChange={(v) => setPillarFilter(v ?? "__all")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All pillars</SelectItem>
            {pillarOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant={favoritesOnly ? "default" : "outline"}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          <Star className="h-3.5 w-3.5" /> Favorites
        </Button>
        <Button size="sm" className="ml-auto" onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={LibraryIcon} title="No posts found" description="Try a different search or filter, or create a new post." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => {
            const config = linkedinPostStatusConfig[post.status];
            return (
              <div key={post.id} className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-amber-500"
                  onClick={async () => {
                    await toggleLinkedinPostFavorite(post.id, !post.isFavorite);
                    router.refresh();
                  }}
                >
                  <Star className={cn("h-4 w-4", post.isFavorite && "fill-amber-500 text-amber-500")} />
                </button>
                <Link href={`/linkedin/library/${post.id}`} className="space-y-2 pr-6">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("h-1.5 w-1.5 rounded-full", dot[config.color])} />
                    {config.label}
                    {post.scheduledDate && <span>· {format(parseISO(post.scheduledDate), "MMM d, yyyy")}</span>}
                  </div>
                  <p className="line-clamp-3 text-sm font-medium leading-snug hover:underline">
                    {post.hook || post.topic || post.caption || "Untitled post"}
                  </p>
                </Link>
                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  {post.pillars.slice(0, 3).map((p) => (
                    <Badge key={p.id} variant="outline" className="gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </Badge>
                  ))}
                </div>
                {(post.likes != null || post.comments != null || post.shares != null) && (
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{post.likes ?? 0} likes</span>
                    <span>{post.comments ?? 0} comments</span>
                    <span>{post.shares ?? 0} shares</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <PostFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pillarOptions={pillarOptions}
        strategyOptions={strategyOptions}
        goalOptions={goalOptions}
        isPending={isPending}
        onSubmit={async (values: LinkedinPostValues) => {
          setIsPending(true);
          try {
            await createLinkedinPost(values);
            toast.success("Post created");
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
      />
    </div>
  );
}
