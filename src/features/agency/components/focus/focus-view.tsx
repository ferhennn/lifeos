"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Square, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { FocusSessionRow } from "./focus-session-row";
import { startFocusSession, completeFocusSession } from "../../actions/agency-focus-sessions.actions";
import type { AgencyFocusSessionWithTask } from "../../actions/agency-focus-sessions.actions";
import type { AgencyTaskOption } from "../../actions/agency-tasks.actions";
import type { AgencyFocusSession } from "@/db/schema";

const NO_TASK = "__none";
const DURATIONS = [15, 25, 45, 60];

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusView({
  taskOptions,
  activeSession,
  recentSessions,
}: {
  taskOptions: AgencyTaskOption[];
  activeSession: AgencyFocusSession | null;
  recentSessions: AgencyFocusSessionWithTask[];
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(activeSession?.id ?? null);
  const [startedAt, setStartedAt] = useState<Date | null>(activeSession ? new Date(activeSession.startedAt) : null);
  const [plannedMinutes, setPlannedMinutes] = useState(activeSession?.plannedMinutes ?? 25);
  const [taskId, setTaskId] = useState(activeSession?.taskId ?? NO_TASK);
  const [remaining, setRemaining] = useState(() => {
    if (!activeSession) return plannedMinutes * 60;
    const elapsed = Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000);
    return Math.max(0, activeSession.plannedMinutes * 60 - elapsed);
  });
  const [isPending, setIsPending] = useState(false);
  const completingRef = useRef(false);

  useEffect(() => {
    if (!startedAt) return;
    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt!.getTime()) / 1000);
      setRemaining(Math.max(0, plannedMinutes * 60 - elapsed));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, plannedMinutes]);

  useEffect(() => {
    if (startedAt && remaining === 0 && !completingRef.current) {
      completingRef.current = true;
      finish(plannedMinutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, startedAt]);

  async function finish(actualMinutes: number) {
    if (!sessionId) return;
    setIsPending(true);
    try {
      await completeFocusSession(sessionId, actualMinutes);
      toast.success(actualMinutes >= plannedMinutes ? "Focus session complete" : "Session stopped");
      setSessionId(null);
      setStartedAt(null);
      router.refresh();
    } catch {
      toast.error("Couldn't save focus session");
    } finally {
      setIsPending(false);
      completingRef.current = false;
    }
  }

  async function handleStart() {
    setIsPending(true);
    try {
      const session = await startFocusSession({ taskId: taskId === NO_TASK ? null : taskId, plannedMinutes });
      setSessionId(session.id);
      setStartedAt(new Date(session.startedAt));
      setRemaining(plannedMinutes * 60);
    } catch {
      toast.error("Couldn't start focus session");
    } finally {
      setIsPending(false);
    }
  }

  function handleStop() {
    if (!startedAt) return;
    const elapsedMinutes = Math.round((Date.now() - startedAt.getTime()) / 60000);
    finish(elapsedMinutes);
  }

  const isRunning = !!startedAt;

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-8">
        <p className="text-6xl font-semibold tabular-nums tracking-tight">{formatCountdown(isRunning ? remaining : plannedMinutes * 60)}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Select value={taskId} onValueChange={(v) => setTaskId(v ?? NO_TASK)} disabled={isRunning}>
            <SelectTrigger className="w-56"><SelectValue placeholder="No task" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TASK}>No task</SelectItem>
              {taskOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(plannedMinutes)} onValueChange={(v) => setPlannedMinutes(Number(v))} disabled={isRunning}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isRunning ? (
          <Button size="lg" variant="destructive" disabled={isPending} onClick={handleStop}>
            <Square className="h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button size="lg" disabled={isPending} onClick={handleStart}>
            <Play className="h-4 w-4" /> Start Focus Session
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <TimerIcon className="h-3.5 w-3.5" /> Recent Sessions
        </div>
        {recentSessions.length === 0 ? (
          <EmptyState icon={TimerIcon} title="No focus sessions yet" description="Start a session above to build your focus history." />
        ) : (
          <div className="space-y-1.5">
            {recentSessions.map((s) => (
              <FocusSessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
