'use client';

import { Center, Stack, Text, ThemeIcon, Button, Title } from '@mantine/core';
import { IconMoodSad } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <ThemeIcon variant="light" size={80} radius={80} color="gray">
          <IconMoodSad size={40} />
        </ThemeIcon>
        <Title order={2}>404 - Page Not Found</Title>
        <Text c="dimmed" size="lg">The page you are looking for does not exist.</Text>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </Stack>
    </Center>
  );
}
