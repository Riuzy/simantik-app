'use client';

import { useEffect } from 'react';
import { Modal, Select, TextInput, Textarea, Group, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useUpdateTestStep } from '../hooks';
import { ACTION_OPTIONS } from '../../../constants/test-step-actions';
import type { TestStepAction } from '../../../constants/test-step-actions';
import type { LocatorItem } from '../types';
import { LocatorsEditor } from './locators-editor';

interface Props {
  testCaseId: string;
  step: {
    id: string;
    stepNumber: number;
    action: string;
    description: string | null;
    locatorStrategy: string | null;
    locatorValue: string | null;
    locators?: LocatorItem[] | null;
    inputValue: string | null;
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
      description: '',
      locators: [] as LocatorItem[],
      inputValue: '',
      expectedResult: '',
    },
    validate: {
      action: (v: string) => (v.trim().length < 1 ? 'Action is required' : null),
    },
  });

  useEffect(() => {
    if (step) {
      const initialLocators: LocatorItem[] =
        step.locators && step.locators.length > 0
          ? step.locators.map((l) => ({ strategy: l.strategy, value: l.value }))
          : step.locatorStrategy && step.locatorValue
            ? [{ strategy: step.locatorStrategy, value: step.locatorValue }]
            : [];

      form.setValues({
        action: step.action,
        description: step.description ?? '',
        locators: initialLocators,
        inputValue: step.inputValue ?? '',
        expectedResult: step.expectedResult ?? '',
      });
    }
  }, [step]);

  const handleSubmit = (values: {
    action: string;
    description: string;
    locators: LocatorItem[];
    inputValue: string;
    expectedResult: string;
  }) => {
    if (!step) return;
    const locators = values.locators.filter((l) => l && l.value && l.value.trim().length > 0);
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
    updateStep.mutate({ stepNumber: step.stepNumber, data: payload }, {
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
            data={ACTION_OPTIONS}
            searchable
            required
            {...form.getInputProps('action')}
          />

          <LocatorsEditor
            value={form.values.locators}
            onChange={(rows) => form.setFieldValue('locators', rows)}
          />

          <TextInput
            label="Input Value"
            placeholder="Text to type, option to select, key to press, wait time"
            {...form.getInputProps('inputValue')}
          />

          <TextInput
            label="Description"
            placeholder="Short description of this step"
            {...form.getInputProps('description')}
          />

          <Textarea
            label="Expected Result"
            placeholder="What should happen"
            minRows={3}
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
