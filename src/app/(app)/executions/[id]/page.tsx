'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Paper, Group, Text, Badge, SimpleGrid, Stack, Loader, Center, Image, Code } from '@mantine/core';
import Link from 'next/link';
import { useExecution, useExecutionLogs, usePollExecution } from '../../../../features/executions/hooks';

import { appConfig } from '../../../../config';

const statusColor: Record<string, string> = {
  QUEUED: 'gray',
  RUNNING: 'blue',
  PASSED: 'green',
  FAILED: 'red',
  ERROR: 'orange',
  CANCELLED: 'yellow',
  SKIPPED: 'cyan',
};

const logLevelColor: Record<string, string> = {
  INFO: 'blue',
  STEP: 'violet',
  SUCCESS: 'green',
  ERROR: 'red',
  WARN: 'orange',
};

export default function ExecutionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: execution, isLoading } = useExecution(id);
  const isRunning = execution?.status === 'RUNNING';
  usePollExecution(id, isRunning);
  const { data: logs } = useExecutionLogs(id, true);
  const [screenshotFailed, setScreenshotFailed] = useState(false);

  if (isLoading) return <Center h={400}><Loader /></Center>;
  if (!execution) return <Center h={400}><Text c="dimmed">Execution not found</Text></Center>;

  const duration = execution.durationMs != null ? (execution.durationMs / 1000).toFixed(2) : null;
  const hasScreenshot = !!execution.screenshotPath && !screenshotFailed;

  // Build an absolute URL to the backend storage endpoint (/storage on the API host)
  const screenshotUrl = execution.screenshotPath
    ? `${appConfig.storageBaseUrl}/${execution.screenshotPath}`
    : null;

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={600} size="xl" ff="monospace">{execution.number}</Text>
          <Badge color={statusColor[execution.status]} variant="light" size="lg">{execution.status}</Badge>
        </Group>
      </Group>

      <Paper p="md" withBorder mb="md">
        <Text fw={600} size="sm" mb="sm">Test Case</Text>
        <Link href={`/projects/${execution.project.slug}/test-cases/${execution.testCase.code}`}>
          <Text size="sm" fw={500}>{execution.testCase.title}</Text>
        </Link>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 4 }} mb="md">
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Project</Text>
          <Text size="sm" fw={500}>{execution.project.name}</Text>
          <Text size="xs" c="dimmed">{execution.project.code}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Environment</Text>
          <Text size="sm">{execution.environment ?? '—'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Base URL</Text>
          <Text size="sm">{execution.project.baseUrl ?? '—'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Framework</Text>
          <Text size="sm">{execution.project.framework ?? '—'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Browser</Text>
          <Text size="sm">{execution.browser ?? '—'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Duration</Text>
          <Text size="sm">{duration ? `${duration}s` : '—'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Started At</Text>
          <Text size="sm">{execution.startedAt ? new Date(execution.startedAt).toLocaleString() : '—'}</Text>
        </Paper>
        <Paper p="md" withBorder>
          <Text size="xs" c="dimmed">Finished At</Text>
          <Text size="sm">{execution.finishedAt ? new Date(execution.finishedAt).toLocaleString() : '—'}</Text>
        </Paper>
      </SimpleGrid>

      {execution.error && (
        <Paper p="md" withBorder mb="md" style={{ borderColor: 'var(--mantine-color-red-4)' }}>
          <Text fw={600} size="sm" c="red" mb={4}>Error</Text>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{execution.error}</Text>
        </Paper>
      )}

      <Stack gap="md">
        {hasScreenshot ? (
          <Paper p="md" withBorder>
            <Text fw={600} size="sm" mb="sm">Screenshot</Text>
            <Image
              src={screenshotUrl}
              alt="Execution screenshot"
              radius="sm"
              fit="contain"
              style={{ maxHeight: 480 }}
              onError={() => setScreenshotFailed(true)}
            />
          </Paper>
        ) : (
          <Paper p="md" withBorder>
            <Text fw={600} size="sm" mb="sm">Screenshot</Text>
            <Text size="sm" c="dimmed">No screenshot available</Text>
          </Paper>
        )}

        <Paper p="md" withBorder>
          <Text fw={600} size="sm" mb="sm">Logs</Text>
          {!logs || logs.length === 0 ? (
            <Text c="dimmed" size="sm">No logs available</Text>
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
        </Paper>

        {execution.generatedScript && (
          <Paper p="md" withBorder>
            <Text fw={600} size="sm" mb="sm">Generated Script</Text>
            <Code block style={{ maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
              {execution.generatedScript}
            </Code>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}