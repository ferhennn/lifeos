"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

type Point = { date: string; label: string; completed: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{point.completed} completed</p>
      <p className="text-muted-foreground">{point.label}</p>
    </div>
  );
}

export function WeeklyChart({ data }: { data: Point[] }) {
  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={10}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis hide allowDecimals={false} />
          <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
          <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
