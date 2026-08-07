"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, Plus, NotebookText, FolderKanban, ListTodo, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteFormSheet } from "./note-form-sheet";
import { createAgencyNote, updateAgencyNote, deleteAgencyNote } from "../../actions/agency-notes.actions";
import type { AgencyNoteWithLinks } from "../../actions/agency-notes.actions";
import type { AgencyNoteValues } from "../../schema/agency-note.schema";
import type { AgencyProjectOption } from "../../actions/agency-projects.actions";
import type { AgencyTaskOption } from "../../actions/agency-tasks.actions";
import type { AgencyMeetingOption } from "../../actions/agency-meetings.actions";

export function NotesView({
  notes,
  projectOptions,
  taskOptions,
  meetingOptions,
}: {
  notes: AgencyNoteWithLinks[];
  projectOptions: AgencyProjectOption[];
  taskOptions: AgencyTaskOption[];
  meetingOptions: AgencyMeetingOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AgencyNoteWithLinks | null>(null);
  const [isPending, setIsPending] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => (q ? n.title.toLowerCase().includes(q) || n.contentMarkdown.toLowerCase().includes(q) : true));
  }, [notes, search]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => {
            setEditingNote(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New note
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={NotebookText} title="No notes yet" description="Write your first note and link it to a project, task, or meeting." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <button
              key={note.id}
              type="button"
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/40"
              onClick={() => {
                setEditingNote(note);
                setSheetOpen(true);
              }}
            >
              <p className="truncate text-sm font-medium">{note.title}</p>
              <p className="line-clamp-3 text-xs text-muted-foreground">{note.contentMarkdown || "Empty note."}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
                {note.projectTitle && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <FolderKanban className="h-3 w-3 shrink-0" /> <span className="truncate">{note.projectTitle}</span>
                  </span>
                )}
                {note.taskTitle && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <ListTodo className="h-3 w-3 shrink-0" /> <span className="truncate">{note.taskTitle}</span>
                  </span>
                )}
                {note.meetingTitle && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <Users className="h-3 w-3 shrink-0" /> <span className="truncate">{note.meetingTitle}</span>
                  </span>
                )}
                <span className="ml-auto shrink-0 text-[11px]">{format(new Date(note.updatedAt), "MMM d")}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <NoteFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingNote(null);
        }}
        note={editingNote}
        projectOptions={projectOptions}
        taskOptions={taskOptions}
        meetingOptions={meetingOptions}
        isPending={isPending}
        onSubmit={async (values: AgencyNoteValues) => {
          setIsPending(true);
          try {
            if (editingNote) {
              await updateAgencyNote(editingNote.id, values);
              toast.success("Note updated");
            } else {
              await createAgencyNote(values);
              toast.success("Note created");
            }
            router.refresh();
          } finally {
            setIsPending(false);
          }
        }}
        onDelete={
          editingNote
            ? async () => {
                await deleteAgencyNote(editingNote.id);
                toast.success("Note deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
