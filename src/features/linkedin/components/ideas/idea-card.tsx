"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { linkedinIdeaStatusConfig } from "@/lib/status-config";
import type { LinkedinIdea } from "@/db/schema";

export function IdeaCard({
  idea,
  onEdit,
  onConvert,
  isConverting,
}: {
  idea: LinkedinIdea;
  onEdit: () => void;
  onConvert: () => void;
  isConverting: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5">
        <StatusBadge config={linkedinIdeaStatusConfig} status={idea.status} />
        <PriorityBadge priority={idea.priority} />
      </div>
      <button type="button" onClick={onEdit} className="text-left">
        <p className="line-clamp-2 text-sm font-medium leading-snug hover:underline">{idea.title}</p>
      </button>
      {idea.description && <p className="line-clamp-2 text-xs text-muted-foreground">{idea.description}</p>}
      {idea.referenceLinks.length > 0 && (
        <p className="text-xs text-muted-foreground">{idea.referenceLinks.length} link{idea.referenceLinks.length === 1 ? "" : "s"}</p>
      )}
      <div className="mt-auto flex items-center gap-2 pt-1">
        <Tooltip>
          <TooltipTrigger render={<Button size="sm" variant="outline" disabled />}>
            <Sparkles className="h-3.5 w-3.5" /> AI Expand
          </TooltipTrigger>
          <TooltipContent>AI Writer coming soon</TooltipContent>
        </Tooltip>
        {idea.status !== "converted" && (
          <Button size="sm" variant="outline" disabled={isConverting} onClick={onConvert} className="ml-auto">
            <ArrowRight className="h-3.5 w-3.5" /> Convert to Draft
          </Button>
        )}
      </div>
    </div>
  );
}
