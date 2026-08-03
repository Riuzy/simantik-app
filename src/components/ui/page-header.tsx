'use client';

import { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap" gap="sm">
      <div>
        <Text fz={22} fw={700} lh={1.3} component="div">{title}</Text>
        {description && <Text c="dimmed" size="sm" mt={2}>{description}</Text>}
        {children}
      </div>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}
