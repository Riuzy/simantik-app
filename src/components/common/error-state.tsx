'use client';

import { Center, Stack, Text, ThemeIcon, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: Props) {
  return (
    <Center h={200}>
      <Stack align="center" gap="xs">
        <ThemeIcon variant="light" size="xl" color="red">
          <IconAlertTriangle size={24} />
        </ThemeIcon>
        <Text c="dimmed" size="sm">{message}</Text>
        {onRetry && <Button variant="light" size="xs" onClick={onRetry}>Retry</Button>}
      </Stack>
    </Center>
  );
}
