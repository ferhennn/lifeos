"use client";

import { useState } from "react";
import { useForm, useWatch, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { agencyNoteSchema, type AgencyNoteValues } from "../../schema/agency-note.schema";
import type { AgencyNoteWithLinks } from "../../actions/agency-notes.actions";
import type { AgencyProjectOption } from "../../actions/agency-projects.actions";
import type { AgencyTaskOption } from "../../actions/agency-tasks.actions";
import type { AgencyMeetingOption } from "../../actions/agency-meetings.actions";

const NONE = "__none";

function NotePreview({ control }: { control: Control<AgencyNoteValues> }) {
  const content = useWatch({ control, name: "contentMarkdown" });
  return content ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  ) : (
    <p className="text-muted-foreground">Nothing to preview yet.</p>
  );
}

const emptyDefaults: AgencyNoteValues = {
  title: "",
  contentMarkdown: "",
  agencyProjectId: "",
  agencyTaskId: "",
  meetingId: "",
};

export function NoteFormSheet({
  open,
  onOpenChange,
  note,
  projectOptions,
  taskOptions,
  meetingOptions,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: AgencyNoteWithLinks | null;
  projectOptions: AgencyProjectOption[];
  taskOptions: AgencyTaskOption[];
  meetingOptions: AgencyMeetingOption[];
  isPending: boolean;
  onSubmit: (values: AgencyNoteValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("write");
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AgencyNoteValues>({
    resolver: zodResolver(agencyNoteSchema),
    defaultValues: emptyDefaults,
  });

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTab("write");
      reset(
        note
          ? {
              title: note.title,
              contentMarkdown: note.contentMarkdown,
              agencyProjectId: note.agencyProjectId ?? "",
              agencyTaskId: note.agencyTaskId ?? "",
              meetingId: note.meetingId ?? "",
            }
          : emptyDefaults,
      );
    }
  }

  const submit = async (values: AgencyNoteValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save note. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{note ? "Edit note" : "New note"}</SheetTitle>
          <SheetDescription>Markdown, linked to a project, task, or meeting.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Note title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea rows={12} placeholder="Write in markdown..." {...register("contentMarkdown")} />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-64 rounded-lg border border-border p-3 text-sm [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:mt-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:font-medium [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc">
                  <NotePreview control={control} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Project</Label>
              <Controller
                control={control}
                name="agencyProjectId"
                render={({ field }) => (
                  <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {projectOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Task</Label>
              <Controller
                control={control}
                name="agencyTaskId"
                render={({ field }) => (
                  <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {taskOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Meeting</Label>
              <Controller
                control={control}
                name="meetingId"
                render={({ field }) => (
                  <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {meetingOptions.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <SheetFooter className="flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {note ? "Save changes" : "Create note"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{note?.title}&rdquo;?</AlertDialogTitle>
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
