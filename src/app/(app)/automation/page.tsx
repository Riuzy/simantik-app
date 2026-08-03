'use client';

import { useState } from 'react';
import { Container, Paper, Group, Text, Table, Badge, Button, Select, Center } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';
import Link from 'next/link';
import { useProjects } from '../../../features/projects/hooks';
import { useTestCases } from '../../../features/test-cases/hooks';
import { useRunTest } from '../../../features/automation/hooks';
import { PageHeader } from '../../../components/common/page';

export default function AutomationPage() {
  const { data: projects } = useProjects({ limit: 100 });
  const [projectId, setProjectId] = useState<string | null>(null);
  const { data: testCasesData } = useTestCases(projectId ?? '', { page: 1, limit: 50, type: 'AUTOMATION' });
  const runTest = useRunTest();

  const projectList = projects?.data ?? [];
  const testCases = testCasesData?.data ?? [];

  const handleRun = (id: string) => {
    runTest.mutate({ testCaseId: id, data: { headless: true } });
  };

  return (
    <Container size="xl" py="md">
      <PageHeader title="Automation" description="Generate and run Playwright scripts" />

      <Paper p="md" withBorder mb="md">
        <Select
          label="Project"
          placeholder="Select a project"
          data={projectList.map((p) => ({ value: p.id, label: p.name }))}
          value={projectId}
          onChange={setProjectId}
          searchable
          clearable
        />
      </Paper>

      {!projectId ? (
        <Center py="xl">
          <Text c="dimmed">Select a project to see its test cases</Text>
        </Center>
      ) : testCases.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed">No test cases in this project yet</Text>
        </Center>
      ) : (
        <Paper p="md" withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Code</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Steps</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {testCases.map((testCase) => (
                <Table.Tr key={testCase.id}>
                  <Table.Td ff="monospace">{testCase.code}</Table.Td>
                  <Table.Td>{testCase.title}</Table.Td>
                  <Table.Td>{testCase._count?.steps ?? 0}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={testCase.status === 'READY' ? 'green' : 'gray'}>{testCase.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Button
                        size="xs"
                        variant="light"
                        component={Link}
                        href={`/projects/${projectList.find((p) => p.id === projectId)?.slug}/test-cases/${testCase.code}`}
                      >
                        Open
                      </Button>
                      <Button
                        size="xs"
                        color="green"
                        leftSection={<IconPlayerPlay size={14} />}
                        loading={runTest.isPending}
                        onClick={() => handleRun(testCase.id)}
                      >
                        Run
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
