"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { dot } from "@/lib/status-config";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { CalendarBucket } from "./calendar-types";

const bucketColor: Record<CalendarBucket, keyof typeof dot> = {
  published: "green",
  scheduled: "blue",
  draft: "neutral",
  missed: "red",
};

export function DayPill({ post, bucket, onClick }: { post: LinkedinPostWithPillars; bucket: CalendarBucket; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "flex w-full items-center gap-1.5 truncate rounded-md border border-border bg-card px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm hover:bg-muted/50",
        isDragging && "opacity-50",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot[bucketColor[bucket]])} />
      <span className="truncate">{post.hook || post.topic || post.caption || "Untitled"}</span>
    </button>
  );
}
