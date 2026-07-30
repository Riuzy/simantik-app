'use client';

import { useState, useCallback } from 'react';
import { Container, Paper, Text, Group, Badge, Button, Stack, Center, Loader, Pagination, Box } from '@mantine/core';
import { IconCheck, IconBell } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useNotifications, useMarkAsRead } from '../../../features/notifications/hooks';
import { PageHeader } from '../../../components/common/page';

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
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { data, isLoading } = useNotifications({ page, limit: 20 });
  const markAsRead = useMarkAsRead();
  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  const handleClick = useCallback((notification: { id: string; isRead: boolean; metadata: Record<string, unknown> | null }) => {
    if (!notification.isRead) {
      markAsRead.mutate([notification.id]);
    }
    const meta = notification.metadata;
    if (meta?.projectId) {
      router.push(`/projects/${meta.projectId}`);
    }
  }, [markAsRead, router]);

  return (
    <Container size="md" py="md">
      <PageHeader title="Notifications" />

      {isLoading ? (
        <Center py="xl"><Loader /></Center>
      ) : notifications.length === 0 ? (
        <Center py="xl">
          <div style={{ textAlign: 'center' }}>
            <IconBell size={48} style={{ opacity: 0.2 }} />
            <Text c="dimmed" mt="sm">No notifications yet</Text>
          </div>
        </Center>
      ) : (
        <>
          <Stack gap="xs">
            {notifications.map((n) => (
              <Paper
                key={n.id}
                p="sm"
                withBorder
                style={{
                  cursor: 'pointer',
                  backgroundColor: n.isRead ? undefined : 'var(--mantine-color-blue-0)',
                }}
                onClick={() => handleClick(n)}
              >
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" mb={4}>
                      <Text fw={500} size="sm">{n.title}</Text>
                      {!n.isRead && <Badge size="xs" color="blue" variant="filled">New</Badge>}
                    </Group>
                    <Text size="sm" c="dimmed">{n.message}</Text>
                    <Text size="xs" c="gray" mt={4}>{timeAgo(n.createdAt)}</Text>
                  </Box>
                  {n.isRead ? (
                    <IconCheck size={18} style={{ color: 'var(--mantine-color-green-6)', flexShrink: 0, marginTop: 4 }} />
                  ) : (
                    <Box w={10} h={10} style={{ borderRadius: '50%', backgroundColor: 'var(--mantine-color-blue-6)', flexShrink: 0, marginTop: 6 }} />
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>

          {pagination && pagination.totalPages > 1 && (
            <Center mt="lg">
              <Pagination total={pagination.totalPages} value={page} onChange={setPage} />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}
