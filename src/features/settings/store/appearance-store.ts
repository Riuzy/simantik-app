'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppearanceTheme = 'light' | 'dark' | 'system';
export type AccentColor =
  | 'blue'
  | 'violet'
  | 'indigo'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'orange'
  | 'red'
  | 'pink';
export type BorderRadiusOption = 'none' | 'sm' | 'md' | 'lg';
export type SidebarStyle = 'compact' | 'normal';

export interface PersistentAppearance {
  theme: AppearanceTheme;
  accentColor: AccentColor;
  borderRadius: BorderRadiusOption;
  sidebarStyle: SidebarStyle;
}

export interface AppearanceState extends PersistentAppearance {
  setTheme: (theme: AppearanceTheme) => void;
  setAccentColor: (color: AccentColor) => void;
  setBorderRadius: (radius: BorderRadiusOption) => void;
  setSidebarStyle: (style: SidebarStyle) => void;
  applySaved: (settings: Partial<PersistentAppearance>) => void;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'system',
  accentColor: 'blue',
  borderRadius: 'md',
  sidebarStyle: 'normal',
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULT_APPEARANCE,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      setSidebarStyle: (sidebarStyle) => set({ sidebarStyle }),
      applySaved: (settings) =>
        set((state) => ({
          theme: settings.theme ?? state.theme,
          accentColor: settings.accentColor ?? state.accentColor,
          borderRadius: settings.borderRadius ?? state.borderRadius,
          sidebarStyle: settings.sidebarStyle ?? state.sidebarStyle,
        })),
    }),
    {
      name: 'simantik-appearance',
    },
  ),
);

type AppearanceSettings = PersistentAppearance;