'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Text, Select, TextInput, Pagination, Center, Menu, ActionIcon, Table, rem } from '@mantine/core';
import { IconPlus, IconSearch, IconDots, IconEye, IconPencil, IconTrash, IconFilter } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useProjectStore } from '../../../../../stores/project-store';
import { useTestCases, useDeleteTestCase, useTestCaseModules } from '../../../../../features/test-cases/hooks';
import { CreateTestCaseModal } from '../../../../../features/test-cases/components/create-test-case-modal';
import { EditTestCaseModal } from '../../../../../features/test-cases/components/edit-test-case-modal';
import { PageHeader } from '../../../../../components/ui/page-header';
import { FilterBar } from '../../../../../components/ui/filter-bar';
import { DataTable, EmptyTableRow } from '../../../../../components/ui/data-table';
import { PriorityBadge, TestCaseStatusBadge, TestCaseTypeBadge, LastResultBadge } from '../../../../../components/ui/badges';
import { ROUTES } from '../../../../../constants/routes';
import type { TestPriority, TestCaseStatus, TestCaseType, TestCaseLastResult } from '../../../../../features/test-cases/types';

const priorities: TestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses: TestCaseStatus[] = ['DRAFT', 'READY', 'ARCHIVED'];
const types: TestCaseType[] = ['MANUAL', 'AUTOMATION'];
const lastResults: TestCaseLastResult[] = ['NOT_RUN', 'RUNNING', 'PASSED', 'FAILED'];

export default function ProjectTestCasesPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const router = useRouter();
  const selectedProject = useProjectStore((s) => s.selectedProject);

  const [search, setSearch] = useState('');
  const [module, setModule] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [createOpened, setCreateOpened] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    code: string;
    title: string;
    description: string | null;
    module: string | null;
    priority: TestPriority;
    status: TestCaseStatus;
    type: TestCaseType;
  } | null>(null);
  const [editOpened, setEditOpened] = useState(false);

  const projectId = selectedProject?.id ?? '';
  const { data, isLoading } = useTestCases(projectId, {
    search: search || undefined,
    module: module || undefined,
    type: type || undefined,
    priority: priority || undefined,
    status: status || undefined,
    lastResult: lastResult || undefined,
    page,
    limit: 20,
  });
  const { data: modules } = useTestCaseModules(projectId);
  const deleteTestCase = useDeleteTestCase(projectId);

  const testCases = data?.data ?? [];
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);
  const openDeleteConfirm = (tc: { id: string; title: string }) =>
    modals.openConfirmModal({
      title: 'Delete Test Case',
      centered: true,
      children: <Text size="sm">Are you sure you want to delete test case &quot;{tc.title}&quot;?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteTestCase.mutate(tc.id),
    });

  return (
    <div>
      <PageHeader
        title="Test Cases"
        description={`${selectedProject?.name ?? ''} · ${pagination?.total ?? 0} test cases`}
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpened(true)}>
            New Test Case
          </Button>
        }
      />

      <FilterBar>
        <TextInput
          placeholder="Search test cases..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); resetPage(); }}
        />
        <Select
          placeholder="Module"
          data={modules?.map((m) => ({ value: m, label: m })) ?? []}
          value={module}
          onChange={(v) => { setModule(v); resetPage(); }}
          clearable
          searchable
          leftSection={<IconFilter size={15} />}
        />
        <Select
          placeholder="Type"
          data={types.map((t) => ({ value: t, label: t }))}
          value={type}
          onChange={(v) => { setType(v); resetPage(); }}
          clearable
        />
        <Select
          placeholder="Priority"
          data={priorities.map((p) => ({ value: p, label: p }))}
          value={priority}
          onChange={(v) => { setPriority(v); resetPage(); }}
          clearable
        />
        <Select
          placeholder="Design Status"
          data={statuses.map((s) => ({ value: s, label: s }))}
          value={status}
          onChange={(v) => { setStatus(v); resetPage(); }}
          clearable
        />
        <Select
          placeholder="Last Result"
          data={lastResults.map((r) => ({ value: r, label: r }))}
          value={lastResult}
          onChange={(v) => { setLastResult(v); resetPage(); }}
          clearable
        />
      </FilterBar>

      <DataTable
        loading={isLoading}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'title', label: 'Title' },
          { key: 'module', label: 'Module' },
          { key: 'type', label: 'Type' },
          { key: 'priority', label: 'Priority' },
          { key: 'status', label: 'Design Status' },
          { key: 'lastResult', label: 'Last Result' },
          { key: 'lastExecuted', label: 'Last Executed' },
          { key: 'steps', label: 'Steps' },
          { key: 'actions', label: '', width: 60 },
        ]}
        rows={
          testCases.length === 0 ? (
            <EmptyTableRow colSpan={10} message="No test cases found" description="Adjust filters or create a new test case" />
          ) : (
            testCases.map((tc) => (
              <Table.Tr
                key={tc.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(ROUTES.PROJECT_TEST_CASE_DETAIL(slug, tc.code))}
              >
                <Table.Td>
                  <Text size="sm" fw={600} ff="monospace">{tc.code}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1}>{tc.title}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{tc.module ?? '\u2014'}</Text>
                </Table.Td>
                <Table.Td>
                  <TestCaseTypeBadge value={tc.type} size="sm" />
                </Table.Td>
                <Table.Td>
                  <PriorityBadge value={tc.priority} size="sm" />
                </Table.Td>
                <Table.Td>
                  <TestCaseStatusBadge value={tc.status} size="sm" />
                </Table.Td>
                <Table.Td>
                  <LastResultBadge value={tc.lastExecutionStatus} size="sm" />
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {tc.lastExecutedAt ? new Date(tc.lastExecutedAt).toLocaleString() : '\u2014'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{tc._count?.steps ?? 0}</Text>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={160} withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm" aria-label={`Actions for ${tc.code}`} onClick={(e) => e.stopPropagation()}>
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(ROUTES.PROJECT_TEST_CASE_DETAIL(slug, tc.code));
                        }}
                      >
                        View
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditTarget({
                            id: tc.id,
                            code: tc.code,
                            title: tc.title,
                            description: tc.description,
                            module: tc.module,
                            priority: tc.priority,
                            status: tc.status,
                            type: tc.type,
                          });
                          setEditOpened(true);
                        }}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                        color="red"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDeleteConfirm(tc);
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
        <Center mt="md">
          <Pagination total={pagination.totalPages} value={page} onChange={setPage} />
        </Center>
      )}

      <CreateTestCaseModal projectId={projectId} projectSlug={slug} opened={createOpened} onClose={() => setCreateOpened(false)} />
      <EditTestCaseModal projectId={projectId} testCase={editTarget} opened={editOpened} onClose={() => { setEditOpened(false); setEditTarget(null); }} />
    </div>
  );
}
