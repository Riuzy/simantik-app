'use client';

import { Menu, ActionIcon, Group, Text, Badge, Loader, ScrollArea } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useExecutions } from '../../features/executions/hooks';
import { executionStatusMap } from '../../constants/status-maps';

export function NotificationsMenu() {
  const router = useRouter();
  const { data, isLoading } = useExecutions({ page: 1, limit: 6 });

  const executions = data?.data ?? [];
  const unread = executions.filter((e) => e.status === 'RUNNING' || e.status === 'FAILED' || e.status === 'ERROR').length;

  return (
    <Menu shadow="md" width={360} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" aria-label="Notifications" pos="relative">
          <IconBell size={18} />
          {unread > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--mantine-color-red-6)',
              }}
            />
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Recent Executions</Menu.Label>
        <ScrollArea.Autosize mah={360} type="scroll">
          {isLoading ? (
            <Group px="md" py="md"><Loader size={16} /> <Text size="sm" c="dimmed">Loading...</Text></Group>
          ) : executions.length === 0 ? (
            <Text size="sm" c="dimmed" px="md" py="md">No executions yet</Text>
          ) : (
            executions.map((exec) => (
              <Menu.Item
                key={exec.id}
                onClick={() => router.push(`/executions/${exec.id}`)}
              >
                <Group justify="space-between" wrap="nowrap" w="100%">
                  <Group gap="sm" wrap="nowrap">
                    <Text size="xs" ff="monospace" c="dimmed" fw={600}>{exec.number}</Text>
                    <Text size="sm" fw={500} lineClamp={1}>{exec.testCase?.title ?? 'Unknown'}</Text>
                  </Group>
                  <Badge color={executionStatusMap.color[exec.status]} variant="dot" size="xs">
                    {executionStatusMap.label[exec.status]}
                  </Badge>
                </Group>
              </Menu.Item>
            ))
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
