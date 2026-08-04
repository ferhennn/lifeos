"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, CalendarDays, Bug, Ban } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { projectStatusConfig, agencyProjectHealthConfig } from "@/lib/status-config";
import type { AgencyProjectWithMeta } from "../actions/agency-projects.actions";

export function AgencyProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: AgencyProjectWithMeta;
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
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/agency/projects/${project.id}`} className="min-w-0 flex-1">
          {project.client && <p className="truncate text-xs text-muted-foreground">{project.client}</p>}
          <h3 className="mt-0.5 truncate text-sm font-semibold leading-snug hover:underline">{project.title}</h3>
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
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge config={projectStatusConfig} status={project.status} />
        <StatusBadge config={agencyProjectHealthConfig} status={project.health} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{project.progress}% complete</span>
          <span>{project.totalTasks} tasks</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {project.openBugs > 0 && (
          <span className="flex items-center gap-1">
            <Bug className="h-3.5 w-3.5" />
            {project.openBugs} open
          </span>
        )}
        {project.blockedTasks > 0 && (
          <span className="flex items-center gap-1 text-destructive">
            <Ban className="h-3.5 w-3.5" />
            {project.blockedTasks} blocked
          </span>
        )}
        {project.deadline && (
          <span className="ml-auto flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(parseISO(project.deadline), "MMM d")}
          </span>
        )}
      </div>
    </motion.div>
  );
}
