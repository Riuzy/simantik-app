'use client';

import { Center, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number; stroke?: number }>;
  compact?: boolean;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon = IconInbox, compact = false, action }: EmptyStateProps) {
  return (
    <Center py={compact ? 'md' : 56}>
      <Stack align="center" gap={compact ? 6 : 12}>
        <ThemeIcon size={compact ? 36 : 52} radius="xl" variant="light" color="gray">
          <Icon size={compact ? 18 : 26} stroke={1.5} />
        </ThemeIcon>
        <Text fw={600} size={compact ? 'sm' : 'md'}>{title}</Text>
        {description && <Text size="sm" c="dimmed" ta="center" maw={420}>{description}</Text>}
        {action}
      </Stack>
    </Center>
  );
}
