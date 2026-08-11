"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Square, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { TimeLogRow } from "./time-log-row";
import { createTimeLog, deleteTimeLog } from "../../actions/agency-time-logs.actions";
import type { AgencyTimeLogWithTask } from "../../actions/agency-time-logs.actions";
import type { AgencyTaskOption } from "../../actions/agency-tasks.actions";

function toLocalDatetimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TimeTrackingView({
  logs,
  taskOptions,
  todayMinutes,
}: {
  logs: AgencyTimeLogWithTask[];
  taskOptions: AgencyTaskOption[];
  todayMinutes: number;
}) {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [runningSince, setRunningSince] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!runningSince) return;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - runningSince.getTime()) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runningSince]);

  async function handleStop() {
    if (!runningSince || !selectedTaskId) return;
    setIsPending(true);
    try {
      await createTimeLog({
        taskId: selectedTaskId,
        startedAt: runningSince.toISOString(),
        endedAt: new Date().toISOString(),
        source: "timer",
      });
      toast.success("Time logged");
      setRunningSince(null);
      setElapsed(0);
      router.refresh();
    } catch {
      toast.error("Couldn't log time");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteTimeLog(id);
      toast.success("Log deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete log");
    } finally {
      setDeletingId(null);
    }
  }

  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Live Timer
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedTaskId} onValueChange={(v) => setSelectedTaskId(v ?? "")} disabled={!!runningSince}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Pick a task" /></SelectTrigger>
              <SelectContent>
                {taskOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {runningSince && <span className="text-2xl font-semibold tabular-nums">{formatElapsed(elapsed)}</span>}

            {runningSince ? (
              <Button size="sm" variant="destructive" disabled={isPending} onClick={handleStop}>
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!selectedTaskId}
                onClick={() => {
                  setRunningSince(new Date());
                  setElapsed(0);
                }}
              >
                <Play className="h-3.5 w-3.5" /> Start
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium text-muted-foreground">Logged Today</div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {todayHours > 0 ? `${todayHours}h ${todayMins}m` : `${todayMins}m`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">Recent Logs</div>
          <ManualTimeEntryDialog open={manualOpen} onOpenChange={setManualOpen} taskOptions={taskOptions} />
        </div>
        {logs.length === 0 ? (
          <EmptyState icon={Clock} title="No time logged yet" description="Start the timer above or log time manually." />
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <TimeLogRow key={log.id} log={log} isPending={deletingId === log.id} onDelete={() => handleDelete(log.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManualTimeEntryDialog({
  open,
  onOpenChange,
  taskOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskOptions: AgencyTaskOption[];
}) {
  const router = useRouter();
  const [taskId, setTaskId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const now = new Date();
      setStartedAt(toLocalDatetimeInput(new Date(now.getTime() - 30 * 60000)));
      setEndedAt(toLocalDatetimeInput(now));
      setTaskId("");
      setNote("");
    }
  }

  async function handleSubmit() {
    setIsPending(true);
    try {
      await createTimeLog({
        taskId,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        note,
        source: "manual",
      });
      toast.success("Time logged");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Couldn't log time");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="h-3.5 w-3.5" /> Log time manually
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log time manually</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Task</Label>
            <Select value={taskId} onValueChange={(v) => setTaskId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Pick a task" /></SelectTrigger>
              <SelectContent>
                {taskOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startedAt">Start</Label>
              <Input id="startedAt" type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endedAt">End</Label>
              <Input id="endedAt" type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={isPending || !taskId} onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
