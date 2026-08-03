"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordProfileSnapshot } from "../../actions/profile-snapshots.actions";
import type { LinkedinProfileSnapshot } from "@/db/schema";

export function RecordStatsDialog({ latest }: { latest: LinkedinProfileSnapshot | null }) {
  const [open, setOpen] = useState(false);
  const [followers, setFollowers] = useState(latest?.followers?.toString() ?? "");
  const [profileViews, setProfileViews] = useState(latest?.profileViews?.toString() ?? "");
  const [connections, setConnections] = useState(latest?.connections?.toString() ?? "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      recordProfileSnapshot({
        followers: followers ? Number(followers) : null,
        profileViews: profileViews ? Number(profileViews) : null,
        connections: connections ? Number(connections) : null,
      }),
    onSuccess: () => {
      toast.success("Stats updated");
      queryClient.invalidateQueries();
      setOpen(false);
    },
    onError: () => toast.error("Couldn't update stats"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Gauge className="h-4 w-4" /> Update stats
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update profile stats</DialogTitle>
          <DialogDescription>Manual entry until screenshot analytics import lands.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="followers">Followers</Label>
            <Input id="followers" type="number" inputMode="numeric" value={followers} onChange={(e) => setFollowers(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profileViews">Profile views</Label>
            <Input id="profileViews" type="number" inputMode="numeric" value={profileViews} onChange={(e) => setProfileViews(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="connections">Connections</Label>
            <Input id="connections" type="number" inputMode="numeric" value={connections} onChange={(e) => setConnections(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
