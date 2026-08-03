"use client";

import { DndContext, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { linkedinPostStatusConfig, dot, linkedinPostPipelineStatuses } from "@/lib/status-config";
import { PipelineCard } from "./pipeline-card";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";

function Column({
  status,
  posts,
  onCardClick,
}: {
  status: (typeof linkedinPostPipelineStatuses)[number];
  posts: LinkedinPostWithPillars[];
  onCardClick: (post: LinkedinPostWithPillars) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = linkedinPostStatusConfig[status];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot[config.color])} />
        <span className="text-xs font-medium">{config.label}</span>
        <span className="text-xs text-muted-foreground">{posts.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg border border-dashed border-transparent p-1 transition-colors",
          isOver && "border-primary/40 bg-primary/5",
        )}
      >
        {posts.map((post) => (
          <PipelineCard key={post.id} post={post} onClick={() => onCardClick(post)} />
        ))}
      </div>
    </div>
  );
}

export function PipelineBoard({
  posts,
  onCardClick,
  onStatusChange,
}: {
  posts: LinkedinPostWithPillars[];
  onCardClick: (post: LinkedinPostWithPillars) => void;
  onStatusChange: (postId: string, status: (typeof linkedinPostPipelineStatuses)[number]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as (typeof linkedinPostPipelineStatuses)[number];
    const post = posts.find((p) => p.id === active.id);
    if (post && post.status !== newStatus) {
      onStatusChange(post.id, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {linkedinPostPipelineStatuses.map((status) => (
          <Column key={status} status={status} posts={posts.filter((p) => p.status === status)} onCardClick={onCardClick} />
        ))}
      </div>
    </DndContext>
  );
}
