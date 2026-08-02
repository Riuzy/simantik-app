'use client';

import { Paper, SimpleGrid, Text, Progress, Stack } from '@mantine/core';
import type { ExecutionStatusCount } from '../types';

const STATUS_COLORS: Record<string, string> = {
  PASSED: 'green',
  FAILED: 'red',
  ERROR: 'orange',
  SKIPPED: 'gray',
  RUNNING: 'blue',
};

export function ExecutionStatusSummary({ status, total }: { status: ExecutionStatusCount; total: number }) {
  const entries = Object.entries(status).filter(([, count]) => count > 0);

  if (total === 0) {
    return <Text c="dimmed" size="sm">No executions yet.</Text>;
  }

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 2, sm: 5 }}>
        {entries.map(([key, count]) => (
          <Paper key={key} p="sm" withBorder>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{key}</Text>
            <Text size="lg" fw={700} c={STATUS_COLORS[key]}>{count}</Text>
          </Paper>
        ))}
      </SimpleGrid>
      <Progress.Root size="sm">
        {entries.map(([key, count]) => (
          <Progress.Section
            key={key}
            value={total > 0 ? Math.round((count / total) * 100) : 0}
            color={STATUS_COLORS[key]}
          />
        ))}
      </Progress.Root>
    </Stack>
  );
}
