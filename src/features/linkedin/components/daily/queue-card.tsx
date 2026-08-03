"use client";

import { format, parseISO } from "date-fns";
import { CheckCircle2, Copy as CopyIcon, Edit, ImageIcon, Sparkles, Clock, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { linkedinPostStatusConfig, dot } from "@/lib/status-config";
import { CopyButton } from "./copy-button";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";

export function QueueCard({
  post,
  isPending,
  onMarkPosted,
  onEdit,
  onDuplicate,
}: {
  post: LinkedinPostWithPillars;
  isPending: boolean;
  onMarkPosted: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  const config = linkedinPostStatusConfig[post.status];
  const carouselText = post.carouselSlides?.length
    ? post.carouselSlides.map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.body}`).join("\n\n")
    : "";

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot[config.color]}`} />
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
        {post.scheduledDate && (
          <span className="text-xs text-muted-foreground">· {format(parseISO(post.scheduledDate), "EEEE, MMM d")}</span>
        )}
        {post.dayNumber && <Badge variant="outline">Day {post.dayNumber}</Badge>}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {post.pillars.map((p) => (
            <Badge key={p.id} variant="outline" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </Badge>
          ))}
        </div>
      </div>

      {post.hook && <p className="text-lg font-medium leading-snug">{post.hook}</p>}
      {post.caption && <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.caption}</p>}
      {post.cta && <p className="text-sm font-medium text-primary">{post.cta}</p>}
      {post.hashtags.length > 0 && <p className="text-sm text-muted-foreground">{post.hashtags.join(" ")}</p>}

      {(post.estimatedReadingTime || post.targetAudience) && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {post.estimatedReadingTime != null && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.estimatedReadingTime} min read</span>
          )}
          {post.targetAudience && (
            <span className="flex items-center gap-1"><Users2 className="h-3 w-3" /> {post.targetAudience}</span>
          )}
        </div>
      )}

      {post.notes && (
        <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">Notes: </span>
          {post.notes}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <CopyButton label="Hook" getText={() => post.hook ?? ""} />
        <CopyButton label="Caption" getText={() => post.caption ?? ""} />
        <CopyButton label="Hashtags" getText={() => post.hashtags.join(" ")} />
        <CopyButton label="Carousel" getText={() => carouselText} />
        <CopyButton label="Image Prompt" getText={() => post.imagePrompt ?? ""} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={isPending || post.status === "published"} onClick={onMarkPosted}>
          <CheckCircle2 className="h-4 w-4" /> {post.status === "published" ? "Posted" : "Mark Posted"}
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4" /> Edit
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={onDuplicate}>
          <CopyIcon className="h-4 w-4" /> Duplicate
        </Button>
        <Tooltip>
          <TooltipTrigger render={<Button size="sm" variant="outline" disabled />}>
            <ImageIcon className="h-4 w-4" /> Generate Image
          </TooltipTrigger>
          <TooltipContent>AI Writer coming soon</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button size="sm" variant="outline" disabled />}>
            <Sparkles className="h-4 w-4" /> Generate Carousel
          </TooltipTrigger>
          <TooltipContent>AI Writer coming soon</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
