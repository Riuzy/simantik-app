import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

const themeOverride = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: 'Inter, system-ui, sans-serif',
  defaultRadius: 'md',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '1024px',
    lg: '1280px',
    xl: '1440px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
  },
  headings: {
    sizes: {
      h1: { fontSize: '2rem', fontWeight: '700' },
      h2: { fontSize: '1.5rem', fontWeight: '600' },
      h3: { fontSize: '1.25rem', fontWeight: '600' },
      h4: { fontSize: '1rem', fontWeight: '500' },
    },
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
