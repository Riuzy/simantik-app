'use client';

import { useState, useEffect } from 'react';
import { Container, Paper, Group, Text, Table, Badge, Pagination, TextInput, Center, Loader, ActionIcon, Menu, rem } from '@mantine/core';
import { useSearchParams, useRouter } from 'next/navigation';
import { IconSearch, IconDots, IconPlayerPlay, IconTrash, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';
import { useExecutions } from '../../../features/executions/hooks';
import type { ExecutionStatus } from '../../../features/executions/types';
import { PageHeader } from '../../../components/common/page';
import { useDeleteExecution, useRetryExecution } from '../../../features/executions/hooks';

const statusColor: Record<string, string> = {
  QUEUED: 'gray',
  RUNNING: 'blue',
  PASSED: 'green',
  FAILED: 'red',
  ERROR: 'orange',
  CANCELLED: 'yellow',
  SKIPPED: 'cyan',
};

const statusOptions: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ERROR', label: 'Error' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'SKIPPED', label: 'Skipped' },
];

export default function ExecutionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project') ?? undefined;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useExecutions({
    search: search || undefined,
    status: (status as ExecutionStatus) || undefined,
    page,
    limit: 20,
  });

  const executions = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteExecution = useDeleteExecution();
  const retryExecution = useRetryExecution();

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = async (id: string, e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this execution?')) {
      try {
        await deleteExecution.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete execution:', error);
      }
    }
  };

  const handleRetry = async (id: string, e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>) => {
    e.stopPropagation();
    try {
      await retryExecution.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error('Failed to retry execution:', error);
    }
  };

  return (
    <Container size="xl" py="md">
      <PageHeader
        title="Executions"
        description={projectSlug ? `Execution history for ${projectSlug}` : 'All test executions'}
      />

      <Paper p="md" withBorder mb="md">
        <Group gap="md" justify="space-between">
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Search by number or test case"
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
            style={{ flex: 1 }}
          />
          <Group gap="md">
            <select
              value={status}
              onChange={(e) => { setStatus(e.currentTarget.value); setPage(1); }}
              style={{ padding: '0 8px', height: 36, borderRadius: 6, border: '1px solid var(--mantine-color-gray-3)' }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ActionIcon
              onClick={handleRefresh}
              variant="light"
              color="blue"
              loading={isLoading}
              title="Refresh"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {isLoading ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <>
          <Paper p="md" withBorder>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Number</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Test Case</Table.Th>
                  <Table.Th>Project</Table.Th>
                  <Table.Th>Browser</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {executions.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}><Text c="dimmed" ta="center" py="xl">No executions found</Text></Table.Td>
                  </Table.Tr>
                )}
                {executions.map((execution) => (
                  <Table.Tr
                    key={execution.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/executions/${execution.id}`)}
                  >
                    <Table.Td ff="monospace">{execution.number}</Table.Td>
                    <Table.Td>
                      <Badge color={statusColor[execution.status] ?? 'gray'} variant="light">{execution.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Link href={`/projects/${execution.project.slug}/test-cases/${execution.testCase.code}`} onClick={(e) => e.stopPropagation()}>
                        <Text size="sm">{execution.testCase.title}</Text>
                      </Link>
                    </Table.Td>
                    <Table.Td>{execution.project.name}</Table.Td>
                    <Table.Td>{execution.browser ?? '—'}</Table.Td>
                    <Table.Td>{execution.durationMs != null ? `${(execution.durationMs / 1000).toFixed(2)}s` : '—'}</Table.Td>
                    <Table.Td>{new Date(execution.createdAt).toLocaleString()}</Table.Td>
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <Group gap="xs">
                        <Menu position="bottom-end" withArrow shadow="md">
                          <Menu.Target>
                            <ActionIcon variant="light" color="gray" size="sm">
                              <IconDots size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconPlayerPlay size={14} />}
                              onClick={() => router.push(`/executions/${execution.id}`)}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconPlayerPlay size={14} />}
                              onClick={(e) => handleRetry(execution.id, e)}
                              disabled={execution.status !== 'FAILED' && execution.status !== 'ERROR' && execution.status !== 'PASSED'}
                            >
                              Retry
                            </Menu.Item>
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={(e) => handleDelete(execution.id, e)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>

          {pagination && pagination.totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination value={page} onChange={setPage} total={pagination.totalPages} />
            </Group>
          )}
        </>
      )}
    </Container>
  );
}