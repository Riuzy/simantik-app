'use client';

import { useState, useCallback } from 'react';
import {
  Paper, Group, Text, Button, Badge, ActionIcon, Stack, Box,
  Center, Loader, rem,
} from '@mantine/core';
import { IconPlus, IconGripVertical, IconPencil, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useTestCase } from '../../test-cases/hooks';
import { useDeleteTestStep, useReorderTestSteps } from '../hooks';
import { AddTestStepModal } from './add-test-step-modal';
import { EditTestStepModal } from './edit-test-step-modal';

interface Props {
  testCaseId: string;
  canManage: boolean;
  opened: boolean;
  onClose: () => void;
}

export function TestStepsPanel({ testCaseId, canManage, opened, onClose }: Props) {
  const [addOpened, setAddOpened] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; stepNumber: number; action: string; target: string | null; value: string | null; expectedResult: string | null } | null>(null);
  const [editOpened, setEditOpened] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const { data: testCase, isLoading: tcLoading } = useTestCase(testCaseId);
  const deleteStep = useDeleteTestStep(testCaseId);
  const reorderSteps = useReorderTestSteps(testCaseId);

  const steps = (testCase?.steps ?? []) as Array<{ id: string; testCaseId: string; stepNumber: number; action: string; target: string | null; value: string | null; expectedResult: string | null; createdAt: string; updatedAt: string }>;
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

  if (tcLoading) {
    return <Center py="xl"><Loader /></Center>;
  }

  if (!testCase) {
    return <Text c="dimmed" ta="center" py="xl">Test case not found</Text>;
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Box>
            <Group gap="xs" mb={4}>
              <Text fw={600} size="lg">{testCase.title}</Text>
              <Badge size="sm" variant="light" color="gray" ff="monospace">{testCase.code}</Badge>
            </Group>
            <Group gap="xs">
              <Badge size="sm" variant="light" color={
                testCase.priority === 'CRITICAL' ? 'red' :
                testCase.priority === 'HIGH' ? 'orange' :
                testCase.priority === 'MEDIUM' ? 'blue' : 'gray'
              }>{testCase.priority}</Badge>
              <Badge size="sm" variant="light" color={
                testCase.status === 'READY' ? 'green' :
                testCase.status === 'OBSOLETE' ? 'yellow' : 'gray'
              }>{testCase.status}</Badge>
            </Group>
          </Box>
          {canManage && (
            <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => setAddOpened(true)}>
              Add Step
            </Button>
          )}
        </Group>

        {testCase.description && (
          <Box>
            <Text size="sm" fw={500} c="dimmed">Description</Text>
            <Text size="sm">{testCase.description}</Text>
          </Box>
        )}

        <Text fw={500} size="sm" mt="sm">Steps ({sortedSteps.length})</Text>

        {sortedSteps.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">No steps added yet</Text>
        ) : (
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
                    <Text size="sm" fw={500}>Action</Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{step.action}</Text>
                    <Text size="sm" fw={500} mt={6}>Expected Result</Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{step.expectedResult}</Text>
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
        )}
      </Stack>

      <AddTestStepModal testCaseId={testCaseId} opened={addOpened} onClose={() => setAddOpened(false)} />
      <EditTestStepModal testCaseId={testCaseId} step={editTarget} opened={editOpened} onClose={() => { setEditOpened(false); setEditTarget(null); }} />
    </Paper>
  );
}
