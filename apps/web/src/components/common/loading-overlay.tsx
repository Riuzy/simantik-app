'use client';

import { Center, Loader } from '@mantine/core';

export function LoadingOverlay() {
  return (
    <Center h={200}>
      <Loader size="lg" />
    </Center>
  );
}
