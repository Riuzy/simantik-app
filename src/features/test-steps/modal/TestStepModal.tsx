import React, { useCallback, useRef } from 'react';
import { Modal, Stack, Box, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCreateTestStep, useUpdateTestStep } from '../hooks';
import { useTestStepModal } from './use-test-step-modal';
import { TestStepModalHeader } from './TestStepModalHeader';
import { TestStepModalFooter } from './TestStepModalFooter';
import { GeneralInformation } from './sections/GeneralInformation';
import { LocatorConfiguration } from './sections/LocatorConfiguration';
import { Verification } from './sections/Verification';
import type { TestStepModalMode, TestStepData } from './types';
import type { TestStepAction } from '../../../constants/test-step-actions';

interface Props {
  testCaseId: string;
  mode: TestStepModalMode;
  stepNumber?: number;
  initialStep?: TestStepData | null;
  opened: boolean;
  onClose: () => void;
  onSave?: (stepNumber: number) => void;
}

export function TestStepModal({
  testCaseId,
  mode,
  stepNumber,
  initialStep,
  opened,
  onClose,
  onSave,
}: Props) {
  const createStep = useCreateTestStep(testCaseId);
  const updateStep = useUpdateTestStep(testCaseId);
  const { form, isSubmitting, resetForm } = useTestStepModal({
    mode,
    initialStep,
    opened,
  });
  const isReadOnlyMode = mode === 'preview' || mode === 'copy';
  const isSubmittingRef = useRef(false);

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      if (mode !== 'create' && !stepNumber) return;
      if (isSubmittingRef.current) return;

      isSubmittingRef.current = true;

      try {
        const locators = values.locators.filter(
          (l) => l && l.value && l.value.trim().length > 0
        );
        const primary = locators[0];

        const payload = {
          action: values.action as TestStepAction,
          description: values.description || undefined,
          locators: locators.length > 0 ? locators : undefined,
          locatorStrategy: primary?.strategy,
          locatorValue: primary?.value,
          inputValue: values.inputValue || undefined,
          expectedResult: values.expectedResult || undefined,
        };

        if (mode === 'create') {
          await createStep.mutateAsync(payload);
        } else if ((mode === 'edit' || mode === 'duplicate') && stepNumber) {
          await updateStep.mutateAsync({ stepNumber, data: payload });
        }

        notifications.show({ title: 'Success', message: getSuccessMessage(mode), color: 'green' });
        if (stepNumber) onSave?.(stepNumber);
        onClose();
      } catch {
        notifications.show({ title: 'Error', message: getErrorMessage(mode), color: 'red' });
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [mode, stepNumber, createStep, updateStep, onClose, onSave],
  );

  const handleCopy = useCallback(async () => {
    const values = form.getValues();
    const payload = {
      action: values.action,
      description: values.description || undefined,
      locators: values.locators.filter(
        (l) => l && l.value && l.value.trim().length > 0
      ),
      inputValue: values.inputValue,
      expectedResult: values.expectedResult,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      notifications.show({ title: 'Copied', message: 'Test step copied to clipboard', color: 'green' });
      onClose();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to copy to clipboard', color: 'red' });
    }
  }, [form, onClose]);

  const isPending = mode === 'create' ? createStep.isPending : updateStep.isPending;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isReadOnlyMode && !isSubmittingRef.current && form.isDirty()) {
          form.onSubmit(handleSubmit)();
        }
      }
    },
    [onClose, isReadOnlyMode, form, handleSubmit],
  );

  if (!opened) return null;

  const dirty = form.isDirty();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={undefined}
      size="lg"
      centered
      zIndex={1000}
      onKeyDown={handleKeyDown}
      trapFocus
      withCloseButton={false}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <TestStepModalHeader mode={mode} onClose={onClose} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Box p="md">
          <Stack gap="md">
            <GeneralInformation form={form} disabled={isReadOnlyMode} />
            <LocatorConfiguration form={form} disabled={isReadOnlyMode} />
            <Verification form={form} disabled={isReadOnlyMode} />
          </Stack>
        </Box>

        <Box p="md" pt={0}>
          <Group justify="flex-end">
            <TestStepModalFooter
              mode={mode}
              isSubmitting={isPending}
              isDirty={dirty}
              isReadOnly={isReadOnlyMode}
              onClose={onClose}
              onCopy={mode === 'copy' ? handleCopy : undefined}
            />
          </Group>
        </Box>
      </form>
    </Modal>
  );
}

function getSuccessMessage(mode: TestStepModalMode): string {
  switch (mode) {
    case 'create': return 'Test step added';
    case 'edit': return 'Test step updated';
    case 'duplicate': return 'Test step duplicated';
    case 'copy': return 'Test step copied';
    default: return 'Success';
  }
}

function getErrorMessage(mode: TestStepModalMode): string {
  switch (mode) {
    case 'create': return 'Failed to add test step';
    case 'edit': return 'Failed to update test step';
    case 'duplicate': return 'Failed to duplicate test step';
    default: return 'Operation failed';
  }
}