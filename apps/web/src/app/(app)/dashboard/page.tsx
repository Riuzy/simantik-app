'use client';

import { Container, SimpleGrid, Paper, Group, Title, Text, Badge, Loader, Center, Stack } from '@mantine/core';
import { IconFolder, IconTestPipe, IconPlayerPlay } from '@tabler/icons-react';
import Link from 'next/link';
import { useOverviewReport } from '../../../features/reports/hooks';
import { ExecutionStatusSummary } from '../../../features/reports/components/execution-status-summary';

const statusColor: Record<string, string> = {
  RUNNING: 'blue',
  PASSED: 'green',
  FAILED: 'red',
  SKIPPED: 'gray',
  ERROR: 'orange',
};

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon?: React.ReactNode; color?: string }) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
          <Text size="xxl" fw={700} mt={4}>{value}</Text>
        </div>
        {icon && <div style={{ color: `var(--mantine-color-${color || 'blue'}-6)` }}>{icon}</div>}
      </Group>
    </Paper>
  );
}

export default function DashboardPage() {
  const { data: report, isLoading } = useOverviewReport();

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="lg">Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        <StatCard title="Total Projects" value={report?.totalProjects ?? 0} icon={<IconFolder size={24} />} color="blue" />
        <StatCard title="Test Cases" value={report?.totalTestCases ?? 0} icon={<IconTestPipe size={24} />} color="violet" />
        <StatCard title="Total Executions" value={report?.totalExecutions ?? 0} icon={<IconPlayerPlay size={24} />} color="cyan" />
      </SimpleGrid>

      <Paper p="lg" radius="md" withBorder mb="md">
        <Title order={4} mb="md">Execution Status</Title>
        <ExecutionStatusSummary status={report?.executionStatus ?? { PASSED: 0, FAILED: 0, ERROR: 0, SKIPPED: 0, RUNNING: 0 }} total={report?.totalExecutions ?? 0} />
      </Paper>

      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Recent Executions</Title>
        {!report || report.recentExecutions.length === 0 ? (
          <Text c="dimmed" size="sm">No executions yet. Run a test to see results here.</Text>
        ) : (
          <Stack gap="xs">
            {report.recentExecutions.map((execution) => (
              <Group key={execution.id} justify="space-between" wrap="nowrap">
                <Link href={`/executions/${execution.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                  <Group gap="sm" wrap="nowrap">
                    <Badge color={statusColor[execution.status]} variant="light">{execution.status}</Badge>
                    <Text size="sm" fw={500} ff="monospace">{execution.number}</Text>
                    <Text size="sm" truncate>{execution.testCase.title}</Text>
                  </Group>
                </Link>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{new Date(execution.createdAt).toLocaleString()}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
