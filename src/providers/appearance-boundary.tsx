'use client';

import type { ReactNode } from 'react';
import { createTheme, MantineProvider, mergeMantineTheme, MantineColorScheme } from '@mantine/core';
import { useAppearanceStore } from '../features/settings/store/appearance-store';
import { theme as baseTheme } from '../theme';

function toColorScheme(theme: 'light' | 'dark' | 'system'): MantineColorScheme {
  return theme === 'system' ? 'auto' : theme;
}

function toRadius(borderRadius: 'none' | 'sm' | 'md' | 'lg') {
  return borderRadius === 'none' ? 0 : borderRadius;
}

export function AppearanceBoundary({ children }: { children: ReactNode }) {
  const theme = useAppearanceStore((s) => s.theme);
  const accentColor = useAppearanceStore((s) => s.accentColor);
  const borderRadius = useAppearanceStore((s) => s.borderRadius);

  const dynamicTheme = mergeMantineTheme(
    baseTheme,
    createTheme({
      primaryColor: accentColor,
      defaultRadius: toRadius(borderRadius),
    }),
  );

  return (
    <MantineProvider theme={dynamicTheme} defaultColorScheme={toColorScheme(theme)}>
      {children}
    </MantineProvider>
  );
}
