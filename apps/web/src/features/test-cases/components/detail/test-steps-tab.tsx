'use client';

import { useState, useCallback } from 'react';
import {
  Paper, Group, Text, Badge, Button, Stack, Box, Loader, Center,
  ActionIcon, Tooltip, rem,
} from '@mantine/core';
import {
  IconPlus, IconGripVertical, IconPencil, IconTrash,
  IconArrowUp, IconArrowDown,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useDeleteTestStep, useReorderTestSteps, useUpdateTestStep } from '../../../test-steps/hooks';
import { AddTestStepModal } from '../../../test-steps/components/add-test-step-modal';
import { EditTestStepModal } from '../../../test-steps/components/edit-test-step-modal';

interface TestStepsTabProps {
  testCase: {
    id: string;
    steps?: Array<{
      id: string;
      testCaseId: string;
      stepNumber: number;
      action: string;
      target: string | null;
      value: string | null;
      expectedResult: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  canManage: boolean;
}

const actionLabels: Record<string, string> = {
  OPEN_BROWSER: 'Open Browser',
  NAVIGATE: 'Navigate',
  CLICK: 'Click',
  DOUBLE_CLICK: 'Double Click',
  INPUT_TEXT: 'Input Text',
  CLEAR: 'Clear',
  SELECT: 'Select',
  CHECK: 'Check',
  UNCHECK: 'Uncheck',
  UPLOAD_FILE: 'Upload File',
  PRESS_KEY: 'Press Key',
  WAIT: 'Wait',
  SCROLL: 'Scroll',
  HOVER: 'Hover',
  VERIFY_TEXT: 'Verify Text',
  VERIFY_URL: 'Verify URL',
  VERIFY_ELEMENT: 'Verify Element',
  VERIFY_ATTRIBUTE: 'Verify Attribute',
  TAKE_SCREENSHOT: 'Take Screenshot',
};

const actionColorMap: Record<string, string> = {
  OPEN_BROWSER: 'blue',
  NAVIGATE: 'cyan',
  CLICK: 'green',
  DOUBLE_CLICK: 'green',
  INPUT_TEXT: 'yellow',
  CLEAR: 'orange',
  SELECT: 'purple',
  CHECK: 'teal',
  UNCHECK: 'red',
  UPLOAD_FILE: 'indigo',
  PRESS_KEY: 'gray',
  WAIT: 'dimmed',
  SCROLL: 'orange',
  HOVER: 'cyan',
  VERIFY_TEXT: 'green',
  VERIFY_URL: 'green',
  VERIFY_ELEMENT: 'green',
  VERIFY_ATTRIBUTE: 'green',
  TAKE_SCREENSHOT: 'blue',
};

export function TestStepsTab({ testCase, canManage }: TestStepsTabProps) {
  const [addOpened, setAddOpened] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; stepNumber: number; action: string; target: string | null; value: string | null; expectedResult: string | null } | null>(null);
  const [editOpened, setEditOpened] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const deleteStep = useDeleteTestStep(testCase.id);
  const reorderSteps = useReorderTestSteps(testCase.id);

  const steps = (testCase?.steps ?? []) as Array<{
    id: string;
    testCaseId: string;
    stepNumber: number;
    action: string;
    target: string | null;
    value: string | null;
    expectedResult: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  const openDeleteConfirm = (stepNumber: number) =>
    modals.openConfirmModal({
      title: 'Delete Test Step',
      centered: true,
      children: <Text size="sm">Are you sure you want to delete step {stepNumber}?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteStep.mutate(stepNumber),
    });

  const openEdit = (step: { id: string; stepNumber: number; action: string; target: string | null; value: string | null; expectedResult: string | null }) => {
    setEditTarget(step);
    setEditOpened(true);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const reordered = [...sortedSteps];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    reorderSteps.mutate(
      { stepIds: reordered.map((s) => s.id) },
      { onSettled: () => { setDragIndex(null); setOverIndex(null); } }
    );
  }, [dragIndex, sortedSteps, reorderSteps]);

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const moveStep = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= sortedSteps.length) return;

    const reordered = [...sortedSteps];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    reorderSteps.mutate({ stepIds: reordered.map((s) => s.id) });
  };

  if (steps.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center" py="xl">No steps added yet</Text>
        {canManage && (
          <Group justify="center" mt="md">
            <Button leftSection={<IconPlus size={16} />} onClick={() => setAddOpened(true)}>
              Add Step
            </Button>
          </Group>
        )}
        <AddTestStepModal testCaseId={testCase.id} opened={addOpened} onClose={() => setAddOpened(false)} />
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500} size="sm">Steps ({sortedSteps.length})</Text>
        {canManage && (
          <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => setAddOpened(true)}>
            Add Step
          </Button>
        )}
      </Group>

      <Stack gap={4}>
        {sortedSteps.map((step, index) => (
          <Box
            key={step.id}
            draggable={canManage}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={(theme) => ({
              border: `${rem(1)} solid ${overIndex === index ? theme.colors.blue[4] : dragIndex === index ? theme.colors.blue[1] : theme.colors.gray[3]}`,
              borderRadius: theme.radius.sm,
              padding: theme.spacing.sm,
              backgroundColor: dragIndex === index ? theme.colors.blue[0] : overIndex === index ? theme.colors.blue[0] : 'transparent',
              cursor: canManage ? 'grab' : 'default',
              transition: 'border-color 0.15s, background-color 0.15s',
            })}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              {canManage && (
                <Box style={{ cursor: 'grab', paddingTop: 2, flexShrink: 0 }}>
                  <IconGripVertical size={16} style={{ color: 'var(--mantine-color-gray-5)' }} />
                </Box>
              )}

              <Box style={{ flexShrink: 0, paddingTop: 2 }}>
                <Badge size="sm" variant="filled" color="gray" circle>
                  {step.stepNumber}
                </Badge>
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" mb={4}>
                  <Badge size="xs" color={actionColorMap[step.action] ?? 'gray'}>
                    {actionLabels[step.action] ?? step.action}
                  </Badge>
                </Group>

                {(step.target || step.value) && (
                  <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                    {step.target}{step.value ? ` → ${step.value}` : ''}
                  </Text>
                )}

                {step.expectedResult && (
                  <>
                    <Text size="xs" fw={500} mt={4} c="dimmed">Expected</Text>
                    <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>{step.expectedResult}</Text>
                  </>
                )}
              </Box>

              {canManage && (
                <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => moveStep(index, 'up')} disabled={index === 0}>
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => moveStep(index, 'down')} disabled={index === sortedSteps.length - 1}>
                    <IconArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => openEdit(step)}>
                    <IconPencil size={14} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" size="sm" onClick={() => openDeleteConfirm(step.stepNumber)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              )}
            </Group>
          </Box>
        ))}
      </Stack>

      <AddTestStepModal testCaseId={testCase.id} opened={addOpened} onClose={() => setAddOpened(false)} />
      <EditTestStepModal testCaseId={testCase.id} step={editTarget} opened={editOpened} onClose={() => { setEditOpened(false); setEditTarget(null); }} />
    </Paper>
  );
}