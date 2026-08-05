"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { linkedinPillarSchema, linkedinPillarColors, type LinkedinPillarValues } from "../../schema/pillar.schema";
import type { LinkedinPillar } from "@/db/schema";

const emptyDefaults: LinkedinPillarValues = { name: "", description: "", color: linkedinPillarColors[0] };

export function PillarFormSheet({
  open,
  onOpenChange,
  pillar,
  isPending,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillar?: LinkedinPillar | null;
  isPending: boolean;
  onSubmit: (values: LinkedinPillarValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LinkedinPillarValues>({ resolver: zodResolver(linkedinPillarSchema), defaultValues: emptyDefaults });

  useEffect(() => {
    if (open) {
      reset(pillar ? { name: pillar.name, description: pillar.description ?? "", color: pillar.color } : emptyDefaults);
    }
  }, [open, pillar, reset]);

  const submit = async (values: LinkedinPillarValues) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save pillar. Try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{pillar ? "Edit pillar" : "New pillar"}</SheetTitle>
          <SheetDescription>Content pillars group posts around a consistent theme.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Next.js" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {linkedinPillarColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={cn(
                        "h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
                        field.value === color && "ring-2 ring-foreground",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <SheetFooter className="mt-auto flex-row px-0">
            {onDelete && (
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pillar ? "Save changes" : "Create pillar"}
            </Button>
          </SheetFooter>
        </form>

        {onDelete && (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{pillar?.name}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>Posts tagged with this pillar keep their other tags. This can&apos;t be undone.</AlertDialogDescription>
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
