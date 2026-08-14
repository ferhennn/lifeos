"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccentColorPicker } from "@/components/shared/accent-color-picker";

const THEME_MODES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose your theme and accent color.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Theme</span>
          <div className="flex gap-2">
            {THEME_MODES.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="sm"
                className={
                  mounted && theme === value
                    ? "gap-1.5 border-primary bg-primary/10 text-primary"
                    : "gap-1.5"
                }
                aria-pressed={mounted && theme === value}
                onClick={() => setTheme(value)}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Accent color</span>
          <AccentColorPicker />
        </div>
      </CardContent>
    </Card>
  );
}
