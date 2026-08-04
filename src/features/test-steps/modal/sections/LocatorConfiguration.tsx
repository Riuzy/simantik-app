import React from 'react';
import { Text, Stack } from '@mantine/core';
import { LocatorsEditor } from '../locators-editor';
import type { UseFormReturnType } from '@mantine/form';
import type { TestStepFormValues } from '../types';

interface Props {
  form: UseFormReturnType<TestStepFormValues>;
  disabled?: boolean;
}

export function LocatorConfiguration({ form, disabled }: Props) {
  return (
    <Stack gap="sm">
      <Text fw={500} size="sm">Locator Configuration</Text>
      <LocatorsEditor
        value={form.values.locators}
        onChange={(rows) => form.setFieldValue('locators', rows)}
        disabled={disabled}
      />
    </Stack>
  );
}