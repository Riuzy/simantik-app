'use client';

import { Container, Paper, Group, Title, Text } from '@mantine/core';
import { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return <Container size="xl" py="md">{children}</Container>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <Group justify="space-between" mb="lg">
      <div>
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed" size="sm">{description}</Text>}
      </div>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder mb="md">
      {title && <Title order={4} mb="md">{title}</Title>}
      {children}
    </Paper>
  );
}

export function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon?: ReactNode; color?: string }) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
          <Text size="xxl" fw={700} mt={4}>{value}</Text>
        </div>
        {icon && <div style={{ color: `var(--mantine-color-${color || 'blue'}-6)` }}>{icon}</div>}
      </Group>
    </Paper>
  );
}

export { Container };
