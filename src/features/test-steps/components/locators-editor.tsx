'use client';

import { Group, Select, TextInput, Button, ActionIcon, Text, Stack } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { LOCATOR_OPTIONS } from '../../../constants/test-step-actions';
import type { LocatorItem } from '../types';

interface Props {
  value: LocatorItem[];
  onChange: (rows: LocatorItem[]) => void;
}

export function LocatorsEditor({ value, onChange }: Props) {
  const rows = value ?? [];

  const update = (index: number, patch: Partial<LocatorItem>) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const remove = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...rows, { strategy: 'LABEL', value: '' }]);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>Locators</Text>
        <Button variant="light" size="compact-xs" leftSection={<IconPlus size={14} />} onClick={add}>
          Add locator
        </Button>
      </Group>
      <Text size="xs" c="dimmed">Tried in priority order: LABEL, PLACEHOLDER, ROLE, TEXT, TEST_ID, NAME, ID, CSS, XPATH. The first matching locator is used.</Text>
      {rows.length === 0 && (
        <Text size="xs" c="dimmed">No locators yet. Add at least one.</Text>
      )}
      {rows.map((row, index) => (
        <Group key={index} gap="xs" align="center" wrap="nowrap">
          <Select
            data={LOCATOR_OPTIONS}
            searchable
            value={row.strategy}
            onChange={(v) => update(index, { strategy: v || '' })}
            style={{ width: 150 }}
            size="xs"
          />
          <TextInput
            value={row.value}
            onChange={(e) => update(index, { value: e.currentTarget.value })}
            placeholder="e.g. Project Name, #submit, input[name='name']"
            size="xs"
            style={{ flex: 1 }}
          />
          <ActionIcon color="red" variant="subtle" size="sm" onClick={() => remove(index)}>
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
}
