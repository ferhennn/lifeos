"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Target, Compass, FolderKanban, Zap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { quickCreateTask } from "@/features/tasks/actions/tasks.actions";

export function QuickCaptureFab() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const capture = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      await quickCreateTask({ title: title.trim() });
      setTitle("");
      toast.success("Task captured");
      router.refresh();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-40 h-13 w-13 rounded-full shadow-lg transition-transform hover:scale-105"
          />
        }
      >
        <Zap className="h-5 w-5" />
        <span className="sr-only">Quick capture</span>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Jot a task, refine it later..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && capture()}
          />
        </div>
        <Button size="sm" className="w-full" disabled={!title.trim() || isPending} onClick={capture}>
          <Plus className="h-3.5 w-3.5" /> Add task
        </Button>
        <div className="flex items-center gap-1.5 border-t border-border pt-3">
          <Button size="sm" variant="outline" className="flex-1" render={<Link href="/goals?new=1" />}>
            <Target className="h-3.5 w-3.5" /> Goal
          </Button>
          <Button size="sm" variant="outline" className="flex-1" render={<Link href="/strategies?new=1" />}>
            <Compass className="h-3.5 w-3.5" /> Strategy
          </Button>
          <Button size="sm" variant="outline" className="flex-1" render={<Link href="/projects?new=1" />}>
            <FolderKanban className="h-3.5 w-3.5" /> Project
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
