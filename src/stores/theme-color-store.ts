import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ACCENT_PRESETS = [
  { name: "Violet", hue: 275 },
  { name: "Blue", hue: 230 },
  { name: "Teal", hue: 190 },
  { name: "Emerald", hue: 155 },
  { name: "Amber", hue: 70 },
  { name: "Rose", hue: 350 },
] as const;

const DEFAULT_HUE = 275;

function applyAccentHue(hue: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--accent-hue", String(hue));
  }
}

type ThemeColorState = {
  accentHue: number;
  setAccentHue: (hue: number) => void;
};

export const useThemeColorStore = create<ThemeColorState>()(
  persist(
    (set) => ({
      accentHue: DEFAULT_HUE,
      setAccentHue: (hue) => {
        applyAccentHue(hue);
        set({ accentHue: hue });
      },
    }),
    {
      name: "lifeos-theme-color",
      onRehydrateStorage: () => (state) => {
        if (state) applyAccentHue(state.accentHue);
      },
    },
  ),
);
