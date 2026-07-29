'use client';

import { Group, Title, Text } from '@mantine/core';
import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: Props) {
  return (
    <Group justify="space-between" mb="lg">
      <div>
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed" size="sm">{description}</Text>}
      </div>
      {actions && <Group>{actions}</Group>}
    </Group>
  );
}
