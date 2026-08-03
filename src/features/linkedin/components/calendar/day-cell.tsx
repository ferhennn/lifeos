"use client";

import { useDroppable } from "@dnd-kit/core";
import { format, isToday } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPill } from "./day-pill";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { CalendarBucket } from "./calendar-types";

export function DayCell({
  date,
  inCurrentMonth = true,
  posts,
  bucketOf,
  onPostClick,
  onAddClick,
  compact = false,
}: {
  date: Date;
  inCurrentMonth?: boolean;
  posts: LinkedinPostWithPillars[];
  bucketOf: (post: LinkedinPostWithPillars) => CalendarBucket;
  onPostClick: (post: LinkedinPostWithPillars) => void;
  onAddClick: (dateStr: string) => void;
  compact?: boolean;
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex flex-col gap-1 border border-transparent p-1.5",
        compact ? "min-h-24" : "min-h-28",
        !inCurrentMonth && "opacity-40",
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-0.5">
        <span className={cn("text-xs", isToday(date) ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground" : "text-muted-foreground")}>
          {format(date, "d")}
        </span>
        <button
          type="button"
          onClick={() => onAddClick(dateStr)}
          className="hidden h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted group-hover:flex"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {posts.map((post) => (
          <DayPill key={post.id} post={post} bucket={bucketOf(post)} onClick={() => onPostClick(post)} />
        ))}
      </div>
    </div>
  );
}
