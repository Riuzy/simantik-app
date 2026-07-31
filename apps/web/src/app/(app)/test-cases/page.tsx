'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Group, Text, Table, Badge, TextInput, Pagination, Center, Loader } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTestCases } from '../../../features/test-cases/hooks';
import { PageHeader } from '../../../components/common/page';

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

export default function TestCasesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTestCases('', { search: search || undefined, page, limit: 20 });

  const testCases = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <Container size="xl" py="md">
      <PageHeader title="Test Cases" description="All test cases across projects" />

      <Paper p="md" withBorder mb="md">
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search test cases..."
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
        />
      </Paper>

      {isLoading ? (
        <Center py="xl"><Loader /></Center>
      ) : (
        <>
          <Paper p="md" withBorder>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Project</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Steps</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {testCases.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6}><Text c="dimmed" ta="center" py="xl">No test cases found</Text></Table.Td>
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
                    <Table.Td>{testCase.project?.name ?? '\u2014'}</Table.Td>
                    <Table.Td><Badge color={priorityColor[testCase.priority]} variant="light">{testCase.priority}</Badge></Table.Td>
                    <Table.Td><Badge color={statusColor[testCase.status]} variant="light">{testCase.status}</Badge></Table.Td>
                    <Table.Td>{testCase._count?.steps ?? 0}</Table.Td>
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
