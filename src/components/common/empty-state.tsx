'use client';

import { Center, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface Props {
  message?: string;
}

export function EmptyState({ message = 'No data available' }: Props) {
  return (
    <Center h={200}>
      <Stack align="center" gap="xs">
        <ThemeIcon variant="light" size="xl" color="gray">
          <IconAlertCircle size={24} />
        </ThemeIcon>
        <Text c="dimmed" size="sm">{message}</Text>
      </Stack>
    </Center>
  );
}
