import { Users } from "lucide-react";
import type { AgencyMeetingSummary } from "../../actions/agency-dashboard.actions";

export function AgencyMeetingsToday({ meetings }: { meetings: AgencyMeetingSummary[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> Today&apos;s Meetings
      </div>
      {meetings.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nothing on the calendar today.</p>
      ) : (
        <ul className="space-y-2">
          {meetings.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{m.title}</span>
              {m.durationMinutes && <span className="shrink-0 text-xs text-muted-foreground">{m.durationMinutes}m</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
