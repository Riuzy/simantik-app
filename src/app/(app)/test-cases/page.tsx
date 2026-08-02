'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Group, Text, Table, Badge, TextInput, Button, Select, Center, Loader, Box } from '@mantine/core';
import { IconSearch, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useTestCases } from '../../../features/test-cases/hooks';
import { useProjects } from '../../../features/projects/hooks';
import { PageHeader } from '../../../components/common/page';
import type { TestPriority, TestCaseStatus } from '../../../features/test-cases/types';

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

const PAGE_SIZE = 10;

interface SortConfig {
  column: 'code' | 'project' | 'priority' | 'status' | 'createdAt';
  order: 'asc' | 'desc';
}

export default function TestCasesPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortConfig>({ column: 'createdAt', order: 'desc' });

  const { data: projects } = useProjects({ page: 1, limit: 100 });
  const { data, isLoading } = useTestCases(projectId ?? '', {
    search: search || undefined,
    priority: (priority as TestPriority) || undefined,
    status: (status as TestCaseStatus) || undefined,
    page,
    limit: PAGE_SIZE,
    sortBy: sort.column,
    sortOrder: sort.order,
  });

  const projectList = projects?.data ?? [];
  const testCases = data?.data ?? [];
  const pagination = data?.pagination;

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

  const goToCreate = () => {
    if (projectId) {
      const project = projectList.find((p) => p.id === projectId);
      router.push(`/projects/${project?.slug ?? ''}/test-cases`);
    }
  };

  const start = pagination && pagination.total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endRange = pagination ? Math.min(page * PAGE_SIZE, pagination.total) : 0;

  return (
    <Container size="xl" py="md">
      <PageHeader title="Test Cases" description="All test cases across projects" />

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
            placeholder="Search test cases..."
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
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
                  {sortHeader('project', 'Project')}
                  {sortHeader('priority', 'Priority')}
                  {sortHeader('status', 'Status')}
                  <Table.Th>Steps</Table.Th>
                  {sortHeader('createdAt', 'Created')}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {testCases.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Center py="xl" style={{ flexDirection: 'column', gap: 8 }}>
                        <Text fw={500}>No test cases found.</Text>
                        <Text c="dimmed" size="sm">
                          {projectId
                            ? "This project doesn't have any test cases yet."
                            : 'There are no test cases matching your filters.'}
                        </Text>
                        {projectId && (
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconPlus size={14} />}
                            onClick={goToCreate}
                          >
                            Create Test Case
                          </Button>
                        )}
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
                      <Text size="sm">{testCase.title}</Text>
                      {testCase.module && <Text size="xs" c="dimmed">{testCase.module}</Text>}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{testCase.project?.name ?? '\u2014'}</Text>
                    </Table.Td>
                    <Table.Td><Badge color={priorityColor[testCase.priority]} variant="light">{testCase.priority}</Badge></Table.Td>
                    <Table.Td><Badge color={statusColor[testCase.status]} variant="light">{testCase.status}</Badge></Table.Td>
                    <Table.Td>{testCase._count?.steps ?? 0}</Table.Td>
                    <Table.Td>{new Date(testCase.createdAt).toLocaleDateString()}</Table.Td>
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
              <Box style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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
                  <Button
                    key={p}
                    size="xs"
                    variant={page === p ? 'filled' : 'light'}
                    onClick={() => setPage(p)}
                    style={{ minWidth: 32 }}
                  >
                    {p}
                  </Button>
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
              </Box>
            </Group>
          )}
        </>
      )}
    </Container>
  );
}