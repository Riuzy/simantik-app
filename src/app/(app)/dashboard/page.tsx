'use client';

import { useMemo } from 'react';
import { Container, SimpleGrid, Group, Text, Loader, Center, Stack } from '@mantine/core';
import { IconFolder, IconTestPipe, IconPlayerPlay, IconCircleCheck, IconRobot } from '@tabler/icons-react';
import Link from 'next/link';
import { useOverviewReport } from '../../../features/reports/hooks';
import { useExecutions } from '../../../features/executions/hooks';
import { useTestCases } from '../../../features/test-cases/hooks';
import { PageHeader } from '../../../components/ui/page-header';
import { StatCard } from '../../../components/ui/stat-card';
import { Section } from '../../../components/ui/section';
import { BarChart, DonutChart } from '../../../components/ui/charts';
import { ExecutionStatusBadge } from '../../../components/ui/badges';
import { EmptyState } from '../../../components/ui/empty-state';
import type { Execution } from '../../../features/executions/types';

function formatDuration(ms: number | null): string {
  if (!ms) return '\u2014';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function DashboardPage() {
  const { data: report, isLoading } = useOverviewReport();
  const { data: executionsData } = useExecutions({ page: 1, limit: 100 });
  const { data: automationData } = useTestCases('', { type: 'AUTOMATION', page: 1, limit: 1 });
  const { data: totalData } = useTestCases('', { page: 1, limit: 1 });

  const executions = useMemo<Execution[]>(() => executionsData?.data ?? [], [executionsData]);

  const stat = report?.executionStatus ?? { PASSED: 0, FAILED: 0, ERROR: 0, SKIPPED: 0, RUNNING: 0 };
  const completed = stat.PASSED + stat.FAILED + stat.ERROR + stat.SKIPPED;
  const passRate = completed > 0 ? Math.round((stat.PASSED / completed) * 100) : 0;

  const totalTestCases = totalData?.pagination?.total ?? 0;
  const automationCount = automationData?.pagination?.total ?? 0;
  const automationCoverage = totalTestCases > 0 ? Math.round((automationCount / totalTestCases) * 100) : 0;

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

  const latestFailed = useMemo(
    () => executions.filter((e) => e.status === 'FAILED' || e.status === 'ERROR').slice(0, 6),
    [executions],
  );

  const topFailedModules = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of executions) {
      if (e.status !== 'FAILED' && e.status !== 'ERROR') continue;
      const moduleName = e.testCase?.module?.trim();
      const key = moduleName || 'Uncategorized';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
  }, [executions]);

  if (isLoading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="xl">
      <PageHeader
        title="Dashboard"
        description="Overview of your automation testing platform"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} mb="md">
        <StatCard title="Projects" value={report?.totalProjects ?? 0} icon={<IconFolder size={22} />} color="blue" />
        <StatCard title="Test Cases" value={report?.totalTestCases ?? 0} icon={<IconTestPipe size={22} />} color="violet" />
        <StatCard title="Executions" value={report?.totalExecutions ?? 0} icon={<IconPlayerPlay size={22} />} color="cyan" />
        <StatCard title="Pass Rate" value={`${passRate}%`} description={`${stat.PASSED} passed / ${completed} completed`} icon={<IconCircleCheck size={22} />} color="green" />
        <StatCard title="Automation Coverage" value={`${automationCoverage}%`} description={`${automationCount} of ${totalTestCases} test cases`} icon={<IconRobot size={22} />} color="indigo" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} mb="md">
        <Section title="Execution Trend" description="Executions per day (last 14 days)">
          {trend.every((d) => d.value === 0) ? (
            <EmptyState title="No executions yet" description="Run an automation test to see the trend" compact />
          ) : (
            <BarChart data={trend} height={180} showValues={false} />
          )}
        </Section>

        <Section title="Pass vs Failed" description="Distribution of execution results">
          <Group align="center" gap="lg">
            <DonutChart
              data={statusSegments.filter((s) => s.value > 0)}
              size={120}
              thickness={14}
            />
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
            </Stack>
          </Group>
        </Section>

        <Section title="Recent Activity" description="Latest execution results">
          <Stack gap="sm">
            {(report?.recentExecutions ?? []).length === 0 ? (
              <Text size="sm" c="dimmed">No activity yet</Text>
            ) : (
              (report?.recentExecutions ?? []).map((ex) => (
                <Group key={ex.id} justify="space-between" wrap="nowrap">
                  <Link href={`/executions/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0, flex: 1 }}>
                    <Group gap="sm" wrap="nowrap">
                      <ExecutionStatusBadge value={ex.status as Execution['status']} size="sm" />
                      <Text size="sm" fw={500} ff="monospace">{ex.number}</Text>
                      <Text size="sm" truncate>{ex.testCase.title}</Text>
                    </Group>
                  </Link>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{new Date(ex.createdAt).toLocaleTimeString()}</Text>
                </Group>
              ))
            )}
          </Stack>
        </Section>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="md">
        <Section
          title="Recent Executions"
          actions={
            <Link href="/projects" style={{ fontSize: 13, textDecoration: 'none' }}>View all</Link>
          }
        >
          {executions.length === 0 ? (
            <EmptyState title="No executions" description="Run a test from Automation to see results" compact />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Execution</th>
                    <th style={thStyle}>Test Case</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.slice(0, 8).map((ex) => (
                    <tr key={ex.id} style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                      <td style={tdStyle}>
                        <Link href={`/executions/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Text size="sm" ff="monospace" fw={600}>{ex.number}</Text>
                        </Link>
                      </td>
                      <td style={tdStyle}>
                        <Text size="sm" lineClamp={1}>{ex.testCase?.title ?? '\u2014'}</Text>
                      </td>
                      <td style={tdStyle}>
                        <ExecutionStatusBadge value={ex.status} size="sm" />
                      </td>
                      <td style={tdStyle}>
                        <Text size="sm" c="dimmed">{formatDuration(ex.durationMs)}</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Latest Failed Tests" description="Most recent failing or errored executions">
          {latestFailed.length === 0 ? (
            <EmptyState title="All passing" description="No failing executions detected" compact />
          ) : (
            <Stack gap="sm">
              {latestFailed.map((ex) => (
                <Group key={ex.id} justify="space-between" wrap="nowrap">
                  <Link href={`/executions/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0, flex: 1 }}>
                    <Group gap="sm" wrap="nowrap">
                      <ExecutionStatusBadge value={ex.status} size="sm" />
                      <Text size="sm" fw={500} ff="monospace">{ex.number}</Text>
                      <Text size="sm" truncate>{ex.testCase?.title ?? '\u2014'}</Text>
                    </Group>
                  </Link>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{new Date(ex.createdAt ?? '').toLocaleString()}</Text>
                </Group>
              ))}
            </Stack>
          )}
        </Section>
      </SimpleGrid>

      <Section title="Top Failed Modules" description="Modules with the most failures">
        {topFailedModules.length === 0 ? (
          <EmptyState title="No failures" description="No failing modules to report" compact />
        ) : (
          <Group align="center" gap="xl">
            <Stack gap="sm" style={{ flex: 1, maxWidth: 420 }}>
              {topFailedModules.map((m, i) => (
                <Group key={i} justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm" fw={600} c="dimmed">{i + 1}</Text>
                    <Text size="sm">{m.label}</Text>
                  </Group>
                  <Group gap="sm" wrap="nowrap">
                    <Box2 value={m.value} max={topFailedModules[0].value} />
                    <Text size="sm" fw={600} w={28} ta="right">{m.value}</Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Group>
        )}
      </Section>
    </Container>
  );
}

function Box2({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ width: 140, height: 8, borderRadius: 4, backgroundColor: 'var(--mantine-color-gray-1)', overflow: 'hidden' }}>
      <div style={{ width: `${(value / Math.max(1, max)) * 100}%`, height: '100%', backgroundColor: 'var(--mantine-color-red-5)', borderRadius: 4 }} />
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  color: 'var(--mantine-color-dimmed)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '8px',
  whiteSpace: 'nowrap',
};
