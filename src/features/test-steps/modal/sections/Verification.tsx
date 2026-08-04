import React from 'react';
import { Text, Textarea, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { TestStepFormValues } from '../types';

interface Props {
  form: UseFormReturnType<TestStepFormValues>;
  disabled?: boolean;
}

export function Verification({ form, disabled }: Props) {
  return (
    <Stack gap="sm">
      <Text fw={500} size="sm">Verification</Text>
      <Textarea
        label="Expected Result"
        placeholder="What should happen"
        minRows={3}
        autosize
        disabled={disabled}
        {...form.getInputProps('expectedResult')}
      />
    </Stack>
  );
}