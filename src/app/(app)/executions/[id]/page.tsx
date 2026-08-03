'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Paper, Group, Text, SimpleGrid, Stack, Loader, Center, Image, Code, Tabs, ActionIcon, Badge } from '@mantine/core';
import { IconArrowLeft, IconFileText, IconList, IconFileCode, IconPhoto } from '@tabler/icons-react';
import { useExecution, useExecutionLogs, usePollExecution } from '../../../../features/executions/hooks';
import { PageHeader } from '../../../../components/ui/page-header';
import { Section } from '../../../../components/ui/section';
import { ExecutionStatusBadge } from '../../../../components/ui/badges';
import { EmptyState } from '../../../../components/ui/empty-state';
import { ROUTES } from '../../../../constants/routes';
import { appConfig } from '../../../../config';

const logLevelColor: Record<string, string> = {
  INFO: 'blue',
  STEP: 'violet',
  SUCCESS: 'green',
  ERROR: 'red',
  WARN: 'orange',
};

type TabValue = 'overview' | 'logs' | 'script';

export default function ExecutionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const router = useRouter();
  const { data: execution, isLoading } = useExecution(id);
  const isRunning = execution?.status === 'RUNNING';
  usePollExecution(id, isRunning);
  const { data: logs } = useExecutionLogs(id, true);
  const [screenshotFailed, setScreenshotFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!execution) return <Center h={400}><Text c="dimmed">Execution not found</Text></Center>;

  const duration = execution.durationMs != null ? (execution.durationMs / 1000).toFixed(2) : null;
  const hasScreenshot = !!execution.screenshotPath && !screenshotFailed;
  const screenshotUrl = execution.screenshotPath ? `${appConfig.storageBaseUrl}/${execution.screenshotPath}` : null;

  const details: { label: string; value: React.ReactNode }[] = [
    { label: 'Status', value: <ExecutionStatusBadge value={execution.status} /> },
    { label: 'Project', value: execution.project.name },
    { label: 'Test Case', value: execution.testCase.title },
    { label: 'Environment', value: execution.environment ?? '\u2014' },
    { label: 'Base URL', value: execution.project.baseUrl ?? '\u2014' },
    { label: 'Framework', value: execution.project.framework ?? '\u2014' },
    { label: 'Browser', value: execution.browser ?? '\u2014' },
    { label: 'Duration', value: duration ? `${duration}s` : '\u2014' },
    { label: 'Started At', value: execution.startedAt ? new Date(execution.startedAt).toLocaleString() : '\u2014' },
    { label: 'Finished At', value: execution.finishedAt ? new Date(execution.finishedAt).toLocaleString() : '\u2014' },
  ];

  return (
    <Container size="xl">
      <PageHeader
        title={
          <Group gap="sm" wrap="nowrap">
            <ActionIcon onClick={() => router.push(ROUTES.PROJECT_EXECUTIONS(execution.project.slug))} variant="subtle" aria-label="Back to executions">
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Text fw={700} ff="monospace">{execution.number}</Text>
            <ExecutionStatusBadge value={execution.status} />
          </Group>
        }
        description={`${execution.testCase.title} · ${execution.project.name}`}
      />

      {execution.error && (
        <Paper p="md" withBorder mb="md" style={{ borderColor: 'var(--mantine-color-red-4)', backgroundColor: 'var(--mantine-color-red-0)' }}>
          <Text fw={600} size="sm" c="red" mb={4}>Error</Text>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{execution.error}</Text>
        </Paper>
      )}

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as TabValue)} mb="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="overview" leftSection={<IconFileText size={14} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="logs" leftSection={<IconList size={14} />}>Logs</Tabs.Tab>
          <Tabs.Tab value="script" leftSection={<IconFileCode size={14} />}>Generated Script</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Stack gap="md">
            <Section title="Execution Details">
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                {details.map((d) => (
                  <Paper key={d.label} p="md" withBorder>
                    <Text size="xs" c="dimmed">{d.label}</Text>
                    <div style={{ marginTop: 4 }}>{d.value}</div>
                  </Paper>
                ))}
              </SimpleGrid>
            </Section>

            <Section title="Screenshot">
              {hasScreenshot ? (
                <Image
                  src={screenshotUrl ?? ''}
                  alt="Execution screenshot"
                  radius="sm"
                  fit="contain"
                  style={{ maxHeight: 480 }}
                  onError={() => setScreenshotFailed(true)}
                />
              ) : (
                <EmptyState title="No screenshot available" description="This execution did not capture a screenshot" icon={IconPhoto} compact />
              )}
            </Section>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="logs">
          <Section title="Execution Logs">
            {!logs || logs.length === 0 ? (
              <EmptyState title="No logs available" description="Logs will appear once the execution starts running" icon={IconList} compact />
            ) : (
              <Stack gap={2}>
                {logs.map((log) => (
                  <Group key={log.id} gap="sm" wrap="nowrap" align="flex-start">
                    <Badge size="xs" color={logLevelColor[log.level] ?? 'gray'} style={{ flexShrink: 0, minWidth: 64 }}>{log.level}</Badge>
                    <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>{log.message}</Text>
                  </Group>
                ))}
              </Stack>
            )}
          </Section>
        </Tabs.Panel>

        <Tabs.Panel value="script">
          <Section title="Generated Script">
            {execution.generatedScript ? (
              <Code block style={{ maxHeight: 500, overflow: 'auto', fontSize: 12 }}>
                {execution.generatedScript}
              </Code>
            ) : (
              <EmptyState title="No script generated" description="This execution did not record a generated script" icon={IconFileCode} compact />
            )}
          </Section>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
