'use client';

import { Container, Paper, Group, Title, Text, Loader, Center } from '@mantine/core';
import { useOverviewReport } from '../../../features/reports/hooks';
import { ExecutionStatusSummary } from '../../../features/reports/components/execution-status-summary';

export default function ReportsPage() {
  const { data: report, isLoading } = useOverviewReport();

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="lg">Reports</Title>

      <Paper p="lg" radius="md" withBorder mb="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Execution Overview</Title>
          <Text size="sm" c="dimmed">All executions</Text>
        </Group>
        <ExecutionStatusSummary
          status={report?.executionStatus ?? { PASSED: 0, FAILED: 0, ERROR: 0, SKIPPED: 0, RUNNING: 0 }}
          total={report?.totalExecutions ?? 0}
        />
      </Paper>

      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Summary</Title>
        <Group gap="xl">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Projects</Text>
            <Text size="xl" fw={700}>{report?.totalProjects ?? 0}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Test Cases</Text>
            <Text size="xl" fw={700}>{report?.totalTestCases ?? 0}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Executions</Text>
            <Text size="xl" fw={700}>{report?.totalExecutions ?? 0}</Text>
          </div>
        </Group>
      </Paper>
    </Container>
  );
}
