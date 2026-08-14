"use client";

import { Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ACCENT_PRESETS, useThemeColorStore } from "@/stores/theme-color-store";

export function AccentColorPicker() {
  const accentHue = useThemeColorStore((s) => s.accentHue);
  const setAccentHue = useThemeColorStore((s) => s.setAccentHue);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {ACCENT_PRESETS.map((preset) => {
          const active = accentHue === preset.hue;
          return (
            <button
              key={preset.name}
              type="button"
              aria-label={preset.name}
              aria-pressed={active}
              onClick={() => setAccentHue(preset.hue)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-105",
                active && "ring-2 ring-offset-2 ring-offset-background",
              )}
              style={{
                backgroundColor: `oklch(0.6 0.18 ${preset.hue})`,
                ...(active ? { "--tw-ring-color": `oklch(0.6 0.18 ${preset.hue})` } : {}),
              }}
            >
              {active && <Check className="h-4 w-4 text-white" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Custom hue</span>
          <span>{Math.round(accentHue)}°</span>
        </div>
        <Slider
          min={0}
          max={360}
          step={1}
          value={[accentHue]}
          onValueChange={(value) => setAccentHue(Array.isArray(value) ? value[0] : value)}
        />
      </div>
    </div>
  );
}
