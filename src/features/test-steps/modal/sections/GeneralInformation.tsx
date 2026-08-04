import React from 'react';
import { Select, TextInput, Textarea, Grid, Text, Stack } from '@mantine/core';
import { ACTION_OPTIONS } from '../../../../constants/test-step-actions';
import type { UseFormReturnType } from '@mantine/form';
import type { TestStepFormValues } from '../types';

interface Props {
  form: UseFormReturnType<TestStepFormValues>;
  disabled?: boolean;
}

export function GeneralInformation({ form, disabled }: Props) {
  return (
    <Stack gap="sm">
      <Text fw={500} size="sm">General Information</Text>

      <Select
        label="Action"
        placeholder="Select an action type"
        data={ACTION_OPTIONS}
        searchable
        required
        disabled={disabled}
        comboboxProps={{ zIndex: 1001 }}
        {...form.getInputProps('action')}
      />

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Input Value"
            placeholder="Text to type, option to select, key to press"
            disabled={disabled}
            {...form.getInputProps('inputValue')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Description"
            placeholder="Short description of this step"
            disabled={disabled}
            {...form.getInputProps('description')}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}