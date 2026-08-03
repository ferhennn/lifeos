"use client";

import { format, parseISO } from "date-fns";
import { Edit, Copy as CopyIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { linkedinPostStatusConfig, dot } from "@/lib/status-config";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";

export function PostRow({
  post,
  onEdit,
  onDuplicate,
  onDelete,
  selectable,
  selected,
  onToggleSelect,
}: {
  post: LinkedinPostWithPillars;
  onEdit: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (checked: boolean) => void;
}) {
  const config = linkedinPostStatusConfig[post.status];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
      {selectable && (
        <Checkbox checked={selected ?? false} onCheckedChange={(checked) => onToggleSelect?.(checked === true)} />
      )}
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[config.color]}`} />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 truncate text-left hover:underline">
        {post.hook || post.topic || post.caption || "Untitled post"}
      </button>
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        {post.pillars.slice(0, 2).map((p) => (
          <Badge key={p.id} variant="outline" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </Badge>
        ))}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {post.scheduledDate ? format(parseISO(post.scheduledDate), "MMM d") : "Unscheduled"}
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5" />
        </Button>
        {onDuplicate && (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate}>
            <CopyIcon className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
