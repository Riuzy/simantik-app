'use client';

import { Stack, Paper, Text, Group, Badge, Box } from '@mantine/core';
import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-react';
import { TEST_STEP_ACTION_LABELS } from '../../../../constants/test-step-actions';
import type { TestCase } from '../../types';

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  NOT_RUN: { color: 'gray', label: 'Not Run' },
  RUNNING: { color: 'blue', label: 'Running' },
  PASSED: { color: 'green', label: 'Passed' },
  FAILED: { color: 'red', label: 'Failed' },
};

export function ExpectedResultTab({ testCase }: { testCase: TestCase }) {
  const steps = testCase.steps ?? [];
  const stepsWithResults = steps.filter(step => step.expectedResult);
  const statusMeta = STATUS_BADGE[testCase.lastExecutionStatus] ?? STATUS_BADGE.NOT_RUN;

  if (stepsWithResults.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <IconCircleDashed size={40} stroke={1} style={{ opacity: 0.3 }} />
        <Text c="dimmed" mt="sm" size="sm">
          Expected Result dibuat otomatis berdasarkan Test Step.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      {stepsWithResults.map((step) => {
        const actionLabel = TEST_STEP_ACTION_LABELS[step.action as keyof typeof TEST_STEP_ACTION_LABELS] ?? step.action;
        return (
          <Paper key={step.id} p="md" withBorder>
            <Group gap="md" wrap="nowrap" align="flex-start">
              <Box style={{ width: 56, flexShrink: 0 }}>
                <Text size="xs" c="dimmed">STEP</Text>
                <Text fw={700} size="sm">{step.stepNumber}</Text>
              </Box>
              <Box style={{ width: 180, flexShrink: 0 }}>
                <Text size="xs" c="dimmed">Action</Text>
                <Text size="sm" fw={500}>{actionLabel}</Text>
              </Box>
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">Expected Result</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{step.expectedResult}</Text>
              </Box>
              <Box style={{ flexShrink: 0 }}>
                <Group gap="xs">
                  <IconCircleCheck size={18} style={{ color: 'var(--mantine-color-green-6)' }} />
                  <Badge color={statusMeta.color} variant="light">{statusMeta.label}</Badge>
                </Group>
              </Box>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
