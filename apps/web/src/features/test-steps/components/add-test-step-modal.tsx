'use client';

import { Modal, Select, TextInput, Textarea, Group, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateTestStep } from '../hooks';

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
  opened: boolean;
  onClose: () => void;
}

export function AddTestStepModal({ testCaseId, opened, onClose }: Props) {
  const createStep = useCreateTestStep(testCaseId);

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

  const handleSubmit = (values: { action: string; target: string; value: string; expectedResult: string }) => {
    createStep.mutate(values, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Test Step" size="lg">
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
            <Button type="submit" loading={createStep.isPending}>Add Step</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}