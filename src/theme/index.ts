import { createTheme, DEFAULT_THEME, mergeMantineTheme, MantineTheme } from '@mantine/core';

const themeOverride = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
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
    xs: '0 1px 2px rgba(16,24,40,0.05)',
    sm: '0 1px 3px rgba(16,24,40,0.08)',
    md: '0 4px 10px rgba(16,24,40,0.08)',
    lg: '0 10px 20px rgba(16,24,40,0.1)',
    xl: '0 20px 30px rgba(16,24,40,0.12)',
  },
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '1.75rem', lineHeight: '2.25rem' },
      h2: { fontSize: '1.4rem', lineHeight: '2rem' },
      h3: { fontSize: '1.15rem', lineHeight: '1.75rem' },
      h4: { fontSize: '1rem', lineHeight: '1.5rem' },
      h5: { fontSize: '0.9rem', lineHeight: '1.375rem' },
    },
  },
  components: {
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
        withBorder: true,
      },
      styles: {
        root: { backgroundColor: 'var(--mantine-color-body)' },
      },
    },
    Table: {
      defaultProps: {
        verticalSpacing: 'sm',
        horizontalSpacing: 'sm',
      },
      styles: (theme: MantineTheme) => ({
        table: {
          fontSize: theme.fontSizes.sm,
          '& thead th': {
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            color: theme.colors.gray[6],
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            whiteSpace: 'nowrap',
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
          },
          '& tbody tr:hover': {
            backgroundColor: theme.colors.blue[0],
          },
          '& tbody td': {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
          },
        },
      }),
    },
    Badge: {
      defaultProps: {
        variant: 'light',
        radius: 'sm',
        fw: 500,
      },
      styles: {
        root: {
          textTransform: 'none',
          letterSpacing: '0.01em',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    Select: {
      defaultProps: { radius: 'md' },
    },
    Textarea: {
      defaultProps: { radius: 'md' },
    },
    AppShell: {
      defaultProps: {
        padding: 0,
      },
    },
    NavLink: {
      defaultProps: {
        radius: 'md',
      },
      styles: (theme: MantineTheme) => ({
        root: {
          fontWeight: 500,
          '&[dataActive]': {
            backgroundColor: theme.colors.blue[0],
            color: theme.colors.blue[7],
            fontWeight: 600,
          },
        },
      }),
    },
    Skeleton: {
      defaultProps: {
        animate: true,
      },
    },
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
