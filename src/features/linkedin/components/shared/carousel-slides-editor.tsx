"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CarouselSlide } from "@/db/schema";

export function CarouselSlidesEditor({ value, onChange }: { value: CarouselSlide[]; onChange: (v: CarouselSlide[]) => void }) {
  const addSlide = () => onChange([...value, { order: value.length, title: "", body: "" }]);
  const removeSlide = (index: number) =>
    onChange(value.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  const updateSlide = (index: number, patch: Partial<CarouselSlide>) =>
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-2">
      {value.map((slide, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-2.5">
          <div className="flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Slide {i + 1}</span>
            <Button type="button" variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => removeSlide(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Input placeholder="Slide title" value={slide.title} onChange={(e) => updateSlide(i, { title: e.target.value })} />
          <Textarea placeholder="Slide body" rows={2} value={slide.body} onChange={(e) => updateSlide(i, { body: e.target.value })} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addSlide}>
        <Plus className="h-3.5 w-3.5" /> Add slide
      </Button>
    </div>
  );
}
