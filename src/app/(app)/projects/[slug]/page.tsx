'use client';

import { useParams } from 'next/navigation';
import { Container, SimpleGrid, Group, Text, Loader, Center, Badge, Stack, Paper } from '@mantine/core';
import { IconFolder, IconTestPipe, IconRobot, IconPlayerPlay, IconCircleCheck, IconPencil, IconLink, IconCalendar } from '@tabler/icons-react';
import Link from 'next/link';
import { useProjectBySlug } from '../../../../features/projects/hooks';
import { useProjectReport } from '../../../../features/reports/hooks';
import { useTestCases } from '../../../../features/test-cases/hooks';
import { PageHeader } from '../../../../components/ui/page-header';
import { StatCard } from '../../../../components/ui/stat-card';
import { Section } from '../../../../components/ui/section';
import { DonutChart } from '../../../../components/ui/charts';
import { ExecutionStatusBadge } from '../../../../components/ui/badges';
import { EmptyState } from '../../../../components/ui/empty-state';
import { ROUTES } from '../../../../constants/routes';
import type { Execution } from '../../../../features/executions/types';

function formatDuration(ms: number | null): string {
  if (!ms) return '\u2014';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ProjectOverviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading: projectLoading } = useProjectBySlug(slug as string);
  const { data: report } = useProjectReport(project?.id ?? '');
  const { data: totalData } = useTestCases(project?.id ?? '', { page: 1, limit: 1 });
  const { data: automationData } = useTestCases(project?.id ?? '', { type: 'AUTOMATION', page: 1, limit: 1 });

  if (projectLoading) return <Center h={400}><Loader /></Center>;
  if (!project) return <Center h={400}><Text c="dimmed">Project not found</Text></Center>;

  const stat = report?.executionStatus ?? { PASSED: 0, FAILED: 0, ERROR: 0, SKIPPED: 0, RUNNING: 0 };
  const completed = stat.PASSED + stat.FAILED + stat.ERROR + stat.SKIPPED;
  const passRate = completed > 0 ? Math.round((stat.PASSED / completed) * 100) : 0;
  const totalTestCases = totalData?.pagination?.total ?? 0;
  const automationCount = automationData?.pagination?.total ?? 0;

  const statusSegments = [
    { label: 'Passed', value: stat.PASSED, color: 'var(--mantine-color-green-6)' },
    { label: 'Failed', value: stat.FAILED, color: 'var(--mantine-color-red-6)' },
    { label: 'Error', value: stat.ERROR, color: 'var(--mantine-color-orange-6)' },
    { label: 'Running', value: stat.RUNNING, color: 'var(--mantine-color-blue-6)' },
    { label: 'Skipped', value: stat.SKIPPED, color: 'var(--mantine-color-gray-5)' },
  ];

  return (
    <Container size="xl">
      <PageHeader
        title={project.name}
        description={project.description || 'No description'}
        actions={
          <>
            <Badge color={project.status === 'ACTIVE' ? 'green' : 'cyan'} variant="dot">{project.status}</Badge>
            <Link href={ROUTES.PROJECT_EDIT(project.slug)}>
              <Group gap={6} style={{ cursor: 'pointer' }}>
                <IconPencil size={15} />
                <Text size="sm" fw={500}>Edit</Text>
              </Group>
            </Link>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
        <StatCard title="Test Cases" value={totalTestCases} icon={<IconTestPipe size={22} />} color="violet" description="Total test cases" />
        <StatCard title="Automated" value={automationCount} icon={<IconRobot size={22} />} color="indigo" description="Automation test cases" />
        <StatCard title="Executions" value={report?.totalExecutions ?? 0} icon={<IconPlayerPlay size={22} />} color="cyan" description="All-time executions" />
        <StatCard title="Pass Rate" value={completed > 0 ? `${passRate}%` : 'N/A'} description={`${stat.PASSED} passed / ${completed} completed`} icon={<IconCircleCheck size={22} />} color="green" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} mb="md">
        <Section title="Execution Results" description="Distribution of execution statuses">
          <Group align="center" gap="lg">
            <DonutChart data={statusSegments.filter((s) => s.value > 0)} size={120} thickness={14} />
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

        <Section title="Recent Executions" description="Latest results across all test cases">
          {(report?.recentExecutions ?? []).length === 0 ? (
            <EmptyState title="No executions yet" description="Run a test from the Automation tab" compact />
          ) : (
            <Stack gap="sm">
              {(report?.recentExecutions ?? []).slice(0, 6).map((ex) => (
                <Group key={ex.id} justify="space-between" wrap="nowrap">
                  <Link href={`/executions/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0, flex: 1 }}>
                    <Group gap="sm" wrap="nowrap">
                      <ExecutionStatusBadge value={ex.status as Execution['status']} size="sm" />
                      <Text size="sm" fw={500} ff="monospace">{ex.number}</Text>
                      <Text size="sm" truncate>{ex.testCase.title}</Text>
                    </Group>
                  </Link>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{formatDuration(ex.durationMs)}</Text>
                </Group>
              ))}
            </Stack>
          )}
        </Section>

        <Section title="Project Details" description="Configuration overview">
          <Stack gap="xs">
            <Group gap="sm" wrap="nowrap">
              <IconFolder size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" c="dimmed" w={100}>Code</Text>
              <Text size="sm" fw={600} ff="monospace">{project.code}</Text>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <IconRobot size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" c="dimmed" w={100}>Framework</Text>
              <Text size="sm" fw={600}>{project.framework}</Text>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <IconPlayerPlay size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" c="dimmed" w={100}>Browser</Text>
              <Text size="sm" fw={600}>{project.browser}</Text>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <IconCalendar size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="sm" c="dimmed" w={100}>Environment</Text>
              <Text size="sm" fw={600}>{project.environment || '\u2014'}</Text>
            </Group>
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <IconLink size={15} style={{ color: 'var(--mantine-color-dimmed)', marginTop: 3 }} />
              <Text size="sm" c="dimmed" w={100} style={{ flexShrink: 0 }}>Base URL</Text>
              <Text size="sm" fw={600} style={{ wordBreak: 'break-all' }}>{project.baseUrl || '\u2014'}</Text>
            </Group>
          </Stack>
        </Section>
      </SimpleGrid>

      <Section
        title="Quick Actions"
        actions={
          <Link href={ROUTES.PROJECT_TEST_CASES(project.slug)} style={{ fontSize: 13, textDecoration: 'none' }}>
            Manage Test Cases
          </Link>
        }
      >
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper p="md" radius="md" withBorder component={Link} href={ROUTES.PROJECT_AUTOMATION(project.slug)} style={{ textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s ease' }}>
            <Group gap="sm">
              <IconRobot size={20} style={{ color: 'var(--mantine-color-violet-6)' }} />
              <div>
                <Text fw={600} size="sm">Run Automation</Text>
                <Text size="xs" c="dimmed">Execute automated test cases</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder component={Link} href={ROUTES.PROJECT_EXECUTIONS(project.slug)} style={{ textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s ease' }}>
            <Group gap="sm">
              <IconPlayerPlay size={20} style={{ color: 'var(--mantine-color-cyan-6)' }} />
              <div>
                <Text fw={600} size="sm">View Executions</Text>
                <Text size="xs" c="dimmed">Browse execution history</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder component={Link} href={ROUTES.PROJECT_REPORTS(project.slug)} style={{ textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s ease' }}>
            <Group gap="sm">
              <IconFolder size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <div>
                <Text fw={600} size="sm">View Reports</Text>
                <Text size="xs" c="dimmed">Analyze test results</Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>
      </Section>
    </Container>
  );
}
