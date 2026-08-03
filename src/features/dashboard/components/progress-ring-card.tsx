import { ProgressRing } from "@/components/shared/progress-ring";

export function ProgressRingCard({ completed, total }: { completed: number; total: number }) {
  const value = total > 0 ? Math.round((completed / total) * 100) : 100;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <ProgressRing value={value} size={64} strokeWidth={5} />
      <div>
        <p className="text-sm font-medium">Today&apos;s Progress</p>
        <p className="text-xs text-muted-foreground">
          {total > 0 ? `${completed} of ${total} tasks done` : "Nothing due today"}
        </p>
      </div>
    </div>
  );
}
