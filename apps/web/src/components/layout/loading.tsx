'use client';

import { Center, Loader, Stack, Text } from '@mantine/core';

export function LoadingScreen() {
  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text c="dimmed">Loading...</Text>
      </Stack>
    </Center>
  );
}

export function PageLoader() {
  return (
    <Center h={400}>
      <Loader size="md" />
    </Center>
  );
}
