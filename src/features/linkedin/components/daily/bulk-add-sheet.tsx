"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { linkedinPostStatusConfig } from "@/lib/status-config";
import { BULK_POST_TEMPLATE, parseBulkPostsText } from "../../lib/bulk-post-parser";
import type { LinkedinPostValues } from "../../schema/post.schema";
import type { PillarOption } from "../../actions/pillars.actions";

export function BulkAddSheet({
  open,
  onOpenChange,
  pillarOptions,
  isPending,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillarOptions: PillarOption[];
  isPending: boolean;
  onImport: (values: LinkedinPostValues[]) => Promise<void> | void;
}) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => (text.trim() ? parseBulkPostsText(text, pillarOptions) : []), [text, pillarOptions]);

  const copyFormat = async () => {
    await navigator.clipboard.writeText(BULK_POST_TEMPLATE);
    setCopied(true);
    toast.success("Format copied — fill it in, then paste it back here");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setText("");
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Bulk add posts</SheetTitle>
          <SheetDescription>
            Copy the format, fill in as many posts as you want, separate each with a line of <code>----</code>, then paste them all back below.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4">
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={copyFormat}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            Copy format
          </Button>

          <Textarea
            placeholder="Paste your filled-in posts here, separated by ----"
            rows={16}
            className="font-mono text-xs"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {text.trim() && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {parsed.length} post{parsed.length === 1 ? "" : "s"} detected
              </p>
              {parsed.length > 0 && (
                <div className="max-h-64 space-y-1.5 overflow-y-auto">
                  {parsed.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                      <Badge variant="outline">{linkedinPostStatusConfig[p.status]?.label ?? p.status}</Badge>
                      <span className="min-w-0 flex-1 truncate">{p.hook || p.topic || p.caption || "(untitled)"}</span>
                      {p.scheduledDate && <span className="shrink-0 text-muted-foreground">{p.scheduledDate}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="mt-auto px-0">
          <Button
            disabled={isPending || parsed.length === 0}
            onClick={async () => {
              await onImport(parsed);
              setText("");
            }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import {parsed.length > 0 ? parsed.length : ""} post{parsed.length === 1 ? "" : "s"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
