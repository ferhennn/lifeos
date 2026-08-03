"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, CalendarDays, Compass } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { goalStatusConfig } from "@/lib/status-config";
import type { GoalWithProgress } from "../actions/goals.actions";

export function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: GoalWithProgress;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
    >
      <div className="h-1 w-10 rounded-full" style={{ backgroundColor: goal.coverColor }} />

      <div className="flex items-start justify-between gap-2">
        <Link href={`/goals/${goal.id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-snug hover:underline">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{goal.description}</p>
          )}
        </Link>
        <ProgressRing value={goal.progress} size={44} strokeWidth={4} labelClassName="text-[10px]" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge config={goalStatusConfig} status={goal.status} />
        <PriorityBadge priority={goal.priority} />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Compass className="h-3.5 w-3.5" />
            {goal.strategyCount}
          </span>
          {goal.targetDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(parseISO(goal.targetDate), "MMM d, yyyy")}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100 data-[popup-open]:opacity-100"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
