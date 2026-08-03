'use client';

import { useMemo } from 'react';
import { SimpleGrid, Group, Text, Stack, Loader, Center, Paper, Badge, Table } from '@mantine/core';
import { IconTestPipe, IconPlayerPlay, IconCircleCheck, IconAlertTriangle, IconChartBar, IconRobot } from '@tabler/icons-react';
import Link from 'next/link';
import { useProjectStore } from '../../../../../stores/project-store';
import { useProjectReport } from '../../../../../features/reports/hooks';
import { useExecutions } from '../../../../../features/executions/hooks';
import { useTestCases } from '../../../../../features/test-cases/hooks';
import { PageHeader } from '../../../../../components/ui/page-header';
import { StatCard } from '../../../../../components/ui/stat-card';
import { Section } from '../../../../../components/ui/section';
import { BarChart, DonutChart, StackedBar } from '../../../../../components/ui/charts';
import { ExecutionStatusBadge } from '../../../../../components/ui/badges';
import { EmptyState } from '../../../../../components/ui/empty-state';
import { ROUTES } from '../../../../../constants/routes';
import type { Execution } from '../../../../../features/executions/types';

function formatDuration(ms: number | null): string {
  if (!ms) return '\u2014';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ProjectReportsPage() {
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const projectId = selectedProject?.id ?? '';

  const { data: report, isLoading } = useProjectReport(projectId);
  const { data: executionsData } = useExecutions({ projectId, page: 1, limit: 100 });
  const { data: totalData } = useTestCases(projectId, { page: 1, limit: 1 });
  const { data: automationData } = useTestCases(projectId, { type: 'AUTOMATION', page: 1, limit: 1 });

  const executions = useMemo<Execution[]>(() => executionsData?.data ?? [], [executionsData]);
  const stat = report?.executionStatus ?? { PASSED: 0, FAILED: 0, ERROR: 0, SKIPPED: 0, RUNNING: 0 };
  const completed = stat.PASSED + stat.FAILED + stat.ERROR + stat.SKIPPED;
  const passRate = completed > 0 ? Math.round((stat.PASSED / completed) * 100) : 0;

  const totalTestCases = totalData?.pagination?.total ?? 0;
  const automationCount = automationData?.pagination?.total ?? 0;

  const trend = useMemo(() => {
    const days: { label: string; value: number; key: string }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-CA');
      const label = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      days.push({ label, value: 0, key });
    }
    for (const ex of executions) {
      if (!ex.createdAt) continue;
      const key = new Date(ex.createdAt).toLocaleDateString('en-CA');
      const day = days.find((d) => d.key === key);
      if (day) day.value += 1;
    }
    return days.map(({ label, value }) => ({ label, value }));
  }, [executions]);

  const statusSegments = [
    { label: 'Passed', value: stat.PASSED, color: 'var(--mantine-color-green-6)' },
    { label: 'Failed', value: stat.FAILED, color: 'var(--mantine-color-red-6)' },
    { label: 'Error', value: stat.ERROR, color: 'var(--mantine-color-orange-6)' },
    { label: 'Running', value: stat.RUNNING, color: 'var(--mantine-color-blue-6)' },
    { label: 'Skipped', value: stat.SKIPPED, color: 'var(--mantine-color-gray-5)' },
  ];

  const topFailed = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of executions) {
      if (e.status !== 'FAILED' && e.status !== 'ERROR') continue;
      const moduleName = e.testCase?.module?.trim();
      const key = moduleName || 'Uncategorized';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [executions]);

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!report) return <Center h={400}><Text c="dimmed">No report available</Text></Center>;

  return (
    <div>
      <PageHeader
        title="Reports"
        description={`${selectedProject?.name ?? ''} · quality analytics and trends`}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
        <StatCard title="Test Cases" value={totalTestCases} icon={<IconTestPipe size={22} />} color="violet" />
        <StatCard title="Automated" value={automationCount} icon={<IconRobot size={22} />} color="indigo" description={`${Math.round((automationCount / Math.max(1, totalTestCases)) * 100)}% coverage`} />
        <StatCard title="Executions" value={report.totalExecutions} icon={<IconPlayerPlay size={22} />} color="cyan" />
        <StatCard title="Pass Rate" value={completed > 0 ? `${passRate}%` : 'N/A'} description={`${stat.PASSED} passed / ${completed} completed`} icon={<IconCircleCheck size={22} />} color="green" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <Section title="Execution Trend" description="Executions per day (last 14 days)">
          {trend.every((d) => d.value === 0) ? (
            <EmptyState title="No executions yet" description="Run an automation test to see the trend" icon={IconChartBar} compact />
          ) : (
            <BarChart data={trend} height={200} showValues={false} />
          )}
        </Section>

        <Section title="Execution Status" description="Distribution of all execution results">
          <Group align="center" gap="lg">
            <DonutChart data={statusSegments.filter((s) => s.value > 0)} size={140} thickness={16} />
            <Stack gap={6} style={{ flex: 1 }}>
              {statusSegments.map((s) => (
                <Group key={s.label} justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.color }} />
                    <Text size="sm">{s.label}</Text>
                  </Group>
                  <Text size="sm" fw={600}>{s.value}</Text>
                </Group>
              ))}
              <div style={{ marginTop: 8 }}>
                <StackedBar segments={statusSegments.filter((s) => s.value > 0)} />
              </div>
            </Stack>
          </Group>
        </Section>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <Section title="Recent Executions" description="Latest execution history">
          {executions.length === 0 ? (
            <EmptyState title="No executions" description="Run a test from Automation to populate reports" icon={IconPlayerPlay} compact />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Number</Table.Th>
                    <Table.Th>Test Case</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Duration</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {executions.slice(0, 8).map((ex) => (
                    <Table.Tr key={ex.id}>
                      <Table.Td>
                        <Link href={ROUTES.EXECUTION_DETAIL(ex.id)} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Text size="sm" fw={600} ff="monospace">{ex.number}</Text>
                        </Link>
                      </Table.Td>
                      <Table.Td><Text size="sm" lineClamp={1}>{ex.testCase?.title ?? '\u2014'}</Text></Table.Td>
                      <Table.Td><ExecutionStatusBadge value={ex.status} size="sm" /></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{formatDuration(ex.durationMs)}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          )}
        </Section>

        <Section title="Top Failed Modules" description="Modules with the most failures">
          {topFailed.length === 0 ? (
            <EmptyState title="No failures" description="All executions are passing" icon={IconCircleCheck} compact />
          ) : (
            <Stack gap="sm">
              {topFailed.map((m, i) => (
                <Group key={i} justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Badge size="sm" color="red" variant="light" circle>{i + 1}</Badge>
                    <Text size="sm" truncate>{m.label}</Text>
                  </Group>
                  <Group gap="sm" wrap="nowrap">
                    <div style={{ width: 140, height: 8, borderRadius: 4, backgroundColor: 'var(--mantine-color-gray-1)', overflow: 'hidden' }}>
                      <div style={{ width: `${(m.value / Math.max(1, topFailed[0].value)) * 100}%`, height: '100%', backgroundColor: 'var(--mantine-color-red-5)', borderRadius: 4 }} />
                    </div>
                    <Text size="sm" fw={600} w={28} ta="right">{m.value}</Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Section>
      </SimpleGrid>

      <Section title="Quality Snapshot" description="Overall reliability indicators">
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Group gap="sm">
              <IconCircleCheck size={20} style={{ color: 'var(--mantine-color-green-6)' }} />
              <div>
                <Text fw={600} size="sm">Pass Rate</Text>
                <Text fz={22} fw={700}>{completed > 0 ? `${passRate}%` : 'N/A'}</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder>
            <Group gap="sm">
              <IconAlertTriangle size={20} style={{ color: 'var(--mantine-color-red-6)' }} />
              <div>
                <Text fw={600} size="sm">Failures</Text>
                <Text fz={22} fw={700}>{stat.FAILED + stat.ERROR}</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder>
            <Group gap="sm">
              <IconRobot size={20} style={{ color: 'var(--mantine-color-violet-6)' }} />
              <div>
                <Text fw={600} size="sm">Automation Coverage</Text>
                <Text fz={22} fw={700}>{totalTestCases > 0 ? `${Math.round((automationCount / totalTestCases) * 100)}%` : 'N/A'}</Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>
      </Section>
    </div>
  );
}
