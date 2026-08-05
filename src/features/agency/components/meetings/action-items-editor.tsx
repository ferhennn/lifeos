"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addMeetingActionItem,
  toggleMeetingActionItem,
  deleteMeetingActionItem,
  convertMeetingActionItemToTask,
} from "../../actions/agency-meetings.actions";
import type { AgencyMeetingActionItem } from "@/db/schema";

export function ActionItemsEditor({ meetingId, initialItems }: { meetingId: string; initialItems: AgencyMeetingActionItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleAdd() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const next = await addMeetingActionItem(meetingId, text);
    setItems(next);
  }

  async function handleToggle(itemId: string, done: boolean) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, done } : i)));
    await toggleMeetingActionItem(meetingId, itemId, done);
  }

  async function handleDelete(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await deleteMeetingActionItem(meetingId, itemId);
  }

  async function handleConvert(itemId: string) {
    setPendingId(itemId);
    try {
      await convertMeetingActionItemToTask(meetingId, itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, taskId: "pending" } : i)));
      toast.success("Task created");
    } catch {
      toast.error("Couldn't create task");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
          <Checkbox checked={item.done} onCheckedChange={(checked) => handleToggle(item.id, checked === true)} />
          <span className={item.done ? "flex-1 truncate text-sm text-muted-foreground line-through" : "flex-1 truncate text-sm"}>
            {item.text}
          </span>
          {!item.taskId && (
            <Button type="button" size="icon-xs" variant="ghost" disabled={pendingId === item.id} onClick={() => handleConvert(item.id)}>
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
          <Button type="button" size="icon-xs" variant="ghost" onClick={() => handleDelete(item.id)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add action item and press Enter"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" size="icon-sm" variant="outline" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
