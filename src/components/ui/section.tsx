'use client';

import { ReactNode } from 'react';
import { Paper, Title } from '@mantine/core';

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  p?: string | number;
}

export function Section({ title, description, actions, children, p = 'lg' }: SectionProps) {
  return (
    <Paper p={p} radius="md" withBorder mb="md">
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
          <div>
            {title && <Title order={4} fz={15}>{title}</Title>}
            {description && <div style={{ color: 'var(--mantine-color-dimmed)', fontSize: 13, marginTop: 2 }}>{description}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </Paper>
  );
}
