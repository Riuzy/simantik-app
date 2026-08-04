'use client';

import { memo, useCallback, KeyboardEvent } from 'react';
import { Group, Select, TextInput, Button, ActionIcon, Text, Stack } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { LOCATOR_OPTIONS } from '../../../constants/test-step-actions';
import type { LocatorItem } from './types';

interface Props {
  value: LocatorItem[];
  onChange: (rows: LocatorItem[]) => void;
  error?: string;
  disabled?: boolean;
}

export const LocatorsEditor = memo(function LocatorsEditor({ value, onChange, error, disabled }: Props) {
  const rows = value ?? [];

  const update = useCallback(
    (index: number, patch: Partial<LocatorItem>) => {
      onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    },
    [rows, onChange],
  );

  const remove = useCallback(
    (index: number) => {
      onChange(rows.filter((_, i) => i !== index));
    },
    [rows, onChange],
  );

  const add = useCallback(() => {
    onChange([...rows, { strategy: 'LABEL', value: '' }]);
  }, [rows, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (index === rows.length - 1) add();
      }
    },
    [add, rows.length],
  );

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>Locators</Text>
        <Button
          variant="light"
          size="compact-xs"
          leftSection={<IconPlus size={14} />}
          onClick={add}
          disabled={disabled}
          aria-label="Add locator"
        >
          Add locator
        </Button>
      </Group>
      <Text size="xs" c="dimmed">
        The engine tries your locators as a cascade. Ambiguous matches are skipped in favour of a more specific selector.
      </Text>
      {error && (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      )}
      {rows.length === 0 && (
        <Text size="xs" c="dimmed">No locators yet. Add at least one.</Text>
      )}
      {rows.map((row, index) => (
        <Group key={index} gap="xs" align="center" wrap="nowrap">
          <Select
            data={LOCATOR_OPTIONS}
            value={row.strategy}
            onChange={(v) => update(index, { strategy: v ?? '' })}
            style={{ width: 150 }}
            size="xs"
            searchable
            comboboxProps={{ zIndex: 1001 }}
            aria-label={`Locator strategy for row ${index + 1}`}
            disabled={disabled}
          />
          <TextInput
            value={row.value}
            onChange={(e) => update(index, { value: e.currentTarget.value })}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="e.g. Project Name, #submit, input[name='name']"
            size="xs"
            style={{ flex: 1 }}
            disabled={disabled}
            aria-label={`Locator value for row ${index + 1}`}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            size="sm"
            onClick={() => remove(index)}
            aria-label={`Remove locator row ${index + 1}`}
            disabled={disabled}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
});