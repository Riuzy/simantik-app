'use client';

import { Center, Stack, Text, ThemeIcon, Button } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SessionExpiredPage() {
  const router = useRouter();

  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <ThemeIcon variant="light" size={80} radius={80} color="yellow">
          <IconClock size={40} />
        </ThemeIcon>
        <Text fw={500} size="lg">Session Expired</Text>
        <Text c="dimmed" size="sm">Your session has expired. Please log in again.</Text>
        <Button onClick={() => router.push('/auth/login')}>Go to Login</Button>
      </Stack>
    </Center>
  );
}
