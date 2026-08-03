"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { linkedinPostStatusConfig } from "@/lib/status-config";
import { linkedinPostSchema, linkedinPostStatuses, hashtagsToString, type LinkedinPostValues } from "../../schema/post.schema";
import type { LinkedinPostWithPillars } from "../../actions/posts.actions";
import type { PillarOption } from "../../actions/pillars.actions";
import type { LinkedinStrategyOption } from "../../actions/strategies.actions";
import type { GoalOption } from "@/features/goals/actions/goals.actions";
import { PillarMultiSelect } from "./pillar-multi-select";
import { CarouselSlidesEditor } from "./carousel-slides-editor";

const emptyDefaults: LinkedinPostValues = {
  status: "idea",
  topic: "",
  hook: "",
  caption: "",
  cta: "",
  hashtags: "",
  carouselSlides: [],
  imagePrompt: "",
  notes: "",
  estimatedReadingTime: undefined,
  targetAudience: "",
  scheduledDate: "",
  strategyId: "",
  goalId: "",
  pillarIds: [],
};

export function PostFormSheet({
  open,
  onOpenChange,
  post,
  pillarOptions,
  strategyOptions,
  goalOptions,
  defaults,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: LinkedinPostWithPillars | null;
  pillarOptions: PillarOption[];
  strategyOptions: LinkedinStrategyOption[];
  goalOptions: GoalOption[];
  defaults?: Partial<LinkedinPostValues>;
  isPending: boolean;
  onSubmit: (values: LinkedinPostValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LinkedinPostValues>({
    resolver: zodResolver(linkedinPostSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(
        post
          ? {
              status: post.status,
              topic: post.topic ?? "",
              hook: post.hook ?? "",
              caption: post.caption ?? "",
              cta: post.cta ?? "",
              hashtags: hashtagsToString(post.hashtags),
              carouselSlides: post.carouselSlides ?? [],
              imagePrompt: post.imagePrompt ?? "",
              notes: post.notes ?? "",
              estimatedReadingTime: post.estimatedReadingTime ?? undefined,
              targetAudience: post.targetAudience ?? "",
              scheduledDate: post.scheduledDate ?? "",
              strategyId: post.strategyId ?? "",
              goalId: post.goalId ?? "",
              pillarIds: post.pillars.map((p) => p.id),
            }
          : { ...emptyDefaults, ...defaults },
      );
    }
  }, [open, post, defaults, reset]);

  const submit = async (values: LinkedinPostValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{post ? "Edit post" : "New post"}</SheetTitle>
          <SheetDescription>Fill in as much as you have — you can always come back and finish it later.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {linkedinPostStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{linkedinPostStatusConfig[s]?.label ?? s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Scheduled date</Label>
              <Controller
                control={control}
                name="scheduledDate"
                render={({ field }) => <DatePickerField value={field.value || undefined} onChange={(v) => field.onChange(v ?? "")} />}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" placeholder="What's this post about?" {...register("topic")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hook">Hook</Label>
            <Textarea id="hook" rows={2} placeholder="The first line that stops the scroll" {...register("hook")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" rows={8} {...register("caption")} />
            {errors.caption && <p className="text-xs text-destructive">{errors.caption.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">CTA</Label>
            <Input id="cta" placeholder="What should readers do next?" {...register("cta")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input id="hashtags" placeholder="#nextjs #webdev #freelancing" {...register("hashtags")} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Carousel slides</Label>
            <Tooltip>
              <TooltipTrigger render={<Button type="button" variant="outline" size="sm" disabled />}>
                <Sparkles className="h-3.5 w-3.5" /> Generate carousel
              </TooltipTrigger>
              <TooltipContent>AI Writer coming soon</TooltipContent>
            </Tooltip>
          </div>
          <Controller control={control} name="carouselSlides" render={({ field }) => <CarouselSlidesEditor value={field.value} onChange={field.onChange} />} />

          <div className="flex items-center justify-between">
            <Label htmlFor="imagePrompt">Image prompt</Label>
            <Tooltip>
              <TooltipTrigger render={<Button type="button" variant="outline" size="sm" disabled />}>
                <ImageIcon className="h-3.5 w-3.5" /> Generate image
              </TooltipTrigger>
              <TooltipContent>AI Writer coming soon</TooltipContent>
            </Tooltip>
          </div>
          <Textarea id="imagePrompt" rows={2} {...register("imagePrompt")} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estimatedReadingTime">Reading time (min)</Label>
              <Input
                id="estimatedReadingTime"
                type="number"
                min={0}
                {...register("estimatedReadingTime", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target audience</Label>
              <Input id="targetAudience" {...register("targetAudience")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pillars</Label>
            <Controller control={control} name="pillarIds" render={({ field }) => <PillarMultiSelect value={field.value} onChange={field.onChange} options={pillarOptions} />} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Strategy</Label>
              <Controller
                control={control}
                name="strategyId"
                render={({ field }) => (
                  <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">None</SelectItem>
                      {strategyOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Controller
                control={control}
                name="goalId"
                render={({ field }) => (
                  <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">None</SelectItem>
                      {goalOptions.map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>

          <SheetFooter className="mt-auto flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {post ? "Save changes" : "Create post"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={async () => {
                    await onDelete();
                    setConfirmDelete(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SheetContent>
    </Sheet>
  );
}
