"use client";

import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Target } from "lucide-react";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type WeeklyPoint = { date: string; label: string; completed: number };
type GoalProgress = { id: string; title: string; coverColor: string; progress: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: WeeklyPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{point.completed} completed</p>
      <p className="text-muted-foreground">{point.label}</p>
    </div>
  );
}

export function ProgressCard({
  completed,
  total,
  weeklyData,
  goals,
}: {
  completed: number;
  total: number;
  weeklyData: WeeklyPoint[];
  goals: GoalProgress[];
}) {
  const ringValue = total > 0 ? Math.round((completed / total) * 100) : 100;
  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <ProgressRing value={ringValue} size={56} strokeWidth={5} />
        <div>
          <p className="text-sm font-medium">Today&apos;s Progress</p>
          <p className="text-xs text-muted-foreground">{total > 0 ? `${completed} of ${total} tasks done` : "Nothing due today"}</p>
        </div>
      </div>

      <Tabs defaultValue="week" className="border-t border-border pt-3">
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-3.5 w-3.5" /> Goals
          </TabsTrigger>
        </TabsList>
        <TabsContent value="week" className="pt-2">
          <p className="mb-2 text-xs text-muted-foreground">{weeklyTotal} completed this week</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap={8}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
                <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="goals" className="pt-2">
          {goals.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No active goals yet.</p>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => (
                <Link key={g.id} href={`/goals/${g.id}`} className="block space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: g.coverColor }} />
                      {g.title}
                    </span>
                    <span className="text-muted-foreground">{g.progress}%</span>
                  </div>
                  <Progress value={g.progress} className="h-1.5" />
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
