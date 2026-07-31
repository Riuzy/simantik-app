'use client';

import { useState } from 'react';
import { Container, Paper, Title, Text, Table, Group, Button, TextInput, Badge, Loader, Center } from '@mantine/core';
import { useSettings, useUpsertSetting, useDeleteSetting } from '../../../features/settings/hooks';
import { PageHeader } from '../../../components/common/page';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const upsert = useUpsertSetting();
  const remove = useDeleteSetting();

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey.trim()) return;
    upsert.mutate({ key: newKey.trim(), value: newValue.trim() });
    setNewKey('');
    setNewValue('');
  };

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="lg" py="md">
      <PageHeader title="Settings" description="Manage application settings" />

      <Paper p="md" withBorder mb="md">
        <Title order={4} mb="sm">Add Setting</Title>
        <Group gap="md" align="flex-end">
          <TextInput
            label="Key"
            placeholder="e.g. app.name"
            value={newKey}
            onChange={(e) => setNewKey(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <TextInput
            label="Value"
            placeholder="e.g. SIMANTIK"
            value={newValue}
            onChange={(e) => setNewValue(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleAdd} loading={upsert.isPending}>Save</Button>
        </Group>
      </Paper>

      <Paper p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Key</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!settings || settings.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}><Text c="dimmed" ta="center" py="xl">No settings yet</Text></Table.Td>
              </Table.Tr>
            ) : (
              settings.map((setting) => (
                <Table.Tr key={setting.id}>
                  <Table.Td><Badge variant="light" ff="monospace">{setting.key}</Badge></Table.Td>
                  <Table.Td>{String(setting.value)}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" color="red" onClick={() => remove.mutate(setting.key)}>
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}
