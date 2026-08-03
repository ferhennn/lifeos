"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
} from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DayCell } from "./day-cell";
import { AgendaList } from "./agenda-list";
import { PostFormSheet } from "../shared/post-form-sheet";
import { createLinkedinPost, updateLinkedinPost, deleteLinkedinPost, reschedulePost } from "../../actions/posts.actions";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { LinkedinPostValues } from "../../schema/post.schema";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";

import type { CalendarBucket } from "./calendar-types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FILTERS: { key: CalendarBucket; label: string }[] = [
  { key: "published", label: "Published" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Draft" },
  { key: "missed", label: "Missed" },
];

export function CalendarView({
  posts,
  pillarOptions,
  strategyOptions,
  goalOptions,
}: {
  posts: LinkedinPostWithPillars[];
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"month" | "week" | "agenda">("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [activeFilters, setActiveFilters] = useState<Set<CalendarBucket>>(new Set(FILTERS.map((f) => f.key)));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedinPostWithPillars | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const bucketOf = (post: LinkedinPostWithPillars): CalendarBucket => {
    if (post.status === "published") return "published";
    if (post.scheduledDate && post.scheduledDate < today) return "missed";
    if (post.status === "scheduled") return "scheduled";
    return "draft";
  };

  const scheduledPosts = useMemo(() => posts.filter((p) => p.scheduledDate), [posts]);
  const visiblePosts = useMemo(
    () => scheduledPosts.filter((p) => activeFilters.has(bucketOf(p))),
    [scheduledPosts, activeFilters], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const postsByDate = useMemo(() => {
    const map = new Map<string, LinkedinPostWithPillars[]>();
    for (const post of visiblePosts) {
      if (!post.scheduledDate) continue;
      map.set(post.scheduledDate, [...(map.get(post.scheduledDate) ?? []), post]);
    }
    return map;
  }, [visiblePosts]);

  const days = useMemo(() => {
    if (view === "week") {
      return eachDayOfInterval({ start: startOfWeek(anchor), end: endOfWeek(anchor) });
    }
    return eachDayOfInterval({ start: startOfWeek(startOfMonth(anchor)), end: endOfWeek(endOfMonth(anchor)) });
  }, [anchor, view]);

  const weeks = useMemo(() => {
    const chunks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [days]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const postId = active.id as string;
    const newDate = over.id as string;
    const post = posts.find((p) => p.id === postId);
    if (post && post.scheduledDate !== newDate) {
      startPending(async () => {
        await reschedulePost(postId, newDate);
        toast.success(`Rescheduled to ${format(new Date(newDate), "MMM d")}`);
        router.refresh();
      });
    }
  };

  function startPending(fn: () => Promise<void>) {
    setIsPending(true);
    fn().finally(() => setIsPending(false));
  }

  const toggleFilter = (key: CalendarBucket) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const navigate = (dir: -1 | 1) => {
    setAnchor((prev) => (view === "week" ? (dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1)) : dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1)));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="min-w-32 text-sm font-medium">{format(anchor, view === "week" ? "'Week of' MMM d, yyyy" : "MMMM yyyy")}</span>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())}>Today</Button>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          size="sm"
          onClick={() => {
            setEditingPost(null);
            setDefaultDate(format(new Date(), "yyyy-MM-dd"));
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Badge
            key={f.key}
            variant={activeFilters.has(f.key) ? "default" : "outline"}
            className={cn("cursor-pointer select-none", !activeFilters.has(f.key) && "text-muted-foreground")}
            onClick={() => toggleFilter(f.key)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {view === "agenda" ? (
        <div className="rounded-xl border border-border bg-card">
          <AgendaList
            posts={visiblePosts.filter((p) => p.scheduledDate! >= format(startOfMonth(anchor), "yyyy-MM-dd"))}
            onPostClick={(post) => {
              setEditingPost(post);
              setSheetOpen(true);
            }}
          />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="divide-y divide-border">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 divide-x divide-border">
                  {week.map((day) => (
                    <DayCell
                      key={day.toISOString()}
                      date={day}
                      inCurrentMonth={view === "week" || isSameMonth(day, anchor)}
                      posts={postsByDate.get(format(day, "yyyy-MM-dd")) ?? []}
                      bucketOf={bucketOf}
                      compact={view === "month"}
                      onPostClick={(post) => {
                        setEditingPost(post);
                        setSheetOpen(true);
                      }}
                      onAddClick={(dateStr) => {
                        setEditingPost(null);
                        setDefaultDate(dateStr);
                        setSheetOpen(true);
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DndContext>
      )}

      <PostFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setEditingPost(null);
            setDefaultDate(undefined);
          }
        }}
        post={editingPost}
        pillarOptions={pillarOptions}
        strategyOptions={strategyOptions}
        goalOptions={goalOptions}
        isPending={isPending}
        defaults={defaultDate ? { scheduledDate: defaultDate, status: "scheduled" } : undefined}
        onSubmit={async (values: LinkedinPostValues) => {
          if (editingPost) {
            await updateLinkedinPost(editingPost.id, values);
            toast.success("Post updated");
          } else {
            await createLinkedinPost(values);
            toast.success("Post created");
          }
          router.refresh();
        }}
        onDelete={
          editingPost
            ? async () => {
                await deleteLinkedinPost(editingPost.id);
                toast.success("Post deleted");
                setSheetOpen(false);
                router.refresh();
              }
            : undefined
        }
      />
    </div>
  );
}
