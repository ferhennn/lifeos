"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { linkedinIdeaSchema, linkedinIdeaPriorities, linkedinIdeaStatuses, type LinkedinIdeaValues } from "../../schema/idea.schema";
import { linkedinIdeaStatusConfig } from "@/lib/status-config";
import type { LinkedinIdea } from "@/db/schema";

const emptyDefaults: LinkedinIdeaValues = {
  title: "",
  description: "",
  referenceLinks: [],
  priority: "medium",
  status: "inbox",
};

function LinksInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((link) => (
          <span key={link} className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
            <span className="truncate">{link}</span>
            <button type="button" onClick={() => onChange(value.filter((l) => l !== link))}>
              <X className="h-3 w-3 shrink-0" />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Paste a link or screenshot URL, press Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            if (!value.includes(draft.trim())) onChange([...value, draft.trim()]);
            setDraft("");
          }
        }}
      />
    </div>
  );
}

export function IdeaFormSheet({
  open,
  onOpenChange,
  idea,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: LinkedinIdea | null;
  isPending: boolean;
  onSubmit: (values: LinkedinIdeaValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LinkedinIdeaValues>({ resolver: zodResolver(linkedinIdeaSchema), defaultValues: emptyDefaults });

  useEffect(() => {
    if (open) {
      reset(
        idea
          ? {
              title: idea.title,
              description: idea.description ?? "",
              referenceLinks: idea.referenceLinks,
              priority: idea.priority,
              status: idea.status,
            }
          : emptyDefaults,
      );
    }
  }, [open, idea, reset]);

  const submit = async (values: LinkedinIdeaValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save idea. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{idea ? "Edit idea" : "New idea"}</SheetTitle>
          <SheetDescription>Quick capture now, flesh out later.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What's the idea?" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {linkedinIdeaPriorities.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {linkedinIdeaStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{linkedinIdeaStatusConfig[s]?.label ?? s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reference links & screenshots</Label>
            <Controller control={control} name="referenceLinks" render={({ field }) => <LinksInput value={field.value} onChange={field.onChange} />} />
          </div>

          <SheetFooter className="mt-auto flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {idea ? "Save changes" : "Capture idea"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={async () => {
                    await onDelete();
                    setConfirmDelete(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SheetContent>
    </Sheet>
  );
}
