"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Search, Plus, Users, Clock, FolderKanban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MeetingFormSheet } from "./meeting-form-sheet";
import { createAgencyMeeting, updateAgencyMeeting, deleteAgencyMeeting } from "../../actions/agency-meetings.actions";
import type { AgencyMeetingWithProject } from "../../actions/agency-meetings.actions";
import type { AgencyMeetingValues } from "../../schema/agency-meeting.schema";
import type { AgencyProjectOption } from "../../actions/agency-projects.actions";

export function MeetingsView({ meetings, projectOptions }: { meetings: AgencyMeetingWithProject[]; projectOptions: AgencyProjectOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<AgencyMeetingWithProject | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const openId = searchParams.get("openMeeting");
    if (!openId) return;
    const match = meetings.find((m) => m.id === openId);
    if (match) {
      setEditingMeeting(match);
      setSheetOpen(true);
      router.replace("/agency/meetings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, meetings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return meetings.filter((m) => (q ? m.title.toLowerCase().includes(q) : true));
  }, [meetings, search]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search meetings..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => {
            setEditingMeeting(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New meeting
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No meetings yet" description="Log a meeting to keep agenda, notes, and action items in one place." />
      ) : (
        <div className="space-y-2">
          {filtered.map((meeting) => {
            const doneCount = (meeting.actionItems ?? []).filter((i) => i.done).length;
            const totalCount = (meeting.actionItems ?? []).length;
            return (
              <button
                key={meeting.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm hover:bg-muted/40"
                onClick={() => {
                  setEditingMeeting(meeting);
                  setSheetOpen(true);
                }}
              >
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{format(parseISO(meeting.meetingDate), "MMM d, yyyy")}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{meeting.title}</span>
                {meeting.projectTitle && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <FolderKanban className="h-3 w-3" /> {meeting.projectTitle}
                  </span>
                )}
                {meeting.durationMinutes != null && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {meeting.durationMinutes}m
                  </span>
                )}
                {totalCount > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">{doneCount}/{totalCount} action items</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <MeetingFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingMeeting(null);
        }}
        meeting={editingMeeting}
        projectOptions={projectOptions}
        isPending={isPending}
        onSubmit={async (values: AgencyMeetingValues) => {
          setIsPending(true);
          try {
            if (editingMeeting) {
              await updateAgencyMeeting(editingMeeting.id, values);
              toast.success("Meeting updated");
            } else {
              await createAgencyMeeting(values);
              toast.success("Meeting created");
            }
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
        onDelete={
          editingMeeting
            ? async () => {
                await deleteAgencyMeeting(editingMeeting.id);
                toast.success("Meeting deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
