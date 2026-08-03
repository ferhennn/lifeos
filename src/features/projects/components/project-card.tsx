"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Layers, CalendarDays } from "lucide-react";
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
import { projectStatusConfig } from "@/lib/status-config";
import type { ProjectWithMeta } from "../actions/projects.actions";

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectWithMeta;
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
        <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.goalCoverColor }} />
            <span className="truncate">
              {project.goalTitle} / {project.strategyTitle}
            </span>
          </div>
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

      <StatusBadge config={projectStatusConfig} status={project.status} className="w-fit" />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{project.progress}% complete</span>
          <span>{project.totalTasks} tasks</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          {project.epicCount} epic{project.epicCount === 1 ? "" : "s"}
        </span>
        {project.deadline && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(parseISO(project.deadline), "MMM d")}
          </span>
        )}
      </div>
    </motion.div>
  );
}
