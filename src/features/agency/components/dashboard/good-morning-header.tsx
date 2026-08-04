import { format } from "date-fns";

function getGreeting(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function AgencyGoodMorningHeader({ name }: { name: string }) {
  const now = new Date();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {getGreeting(now.getHours())}, {name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{format(now, "EEEE, MMMM d")} — here's what needs you today.</p>
    </div>
  );
}
