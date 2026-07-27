import { create } from "zustand";

type ThemePreset = "ocean" | "sunset" | "forest" | "starry";

interface ThemeState {
  preset: ThemePreset;
  customPrimary: string | null;
  setPreset: (preset: ThemePreset) => void;
  setCustomPrimary: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preset: "ocean",
  customPrimary: null,
  setPreset: (preset) => set({ preset, customPrimary: null }),
  setCustomPrimary: (color) => set({ customPrimary: color }),
}));
