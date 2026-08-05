"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
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
import { DatePickerField } from "@/components/shared/date-picker-field";
import { agencyMeetingSchema, participantsToString, type AgencyMeetingValues } from "../../schema/agency-meeting.schema";
import type { AgencyMeetingWithProject } from "../../actions/agency-meetings.actions";
import type { AgencyProjectOption } from "../../actions/agency-projects.actions";
import { ActionItemsEditor } from "./action-items-editor";

const emptyDefaults: AgencyMeetingValues = {
  title: "",
  meetingDate: "",
  durationMinutes: undefined,
  participants: "",
  agenda: "",
  notes: "",
  decisions: "",
  recordingUrl: "",
  agencyProjectId: "",
};

export function MeetingFormSheet({
  open,
  onOpenChange,
  meeting,
  projectOptions,
  defaults,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: AgencyMeetingWithProject | null;
  projectOptions: AgencyProjectOption[];
  defaults?: Partial<AgencyMeetingValues>;
  isPending: boolean;
  onSubmit: (values: AgencyMeetingValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AgencyMeetingValues>({
    resolver: zodResolver(agencyMeetingSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(
        meeting
          ? {
              title: meeting.title,
              meetingDate: meeting.meetingDate,
              durationMinutes: meeting.durationMinutes ?? undefined,
              participants: participantsToString(meeting.participants),
              agenda: meeting.agenda ?? "",
              notes: meeting.notes ?? "",
              decisions: meeting.decisions ?? "",
              recordingUrl: meeting.recordingUrl ?? "",
              agencyProjectId: meeting.agencyProjectId ?? "",
            }
          : { ...emptyDefaults, ...defaults },
      );
    }
  }, [open, meeting, defaults, reset]);

  const submit = async (values: AgencyMeetingValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save meeting. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{meeting ? "Edit meeting" : "New meeting"}</SheetTitle>
          <SheetDescription>Agenda, notes, decisions, and action items in one place.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What's this meeting about?" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Controller control={control} name="meetingDate" render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />} />
              {errors.meetingDate && <p className="text-xs text-destructive">{errors.meetingDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (min)</Label>
              <Input id="durationMinutes" type="number" min={0} {...register("durationMinutes", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">Participants</Label>
            <Input id="participants" placeholder="Comma-separated names" {...register("participants")} />
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Controller
              control={control}
              name="agencyProjectId"
              render={({ field }) => (
                <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {projectOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea id="agenda" rows={3} {...register("agenda")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decisions">Decisions</Label>
            <Textarea id="decisions" rows={3} {...register("decisions")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordingUrl">Recording link</Label>
            <Input id="recordingUrl" placeholder="https://..." {...register("recordingUrl")} />
          </div>

          {meeting && (
            <div className="space-y-2">
              <Label>Action items</Label>
              <ActionItemsEditor meetingId={meeting.id} initialItems={meeting.actionItems ?? []} />
            </div>
          )}

          <SheetFooter className="flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {meeting ? "Save changes" : "Create meeting"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{meeting?.title}&rdquo;?</AlertDialogTitle>
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
