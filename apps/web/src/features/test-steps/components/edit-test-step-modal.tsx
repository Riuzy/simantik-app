'use client';

import { useEffect } from 'react';
import { Modal, Select, TextInput, Textarea, Group, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useUpdateTestStep } from '../hooks';

const actionOptions = [
  { value: 'OPEN_BROWSER', label: 'Open Browser' },
  { value: 'NAVIGATE', label: 'Navigate' },
  { value: 'CLICK', label: 'Click' },
  { value: 'DOUBLE_CLICK', label: 'Double Click' },
  { value: 'INPUT_TEXT', label: 'Input Text' },
  { value: 'CLEAR', label: 'Clear' },
  { value: 'SELECT', label: 'Select' },
  { value: 'CHECK', label: 'Check' },
  { value: 'UNCHECK', label: 'Uncheck' },
  { value: 'UPLOAD_FILE', label: 'Upload File' },
  { value: 'PRESS_KEY', label: 'Press Key' },
  { value: 'WAIT', label: 'Wait' },
  { value: 'SCROLL', label: 'Scroll' },
  { value: 'HOVER', label: 'Hover' },
  { value: 'VERIFY_TEXT', label: 'Verify Text' },
  { value: 'VERIFY_URL', label: 'Verify URL' },
  { value: 'VERIFY_ELEMENT', label: 'Verify Element' },
  { value: 'VERIFY_ATTRIBUTE', label: 'Verify Attribute' },
  { value: 'TAKE_SCREENSHOT', label: 'Take Screenshot' },
];

interface Props {
  testCaseId: string;
  step: {
    id: string;
    stepNumber: number;
    action: string;
    target: string | null;
    value: string | null;
    expectedResult: string | null;
  } | null;
  opened: boolean;
  onClose: () => void;
}

export function EditTestStepModal({ testCaseId, step, opened, onClose }: Props) {
  const updateStep = useUpdateTestStep(testCaseId);

  const form = useForm({
    initialValues: {
      action: '',
      target: '',
      value: '',
      expectedResult: '',
    },
    validate: {
      action: (v: string) => (v.trim().length < 1 ? 'Action is required' : null),
      expectedResult: (v: string) => (v.trim().length < 1 ? 'Expected result is required' : null),
    },
  });

  useEffect(() => {
    if (step) {
      form.setValues({
        action: step.action,
        target: step.target ?? '',
        value: step.value ?? '',
        expectedResult: step.expectedResult ?? '',
      });
    }
  }, [step]);

  const handleSubmit = (values: { action: string; target: string; value: string; expectedResult: string }) => {
    if (!step) return;
    updateStep.mutate({ stepNumber: step.stepNumber, data: values }, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Test Step" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Action"
            placeholder="Select an action type"
            data={actionOptions}
            required
            {...form.getInputProps('action')}
          />

          <TextInput
            label="Target"
            placeholder="e.g. #submit-button, /api/users"
            {...form.getInputProps('target')}
          />

          <TextInput
            label="Value"
            placeholder="e.g. admin@example.com, 5000"
            {...form.getInputProps('value')}
          />

          <Textarea
            label="Expected Result"
            placeholder="What should happen"
            minRows={3}
            required
            autosize
            {...form.getInputProps('expectedResult')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={updateStep.isPending}>Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}