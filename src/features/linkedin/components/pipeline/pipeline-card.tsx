"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";

export function PipelineCard({ post, onClick }: { post: LinkedinPostWithPillars; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "cursor-pointer space-y-2 rounded-lg border border-border bg-card p-3 text-left transition-shadow hover:shadow-sm",
        isDragging && "opacity-50",
      )}
    >
      <p className="line-clamp-2 text-sm font-medium leading-snug">{post.hook || post.topic || post.caption || "Untitled"}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {post.pillars.slice(0, 2).map((p) => (
          <Badge key={p.id} variant="outline" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </Badge>
        ))}
        {post.scheduledDate && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" /> {format(parseISO(post.scheduledDate), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
