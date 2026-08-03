'use client';

import { Stack, Paper, Text, Group } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import type { TestCase } from '../../types';

export function ExpectedResultTab({ testCase }: { testCase: TestCase }) {
  const stepsWithResults = testCase.steps?.filter(step => step.expectedResult) ?? [];

  if (stepsWithResults.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed" size="sm">No expected results defined yet. Add expected results in Test Steps.</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      {stepsWithResults.map((step) => (
        <Paper key={step.id} p="md" withBorder>
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <IconCircleCheck size={20} style={{ color: 'var(--mantine-color-green-6)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <Text size="xs" c="dimmed" mb={4}>Step {step.stepNumber}</Text>
              <Text size="sm">{step.expectedResult}</Text>
            </div>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
