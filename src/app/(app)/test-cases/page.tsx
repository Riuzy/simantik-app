'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Group, Text, Table, Badge, TextInput, Button, Select, Center, Loader, Box, ActionIcon } from '@mantine/core';
import { IconSearch, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useTestCases, useTestCaseModules } from '../../../features/test-cases/hooks';
import { useProjects } from '../../../features/projects/hooks';
import { PageHeader } from '../../../components/common/page';
import { CreateTestCaseModal } from '../../../features/test-cases/components/create-test-case-modal';
import type { TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '../../../features/test-cases/types';

const priorityColor: Record<string, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  CRITICAL: 'red',
};

const statusColor: Record<string, string> = {
  DRAFT: 'gray',
  READY: 'green',
  ARCHIVED: 'yellow',
};

const typeColor: Record<TestCaseType, string> = {
  MANUAL: 'gray',
  AUTOMATION: 'violet',
};

const lastResultColor: Record<TestCaseLastResult, string> = {
  NOT_RUN: 'gray',
  RUNNING: 'blue',
  PASSED: 'green',
  FAILED: 'red',
};

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'READY', label: 'Ready' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATION', label: 'Automation' },
];

const lastResultOptions = [
  { value: '', label: 'All Results' },
  { value: 'NOT_RUN', label: 'Not Run' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
];

const PAGE_SIZE = 10;

interface SortConfig {
  column: 'code' | 'title' | 'project' | 'type' | 'priority' | 'status' | 'module' | 'lastResult';
  order: 'asc' | 'desc';
}

export default function TestCasesPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [module, setModule] = useState<string>('');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [lastResult, setLastResult] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortConfig>({ column: 'code', order: 'asc' });
  const [createOpened, setCreateOpened] = useState(false);

  const { data: projects } = useProjects({ page: 1, limit: 100 });
  const { data: modules } = useTestCaseModules(projectId ?? undefined);
  const { data, isLoading } = useTestCases(projectId ?? '', {
    search: search || undefined,
    module: module || undefined,
    priority: (priority as TestPriority) || undefined,
    status: (status as TestCaseStatus) || undefined,
    type: (type as TestCaseType) || undefined,
    lastResult: (lastResult as TestCaseLastResult) || undefined,
    page,
    limit: PAGE_SIZE,
    sortBy: sort.column,
    sortOrder: sort.order,
  });

  const projectList = projects?.data ?? [];
  const testCases = data?.data ?? [];
  const pagination = data?.pagination;
  const moduleOptions = useMemo(
    () => [
      { value: '', label: 'All Modules' },
      ...(modules?.map((m) => ({ value: m, label: m })) ?? []),
    ],
    [modules],
  );

  const handleSort = (column: SortConfig['column']) => {
    setSort((prev) => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderSortIcon = (column: SortConfig['column']) => {
    if (sort.column !== column) {
      return <IconChevronDown size={12} style={{ opacity: 0.3 }} />;
    }
    return sort.order === 'asc' ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />;
  };

  const sortHeader = (column: SortConfig['column'], label: string) => (
    <Table.Th onClick={() => handleSort(column)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <Group gap={4} wrap="nowrap">{label}{renderSortIcon(column)}</Group>
    </Table.Th>
  );

  const start = pagination && pagination.total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endRange = pagination ? Math.min(page * PAGE_SIZE, pagination.total) : 0;

  return (
    <Container size="xl" py="md">
      <PageHeader
        title="Test Cases"
        description="All test cases across projects"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpened(true)}>
            New Test Case
          </Button>
        }
      />

      <Paper p="md" withBorder mb="md">
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          <Select
            label="Project"
            placeholder="All Projects"
            data={[
              { value: '', label: 'All Projects' },
              ...projectList.map((p) => ({ value: p.id, label: p.name })),
            ]}
            value={projectId ?? ''}
            onChange={(value) => { setProjectId(value || null); setPage(1); }}
            searchable
            clearable
          />
          <TextInput
            label="Search"
            leftSection={<IconSearch size={16} />}
            placeholder="Search title, code or module..."
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          />
          <Select
            label="Module"
            placeholder="All Modules"
            data={moduleOptions}
            value={module}
            onChange={(value) => { setModule(value || ''); setPage(1); }}
            clearable
            searchable
          />
          <Select
            label="Type"
            placeholder="All Types"
            data={typeOptions}
            value={type}
            onChange={(value) => { setType(value || ''); setPage(1); }}
            clearable
          />
          <Select
            label="Priority"
            placeholder="All Priorities"
            data={priorityOptions}
            value={priority}
            onChange={(value) => { setPriority(value || ''); setPage(1); }}
            clearable
          />
          <Select
            label="Status"
            placeholder="All Statuses"
            data={statusOptions}
            value={status}
            onChange={(value) => { setStatus(value || ''); setPage(1); }}
            clearable
          />
          <Select
            label="Last Result"
            placeholder="All Results"
            data={lastResultOptions}
            value={lastResult}
            onChange={(value) => { setLastResult(value || ''); setPage(1); }}
            clearable
          />
        </Box>
      </Paper>

      {isLoading ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <>
          <Paper p="md" withBorder>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  {sortHeader('code', 'Code')}
                  <Table.Th>Title</Table.Th>
                  {sortHeader('module', 'Module')}
                  {sortHeader('type', 'Type')}
                  {sortHeader('priority', 'Priority')}
                  {sortHeader('status', 'Design Status')}
                  {sortHeader('lastResult', 'Last Result')}
                  <Table.Th>Steps</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {testCases.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Center py="xl" style={{ flexDirection: 'column', gap: 8 }}>
                        <Text fw={500}>No test cases found.</Text>
                        <Text c="dimmed" size="sm">
                          There are no test cases matching your filters.
                        </Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
                {testCases.map((testCase) => (
                  <Table.Tr
                    key={testCase.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (testCase.project?.slug) {
                        router.push(`/projects/${testCase.project.slug}/test-cases/${testCase.code}`);
                      }
                    }}
                  >
                    <Table.Td ff="monospace">{testCase.code}</Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>{testCase.title}</Text>
                      {testCase.project?.name && <Text size="xs" c="dimmed">{testCase.project.name}</Text>}
                    </Table.Td>
                    <Table.Td>
                      {testCase.module ? <Text size="sm">{testCase.module}</Text> : <Text c="dimmed">{'\u2014'}</Text>}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={typeColor[testCase.type]} variant="light">{testCase.type}</Badge>
                    </Table.Td>
                    <Table.Td><Badge color={priorityColor[testCase.priority]} variant="light">{testCase.priority}</Badge></Table.Td>
                    <Table.Td><Badge color={statusColor[testCase.status]} variant="light">{testCase.status}</Badge></Table.Td>
                    <Table.Td>
                      <Badge color={lastResultColor[testCase.lastExecutionStatus]} variant="dot">
                        {testCase.lastExecutionStatus === 'NOT_RUN' ? 'Not Run' : testCase.lastExecutionStatus}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{testCase._count?.steps ?? 0}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>

          {pagination && pagination.total > 0 && (
            <Group justify="space-between" align="center" mt="md">
              <Text size="sm" c="dimmed">
                Showing {start}–{endRange} of {pagination.total} results
              </Text>
              <Group gap={4}>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconChevronLeft size={14} />}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <ActionIcon
                    key={p}
                    size="md"
                    variant={page === p ? 'filled' : 'light'}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </ActionIcon>
                ))}
                <Button
                  size="xs"
                  variant="light"
                  rightSection={<IconChevronRight size={14} />}
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Next
                </Button>
              </Group>
            </Group>
          )}
        </>
      )}

      <CreateTestCaseModal opened={createOpened} onClose={() => setCreateOpened(false)} />
    </Container>
  );
}
