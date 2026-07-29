'use client';

import { Container, Paper, Group, Title, Text } from '@mantine/core';
import { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return <Container size="xl" py="md">{children}</Container>;
}

export function PageHeader({
  title, description, actions,
}: {
  title: string; description?: string; actions?: ReactNode;
}) {
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

export function PageContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder mb="md">
      {title && <Title order={4} mb="md">{title}</Title>}
      {children}
    </Paper>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <Group gap="sm" mb="md" wrap="wrap">
      {children}
    </Group>
  );
}

export function ContentCard({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder mb="md">
      {title && <Text fw={500} mb="md">{title}</Text>}
      {children}
    </Paper>
  );
}
