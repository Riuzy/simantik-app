'use client';

import { Center, Stack, Text, ThemeIcon, Button, Title } from '@mantine/core';
import { IconShieldLock } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <ThemeIcon variant="light" size={80} radius={80} color="red">
          <IconShieldLock size={40} />
        </ThemeIcon>
        <Title order={2}>403 - Access Denied</Title>
        <Text c="dimmed" size="lg">You do not have permission to access this resource.</Text>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </Stack>
    </Center>
  );
}
