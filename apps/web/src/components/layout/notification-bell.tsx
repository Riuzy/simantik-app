'use client';

import { useState, useCallback } from 'react';
import { ActionIcon, Indicator, Popover, Stack, Text, Group, Button, Divider, Box, Center, Loader, Badge } from '@mantine/core';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useNotificationSocket } from '../../features/notifications/hooks';
import type { Notification } from '../../features/notifications/types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [opened, setOpened] = useState(false);
  const router = useRouter();

  useNotificationSocket();

  const { data: notificationsData, isLoading } = useNotifications({ limit: 5, page: 1 });
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.data ?? [];

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate([notification.id]);
    }
    setOpened(false);

    const metadata = notification.metadata;
    if (metadata?.projectId) {
      const projectUrl = `/projects/${metadata.projectId}`;
      router.push(projectUrl);
    } else {
      router.push('/notifications');
    }
  }, [markAsRead, router]);

  const handleViewAll = useCallback(() => {
    setOpened(false);
    router.push('/notifications');
  }, [router]);

  return (
    <Popover opened={opened} onChange={setOpened} width={380} position="bottom-end" shadow="md" withArrow withinPortal>
      <Popover.Target>
        <ActionIcon variant="subtle" size="lg" onClick={() => setOpened((o) => !o)} aria-label="Notifications">
          <Indicator inline size={12} offset={4} disabled={unreadCount === 0} label={unreadCount > 99 ? '99+' : unreadCount}>
            <IconBell size={20} />
          </Indicator>
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box p="sm" pb={0}>
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm">Notifications</Text>
            {unreadCount > 0 && (
              <Button variant="subtle" size="xs" onClick={() => markAllAsRead.mutate()} loading={markAllAsRead.isPending}>
                Mark all read
              </Button>
            )}
          </Group>
        </Box>

        <Divider />

        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : notifications.length === 0 ? (
          <Center py="xl">
            <Text size="sm" c="dimmed">No notifications</Text>
          </Center>
        ) : (
          <Stack gap={0}>
            {notifications.map((n) => (
              <Box
                key={n.id}
                py="sm"
                px="sm"
                style={{
                  cursor: 'pointer',
                  backgroundColor: n.isRead ? undefined : 'var(--mantine-color-blue-0)',
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
                onClick={() => handleNotificationClick(n)}
              >
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" mb={2}>
                      <Text size="sm" fw={500} lineClamp={1}>{n.title}</Text>
                      {!n.isRead && <Badge size="xs" color="blue" variant="filled" style={{ flexShrink: 0 }}>New</Badge>}
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={2}>{n.message}</Text>
                    <Text size="xs" c="gray" mt={2}>{timeAgo(n.createdAt)}</Text>
                  </Box>
                  {n.isRead ? (
                    <IconCheck size={14} style={{ color: 'var(--mantine-color-green-6)', flexShrink: 0, marginTop: 4 }} />
                  ) : (
                    <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: 'var(--mantine-color-blue-6)', flexShrink: 0, marginTop: 6 }} />
                  )}
                </Group>
              </Box>
            ))}
          </Stack>
        )}

        <Divider />

        <Box p="sm">
          <Button variant="light" fullWidth size="sm" onClick={handleViewAll}>
            View All
          </Button>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}
