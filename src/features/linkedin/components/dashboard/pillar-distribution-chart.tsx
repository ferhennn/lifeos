"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { PillarDistributionItem } from "../../actions/dashboard.actions";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: PillarDistributionItem }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{item.name}</p>
      <p className="text-muted-foreground">
        {item.count} post{item.count === 1 ? "" : "s"} · {item.percent}%
      </p>
    </div>
  );
}

export function PillarDistributionChart({ data }: { data: PillarDistributionItem[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <PieIcon className="h-3.5 w-3.5" /> Content Pillar Distribution
        </div>
        <EmptyState icon={PieIcon} title="No pillar data yet" description="Tag posts with pillars to see distribution here." />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <PieIcon className="h-3.5 w-3.5" /> Content Pillar Distribution
      </div>
      <div className="flex items-center gap-4">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {data.slice(0, 6).map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate text-foreground">{item.name}</span>
              <span className="ml-auto shrink-0 text-muted-foreground">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
