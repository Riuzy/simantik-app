'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, TextInput, Select, Pagination, Menu, ActionIcon, Table, Stack } from '@mantine/core';
import { IconSearch, IconDots, IconPlayerPlay, IconTrash, IconRefresh, IconFilter, IconHistory } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useProjectStore } from '../../../../../stores/project-store';
import { useExecutions, useDeleteExecution, useRetryExecution, useResetExecutionHistory } from '../../../../../features/executions/hooks';
import { PageHeader } from '../../../../../components/ui/page-header';
import { FilterBar } from '../../../../../components/ui/filter-bar';
import { DataTable, EmptyTableRow } from '../../../../../components/ui/data-table';
import { ExecutionStatusBadge } from '../../../../../components/ui/badges';
import { ROUTES } from '../../../../../constants/routes';
import type { ExecutionStatus } from '../../../../../features/executions/types';

const statusOptions: { value: ExecutionStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ERROR', label: 'Error' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'SKIPPED', label: 'Skipped' },
];

function formatDuration(ms: number | null): string {
  if (!ms) return '\u2014';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatLastRun(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleString();
}

export default function ProjectExecutionsPage() {
  const router = useRouter();
  const selectedProject = useProjectStore((s) => s.selectedProject);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ExecutionStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useExecutions({
    projectId: selectedProject?.id,
    search: search || undefined,
    status: status || undefined,
    page,
    limit: 20,
  });

  const deleteExecution = useDeleteExecution();
  const retryExecution = useRetryExecution();
  const resetExecutionHistory = useResetExecutionHistory();
  const executions = data?.data ?? [];
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);

  const openDeleteConfirm = (ex: { id: string; number: string }) =>
    modals.openConfirmModal({
      title: 'Delete Execution',
      centered: true,
      children: <Text size="sm">Are you sure you want to delete execution &quot;{ex.number}&quot;? This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteExecution.mutate(ex.id),
    });

  const openResetConfirm = (ex: { testCaseId?: string; number: string }) => {
    if (!ex.testCaseId) return;
    modals.openConfirmModal({
      title: 'Reset Execution History',
      centered: true,
      children: (
        <Text size="sm">
          This will permanently delete execution &quot;{ex.number}&quot; including its logs, screenshot,
          generated script, and error data. The test case will be reset to &quot;Not Run&quot;.
          This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Reset History', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => resetExecutionHistory.mutate(ex.testCaseId as string),
    });
  };

  return (
    <div>
      <PageHeader
        title="Executions"
        description={`${selectedProject?.name ?? ''} · ${pagination?.total ?? 0} executions`}
        actions={
          <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={() => refetch()} loading={isLoading}>
            Refresh
          </Button>
        }
      />

      <FilterBar>
        <TextInput
          placeholder="Search by number or test case..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); resetPage(); }}
        />
        <Select
          placeholder="Status"
          data={statusOptions.map((s) => ({ value: s.value, label: s.label }))}
          value={status}
          onChange={(v) => { setStatus((v as ExecutionStatus | '') ?? ''); resetPage(); }}
          clearable
          leftSection={<IconFilter size={15} />}
        />
      </FilterBar>

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'number', label: 'Execution' },
          { key: 'testCase', label: 'Test Case' },
          { key: 'status', label: 'Status' },
          { key: 'runCount', label: 'Run Count' },
          { key: 'lastRun', label: 'Last Run' },
          { key: 'duration', label: 'Duration' },
          { key: 'browser', label: 'Browser' },
          { key: 'actions', label: '', width: 60 },
        ]}
        rows={
          executions.length === 0 ? (
            <EmptyTableRow colSpan={8} message="No executions found" description="Run an automation test to see execution history" />
          ) : (
            executions.map((ex) => (
              <Table.Tr key={ex.id} style={{ cursor: 'pointer' }} onClick={() => router.push(ROUTES.EXECUTION_DETAIL(ex.id))}>
                <Table.Td>
                  <Text size="sm" fw={600} ff="monospace">{ex.number}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1}>{ex.testCase?.title ?? '\u2014'}</Text>
                </Table.Td>
                <Table.Td>
                  <ExecutionStatusBadge value={ex.status} size="sm" />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">Run: {ex.runCount}x</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">{formatLastRun(ex.lastRunAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{formatDuration(ex.durationMs)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{ex.browser ?? '\u2014'}</Text>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={160} withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconPlayerPlay size={14} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(ROUTES.EXECUTION_DETAIL(ex.id));
                        }}
                      >
                        View Details
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconRefresh size={14} />}
                        disabled={ex.status !== 'FAILED' && ex.status !== 'ERROR' && ex.status !== 'PASSED'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          retryExecution.mutate({ executionId: ex.id, body: { headless: true } });
                        }}
                      >
                        Retry
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconHistory size={14} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openResetConfirm(ex);
                        }}
                      >
                        Reset Execution History
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDeleteConfirm(ex);
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))
          )
        }
      />

      {pagination && pagination.totalPages > 1 && (
        <Stack align="center" mt="md">
          <Pagination total={pagination.totalPages} value={page} onChange={setPage} />
        </Stack>
      )}
    </div>
  );
}
