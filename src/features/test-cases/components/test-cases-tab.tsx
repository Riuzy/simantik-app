'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Group, Text, Button, Table, Badge, ActionIcon, Menu, TextInput, Center, Loader, Pagination, rem } from '@mantine/core';
import { IconPlus, IconSearch, IconDots, IconEye, IconPencil, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useTestCases, useDeleteTestCase } from '../hooks';
import { CreateTestCaseModal } from './create-test-case-modal';
import { EditTestCaseModal } from './edit-test-case-modal';
import type { TestPriority, TestCaseStatus } from '../types';

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

const statusLabel: Record<string, string> = {
  DRAFT: 'Draft',
  READY: 'Ready',
  ARCHIVED: 'Archived',
};

interface Props {
  projectId: string;
  projectSlug?: string;
  canManage: boolean;
}

export function TestCasesTab({ projectId, projectSlug, canManage }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpened, setCreateOpened] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; title: string; description: string | null; module: string | null; priority: TestPriority; status: TestCaseStatus } | null>(null);
  const [editOpened, setEditOpened] = useState(false);

  const { data, isLoading } = useTestCases(projectId, { search: search || undefined, page, limit: 20 });
  const deleteTestCase = useDeleteTestCase(projectId);

  const testCases = data?.data ?? [];
  const pagination = data?.pagination;

  const openDeleteConfirm = (tc: { id: string; title: string }) =>
    modals.openConfirmModal({
      title: 'Delete Test Case',
      centered: true,
      children: <Text size="sm">Are you sure you want to delete test case &quot;{tc.title}&quot;?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteTestCase.mutate(tc.id),
    });

  const openEdit = (tc: { id: string; title: string; description: string | null; module: string | null; priority: TestPriority; status: TestCaseStatus }) => {
    setEditTarget(tc);
    setEditOpened(true);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={500}>Test Cases ({pagination?.total ?? 0})</Text>
          {canManage && (
            <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => setCreateOpened(true)}>
              New Test Case
            </Button>
          )}
        </Group>

        <TextInput
          placeholder="Search test cases..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          mb="md"
          style={{ maxWidth: 400 }}
        />

        {isLoading ? (
          <Center py="xl"><Loader /></Center>
        ) : testCases.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">No test cases found</Text>
        ) : (
          <>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created By</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th w={60}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {testCases.map((tc) => (
                  <Table.Tr key={tc.id}>
                    <Table.Td>
                      <Text size="sm" fw={500} ff="monospace">{tc.code}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>{tc.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={priorityColor[tc.priority]} variant="light" size="sm">
                        {tc.priority}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColor[tc.status]} variant="light" size="sm">
                        {statusLabel[tc.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{tc.createdBy?.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{formatDate(tc.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={160} withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => {
                              if (projectSlug) {
                                router.push(`/projects/${projectSlug}/test-cases/${tc.code}`);
                              }
                            }}
                          >
                            View
                          </Menu.Item>
                          {canManage && (
                            <Menu.Item
                              leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                              onClick={() => openEdit(tc)}
                            >
                              Edit
                            </Menu.Item>
                          )}
                          {canManage && (
                            <Menu.Item
                              leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                              color="red"
                              onClick={() => openDeleteConfirm(tc)}
                            >
                              Delete
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
              <Center mt="md">
                <Pagination total={pagination.totalPages} value={page} onChange={setPage} />
              </Center>
            )}
          </>
        )}
      </Paper>

      <CreateTestCaseModal projectId={projectId} projectSlug={projectSlug} opened={createOpened} onClose={() => setCreateOpened(false)} />
      <EditTestCaseModal projectId={projectId} testCase={editTarget} opened={editOpened} onClose={() => { setEditOpened(false); setEditTarget(null); }} />
    </>
  );
}
