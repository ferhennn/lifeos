import { cn } from "@/lib/utils";
import { dot, priorityConfig, type DotColor } from "@/lib/status-config";

function DotBadge({ label, color, className }: { label: string; color: DotColor; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot[color])} />
      {label}
    </span>
  );
}

export function StatusBadge({
  config,
  status,
  className,
}: {
  config: Record<string, { label: string; color: DotColor }>;
  status: string;
  className?: string;
}) {
  const entry = config[status] ?? { label: status, color: "neutral" as const };
  return <DotBadge label={entry.label} color={entry.color} className={className} />;
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const entry = priorityConfig[priority as keyof typeof priorityConfig] ?? { label: priority, color: "neutral" as const };
  return <DotBadge label={entry.label} color={entry.color} className={className} />;
}
