"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, FolderKanban, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { strategyStatusConfig, recurrenceLabels } from "@/lib/status-config";
import type { StrategyWithMeta } from "../actions/strategies.actions";

export function StrategyCard({
  strategy,
  onEdit,
  onDelete,
  onSync,
}: {
  strategy: StrategyWithMeta;
  onEdit: () => void;
  onDelete: () => void;
  onSync: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/strategies/${strategy.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: strategy.goalCoverColor }} />
            <span className="truncate">{strategy.goalTitle}</span>
          </div>
          <h3 className="mt-0.5 truncate text-sm font-semibold leading-snug hover:underline">{strategy.title}</h3>
        </Link>

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
            {strategy.recurrenceType !== "none" && (
              <DropdownMenuItem onClick={onSync}>
                <RefreshCw /> Sync upcoming tasks
              </DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge config={strategyStatusConfig} status={strategy.status} />
        <PriorityBadge priority={strategy.priority} />
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80">
          {recurrenceLabels[strategy.recurrenceType]}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{strategy.progress}% complete</span>
          <span>{strategy.totalTasks} tasks</span>
        </div>
        <Progress value={strategy.progress} className="h-1.5" />
      </div>

      <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <FolderKanban className="h-3.5 w-3.5" />
        {strategy.projectCount} project{strategy.projectCount === 1 ? "" : "s"}
      </div>
    </motion.div>
  );
}
