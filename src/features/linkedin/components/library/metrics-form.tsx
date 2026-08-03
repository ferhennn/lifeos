"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setLinkedinPostMetrics } from "../../actions/posts.actions";
import type { LinkedinPost } from "@/db/schema";

const FIELDS: { key: keyof Pick<LinkedinPost, "likes" | "comments" | "shares" | "impressions" | "views" | "followersGained">; label: string }[] = [
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "impressions", label: "Impressions" },
  { key: "views", label: "Views" },
  { key: "followersGained", label: "Followers Gained" },
];

export function MetricsForm({ post }: { post: LinkedinPost }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, post[f.key]?.toString() ?? ""])),
  );
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" /> Analytics
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-xs">{f.label}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <Button
        size="sm"
        className="mt-3"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await setLinkedinPostMetrics(post.id, {
              likes: values.likes ? Number(values.likes) : null,
              comments: values.comments ? Number(values.comments) : null,
              shares: values.shares ? Number(values.shares) : null,
              impressions: values.impressions ? Number(values.impressions) : null,
              views: values.views ? Number(values.views) : null,
              followersGained: values.followersGained ? Number(values.followersGained) : null,
            });
            toast.success("Analytics updated");
            router.refresh();
          } finally {
            setSaving(false);
          }
        }}
      >
        <Save className="h-3.5 w-3.5" /> Save analytics
      </Button>
    </div>
  );
}
